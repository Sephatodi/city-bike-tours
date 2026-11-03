import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { SITES, MAIN_MALL, LOOP_ORDER } from "../data";
import Icon, { iconSvgMarkup } from "./Icon";
import RiderIcon from "./RiderIcon";
import "./HeritageMap.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_TILE_URL = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const SITE_BY_ID = Object.fromEntries(SITES.map((site) => [site.id, site]));
const LOOP_COORDINATES = [MAIN_MALL, ...LOOP_ORDER.map((id) => SITE_BY_ID[id].coords), MAIN_MALL];
const TRAIL_ROUTE_MODULES = import.meta.glob("../data/trail-route.json");
const ROUTE_STYLES = {
  complete: { color: "#E5683F", dashArray: undefined },
  loop: { color: "#76B582", dashArray: "12 7" },
  own: { color: "#E6B331", dashArray: "3 8" },
};
const EARTH_RADIUS_METERS = 6371008.8;

function makeIcon(color, icon, highlighted = false) {
  const size = highlighted ? 42 : 36;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${highlighted ? "#D4A017" : color};
      border:2px solid #F5EDD9;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:#F5EDD9;
      box-shadow:${highlighted ? "0 0 0 5px rgba(212,160,23,.32)," : ""}0 2px 8px rgba(0,0,0,0.5);
    ">${iconSvgMarkup(icon, 18)}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -20],
  });
}

const meetIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:44px;height:44px;
    background:#D4A017;
    border:3px solid #F5EDD9;
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    color:#0D0805;
    box-shadow:0 2px 12px rgba(212,160,23,0.6);
  ">${iconSvgMarkup("mapPin", 22)}</div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -24],
});

function riderIcon(facingWest = false) {
  const svg = renderToStaticMarkup(createElement(RiderIcon, { size: 64, color: "#F5B800" }));
  return L.divIcon({
    className: "heritage-trail-rider-marker",
    html: `<div style="width:64px;height:50px;filter:drop-shadow(1px 1px 0 #092014) drop-shadow(-1px -1px 0 #092014) drop-shadow(0 2px 4px rgba(0,0,0,.9));transform:scaleX(${facingWest ? -1 : 1})">${svg}</div>`,
    iconSize: [64, 50],
    iconAnchor: [32, 25],
  });
}

function isValidTrailRoute(route) {
  if (!route || !Array.isArray(route.coordinates) || route.coordinates.length < 50
    || !Array.isArray(route.stops) || route.stops.length !== LOOP_ORDER.length + 2
    || !Number.isFinite(route.distanceMeters) || route.distanceMeters < 4000 || route.distanceMeters > 30000
    || !Number.isFinite(route.durationSeconds) || typeof route.attribution !== "string") return false;

  const coordinatesAreValid = route.coordinates.every((point) => (
    Array.isArray(point) && point.length >= 2
    && Number.isFinite(point[0]) && Number.isFinite(point[1])
    && point[0] >= -24.8 && point[0] <= -24.5
    && point[1] >= 25.8 && point[1] <= 26.1
  ));
  const expectedStopIds = ["mainmall", ...LOOP_ORDER, "mainmall"];
  const stopsAreValid = route.stops.every((stop, index) => (
    stop?.id === expectedStopIds[index]
    && Number.isInteger(stop.index) && stop.index >= 0 && stop.index < route.coordinates.length
    && Number.isFinite(stop.atMeters) && stop.atMeters >= 0
    && (index === 0 || (stop.index > route.stops[index - 1].index && stop.atMeters > route.stops[index - 1].atMeters))
  ));

  return coordinatesAreValid && stopsAreValid
    && route.stops[0].index === 0
    && route.stops.at(-1).index === route.coordinates.length - 1
    && typeof route.provider === "string" && typeof route.profile === "string";
}

function MapViewport({ bounds, markerRefs, request, programmaticMoveRef }) {
  const map = useMap();

  useEffect(() => {
    const markProgrammaticMove = () => {
      programmaticMoveRef.current = true;
      const fallbackTimer = window.setTimeout(() => {
        programmaticMoveRef.current = false;
      }, 1200);
      map.once("moveend", () => {
        window.clearTimeout(fallbackTimer);
        window.setTimeout(() => {
          programmaticMoveRef.current = false;
        }, 0);
      });
    };

    if (request?.siteId) {
      const site = SITE_BY_ID[request.siteId];
      if (!site) return;
      markProgrammaticMove();
      map.flyTo(site.coords, 18, { duration: 0.8 });
      markerRefs.current[site.id]?.openPopup();
      return;
    }

    markProgrammaticMove();
    map.fitBounds(bounds.pad(0.2), { maxZoom: 16 });
  }, [bounds, map, markerRefs, programmaticMoveRef, request]);

  return null;
}

function MapInteractionWatcher({ programmaticMoveRef, onUserInteraction }) {
  const map = useMap();

  useEffect(() => {
    const onInteraction = () => {
      if (!programmaticMoveRef.current) onUserInteraction();
    };
    map.on("dragstart zoomstart", onInteraction);
    return () => map.off("dragstart zoomstart", onInteraction);
  }, [map, onUserInteraction, programmaticMoveRef]);

  return null;
}

function haversine(a, b) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const lat1 = radians(a[0]);
  const lat2 = radians(b[0]);
  const dLat = radians(b[0] - a[0]);
  const dLng = radians(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

function locateOnRoute(coordinates, cumulative, distance) {
  let low = 0;
  let high = cumulative.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (cumulative[middle] < distance) low = middle + 1;
    else high = middle;
  }
  const segment = Math.max(0, low - 1);
  const segmentLength = cumulative[segment + 1] - cumulative[segment];
  const progress = segmentLength > 0 ? (distance - cumulative[segment]) / segmentLength : 0;
  const start = coordinates[segment];
  const end = coordinates[Math.min(segment + 1, coordinates.length - 1)];
  return {
    segment,
    position: [
      start[0] + (end[0] - start[0]) * progress,
      start[1] + (end[1] - start[1]) * progress,
    ],
  };
}

function TrailPlayback({
  route,
  playing,
  canRun,
  speed,
  follow,
  restartKey,
  markerRef,
  progressRef,
  onArrive,
  onLeaveStop,
}) {
  const map = useMap();
  const distanceRef = useRef(0);
  const stopIndexRef = useRef(0);
  const stopPauseRef = useRef(0);
  const lastFrameRef = useRef(null);
  const headingWestRef = useRef(false);
  const activeStopRef = useRef(null);
  const cumulative = useMemo(() => {
    const values = [0];
    for (let index = 1; index < route.coordinates.length; index += 1) {
      values.push(values[index - 1] + haversine(route.coordinates[index - 1], route.coordinates[index]));
    }
    return values;
  }, [route]);
  const routeGeometryLength = cumulative.at(-1);
  const stops = useMemo(() => route.stops.slice(1, -1), [route]);
  const movementDurationMilliseconds = Math.max(1, 50000 - stops.length * 2000);

  useEffect(() => {
    distanceRef.current = 0;
    stopIndexRef.current = 0;
    stopPauseRef.current = 0;
    activeStopRef.current = null;
    headingWestRef.current = false;
    markerRef.current?.setLatLng(route.coordinates[0]);
    markerRef.current?.setIcon(riderIcon(false));
    progressRef.current?.setLatLngs([route.coordinates[0]]);
    onLeaveStop();
  }, [markerRef, onLeaveStop, progressRef, restartKey, route]);

  useEffect(() => {
    if (!playing || !canRun) {
      lastFrameRef.current = null;
      return undefined;
    }

    let frameId;
    const tick = (timestamp) => {
      const previous = lastFrameRef.current ?? timestamp;
      let movingMilliseconds = Math.min(timestamp - previous, 100);
      lastFrameRef.current = timestamp;

      if (stopPauseRef.current > 0) {
        const pausedFor = Math.min(stopPauseRef.current, movingMilliseconds);
        stopPauseRef.current -= pausedFor;
        movingMilliseconds -= pausedFor;
        if (stopPauseRef.current === 0 && activeStopRef.current) {
          activeStopRef.current = null;
          onLeaveStop();
        }
      }

      const metersPerMillisecond = routeGeometryLength / movementDurationMilliseconds * speed;
      if (movingMilliseconds > 0) {
        const nextStop = stops[stopIndexRef.current];
        const stopDistance = nextStop?.atMeters ?? routeGeometryLength;
        const millisecondsToStop = (stopDistance - distanceRef.current) / metersPerMillisecond;

        if (nextStop && millisecondsToStop <= movingMilliseconds) {
          distanceRef.current = stopDistance;
          stopIndexRef.current += 1;
          stopPauseRef.current = 2000;
          activeStopRef.current = nextStop.id;
          onArrive(nextStop.id);
        } else {
          distanceRef.current += metersPerMillisecond * movingMilliseconds;
        }

        if (distanceRef.current >= routeGeometryLength) {
          distanceRef.current = 0;
          stopIndexRef.current = 0;
          activeStopRef.current = null;
          stopPauseRef.current = 0;
          onLeaveStop();
        }
      }

      const { segment, position } = locateOnRoute(route.coordinates, cumulative, distanceRef.current);
      markerRef.current?.setLatLng(position);
      const next = route.coordinates[Math.min(segment + 1, route.coordinates.length - 1)];
      const longitudeDelta = next[1] - position[1];
      const isFacingWest = longitudeDelta < -0.000005;
      if (isFacingWest !== headingWestRef.current) {
        headingWestRef.current = isFacingWest;
        markerRef.current?.setIcon(riderIcon(isFacingWest));
      }
      const travelled = route.coordinates.slice(0, segment + 1);
      travelled.push(position);
      progressRef.current?.setLatLngs(travelled);
      if (follow) map.panTo(position, { animate: false });
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameId);
      lastFrameRef.current = null;
    };
  }, [canRun, cumulative, follow, map, markerRef, movementDurationMilliseconds, onArrive, onLeaveStop, playing, route, routeGeometryLength, speed, stops]);

  return null;
}

function getReducedMotionPreference() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HeritageMap({ height = "480px", routeId = "complete", trail = false }) {
  const routeStyle = ROUTE_STYLES[routeId] || ROUTE_STYLES.complete;
  const bounds = useMemo(() => L.latLngBounds([MAIN_MALL, ...SITES.map((site) => site.coords)]), []);
  const markerRefs = useRef({});
  const bikeMarkerRef = useRef(null);
  const progressRef = useRef(null);
  const programmaticMoveRef = useRef(false);
  const wrapperRef = useRef(null);
  const reducedMotionRef = useRef(getReducedMotionPreference());
  const [mapRequest, setMapRequest] = useState(null);
  const [route, setRoute] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [follow, setFollow] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [isInView, setIsInView] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(() => (
    typeof document === "undefined" || document.visibilityState === "visible"
  ));
  const [reducedMotion, setReducedMotion] = useState(reducedMotionRef.current);
  const [activeStopId, setActiveStopId] = useState(null);
  const activeStopIdRef = useRef(null);
  const [announcement, setAnnouncement] = useState("");

  const normalSiteIcons = useMemo(() => Object.fromEntries(
    SITES.map((site) => [site.id, makeIcon(site.color, site.icon)]),
  ), []);
  const highlightedSiteIcons = useMemo(() => Object.fromEntries(
    SITES.map((site) => [site.id, makeIcon(site.color, site.icon, true)]),
  ), []);

  useEffect(() => {
    if (!trail) {
      setRoute(null);
      setPlaying(false);
      return undefined;
    }

    let cancelled = false;
    const loadTrailRoute = TRAIL_ROUTE_MODULES["../data/trail-route.json"];
    if (!loadTrailRoute) {
      console.info("Heritage trail route is missing or invalid; showing the straight-line fallback.");
      setRoute(null);
      return () => {
        cancelled = true;
      };
    }

    loadTrailRoute()
      .then((module) => {
        if (cancelled) return;
        const loadedRoute = module.default;
        if (!isValidTrailRoute(loadedRoute)) {
          console.info("Heritage trail route is missing or invalid; showing the straight-line fallback.");
          setRoute(null);
        } else {
          setRoute(loadedRoute);
          setPlaying(!reducedMotionRef.current);
        }
      })
      .catch(() => {
        if (cancelled) return;
        console.info("Heritage trail route is missing or invalid; showing the straight-line fallback.");
        setRoute(null);
      });
    return () => {
      cancelled = true;
    };
  }, [trail]);

  useEffect(() => {
    const onPreferenceChange = (event) => {
      reducedMotionRef.current = event.matches;
      setReducedMotion(event.matches);
      if (event.matches) setPlaying(false);
    };
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    preference.addEventListener?.("change", onPreferenceChange);
    return () => preference.removeEventListener?.("change", onPreferenceChange);
  }, []);

  useEffect(() => {
    if (!trail || !wrapperRef.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [trail]);

  useEffect(() => {
    if (!trail) return undefined;
    const onVisibilityChange = () => setIsDocumentVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [trail]);

  const onArrive = useCallback((siteId) => {
    const site = SITE_BY_ID[siteId];
    if (!site) return;
    markerRefs.current[siteId]?.setIcon(highlightedSiteIcons[siteId]);
    markerRefs.current[siteId]?.openTooltip();
    activeStopIdRef.current = siteId;
    setActiveStopId(siteId);
    setAnnouncement(`Arriving at ${site.name}`);
  }, [highlightedSiteIcons]);

  const onLeaveStop = useCallback(() => {
    const activeId = activeStopIdRef.current;
    if (activeId) {
      markerRefs.current[activeId]?.setIcon(normalSiteIcons[activeId]);
      markerRefs.current[activeId]?.closeTooltip();
    }
    activeStopIdRef.current = null;
    setActiveStopId(null);
  }, [normalSiteIcons]);

  const userInteracted = useCallback(() => setFollow(false), []);
  const canRun = isInView && isDocumentVisible;
  const routeCoordinates = trail && route ? route.coordinates : LOOP_COORDINATES;

  const requestSite = (siteId) => {
    if (trail) setFollow(false);
    setMapRequest({ siteId });
  };
  const restart = () => {
    setActiveStopId(null);
    setAnnouncement("");
    setFollow(false);
    setRestartKey((key) => key + 1);
    setPlaying(true);
  };

  return (
    <div ref={wrapperRef} className={trail ? "heritage-map-wrapper heritage-map-wrapper-trail" : "heritage-map-wrapper"}>
      <div style={{ height, borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(212,160,23,0.25)" }}>
        <MapContainer
          center={MAIN_MALL}
          zoom={15}
          minZoom={12}
          maxZoom={19}
          style={{ height: "100%", width: "100%" }}
          zoomControl
          scrollWheelZoom
          doubleClickZoom
          touchZoom
        >
          <MapViewport
            bounds={bounds}
            markerRefs={markerRefs}
            request={mapRequest}
            programmaticMoveRef={programmaticMoveRef}
          />
          {trail && <MapInteractionWatcher programmaticMoveRef={programmaticMoveRef} onUserInteraction={userInteracted} />}
          <TileLayer
            attribution={MAPBOX_TOKEN
              ? '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
            url={MAPBOX_TILE_URL}
            tileSize={MAPBOX_TOKEN ? 512 : 256}
            zoomOffset={MAPBOX_TOKEN ? -1 : 0}
            maxZoom={19}
          />
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              ...routeStyle,
              weight: 6,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
              className: trail ? "heritage-street-route" : "heritage-straight-route",
            }}
          />
          {trail && route && (
            <>
              <Polyline
                ref={progressRef}
                positions={[route.coordinates[0]]}
                pathOptions={{ color: "#D4A017", weight: 7, opacity: 1, lineCap: "round", lineJoin: "round" }}
              />
              <Marker
                ref={bikeMarkerRef}
                position={route.coordinates[0]}
                icon={riderIcon(false)}
                keyboard={false}
                interactive={false}
              />
              <TrailPlayback
                route={route}
                playing={playing}
                canRun={canRun}
                speed={speed}
                follow={follow}
                restartKey={restartKey}
                markerRef={bikeMarkerRef}
                progressRef={progressRef}
                onArrive={onArrive}
                onLeaveStop={onLeaveStop}
              />
            </>
          )}
          <Circle
            center={MAIN_MALL}
            radius={600}
            pathOptions={{ color: "#C1440E", fillColor: "#C1440E", fillOpacity: 0.06, weight: 1.5, dashArray: "6 4" }}
          />
          <Marker position={MAIN_MALL} icon={meetIcon}>
            <Popup>
              <div style={{ fontFamily: "Outfit, sans-serif", minWidth: "160px" }}>
                <strong style={{ color: "#C1440E", fontSize: "13px" }}><Icon name="mapPin" size={14} /> Main Mall</strong>
                <div style={{ fontSize: "11px", marginTop: "4px", color: "#555" }}>
                  Meeting point for all City Bike Tours rides.<br />
                  <em>Look for the orange flag.</em>
                </div>
              </div>
            </Popup>
          </Marker>
          {SITES.map((site) => (
            <Marker
              key={site.id}
              ref={(marker) => {
                if (marker) markerRefs.current[site.id] = marker;
              }}
              position={site.coords}
              icon={normalSiteIcons[site.id]}
              eventHandlers={{
                click: () => {
                  if (trail) setFollow(false);
                  setMapRequest({ siteId: site.id });
                },
              }}
            >
              {trail && <Tooltip direction="top" offset={[0, -18]}>{site.name}</Tooltip>}
              <Popup>
                <div style={{ fontFamily: "Outfit, sans-serif", minWidth: "180px" }}>
                  <strong style={{ color: site.color, fontSize: "13px" }}><Icon name={site.icon} size={14} /> {site.name}</strong>
                  <div style={{ fontSize: "11px", marginTop: "4px", color: "#555", fontWeight: 600 }}>
                    {site.street}, Gaborone
                  </div>
                  <div style={{ fontSize: "11px", marginTop: "4px", color: "#555", lineHeight: "1.4" }}>
                    {site.short}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {trail && route && (
        <div className="heritage-trail-controls">
          <div className="heritage-trail-control-buttons">
            <button type="button" onClick={() => setPlaying((current) => !current)} aria-label={playing ? "Pause trail" : "Play trail"}>
              {playing ? "Pause" : "Play"}
            </button>
            <button type="button" onClick={restart} aria-label="Restart trail">Restart</button>
            <button
              type="button"
              onClick={() => setSpeed((current) => (current === 1 ? 2 : 1))}
              aria-label={`Set trail speed to ${speed === 1 ? "2x" : "1x"}`}
              aria-pressed={speed === 2}
            >
              {speed}x
            </button>
            <button
              type="button"
              onClick={() => setFollow((current) => !current)}
              aria-label="Follow the bike"
              aria-pressed={follow}
            >
              Follow the bike
            </button>
          </div>
          <p className="heritage-trail-route-meta">
            Route length {(route.distanceMeters / 1000).toFixed(1)} km along streets
            <span aria-hidden="true"> · </span>
            {route.attribution}
          </p>
          <p className="heritage-trail-live" aria-live="polite">{announcement}</p>
        </div>
      )}
      <div
        className="heritage-map-site-buttons"
        style={trail ? undefined : {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        {SITES.map((site) => (
          <button
            key={site.id}
            type="button"
            onClick={() => requestSite(site.id)}
            className={trail && activeStopId === site.id ? "is-active-stop" : ""}
            aria-pressed={trail ? activeStopId === site.id : undefined}
            style={trail ? undefined : {
              padding: "10px 12px",
              backgroundColor: "rgba(245,237,217,0.05)",
              border: `1px solid ${site.color}66`,
              borderRadius: "3px",
              color: "#F5EDD9",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "12px",
            }}
          >
            <Icon name={site.icon} size={14} style={{ marginRight: "8px" }} />{site.name}
          </button>
        ))}
        <button
          type="button"
          className="heritage-map-reset"
          style={trail ? undefined : {
            padding: "10px 12px",
            backgroundColor: "#D4A017",
            border: "1px solid #D4A017",
            borderRadius: "3px",
            color: "#0D0805",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 700,
          }}
          onClick={() => {
            setMapRequest({ reset: true });
            if (trail) setFollow(true);
          }}
        >
          Reset view
        </button>
      </div>
      {trail && reducedMotion && !playing && (
        <p className="heritage-trail-motion-note">Reduced motion is on. Play the trail when you are ready.</p>
      )}
    </div>
  );
}
