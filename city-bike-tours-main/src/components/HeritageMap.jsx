import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { SITES, MAIN_MALL, LOOP_ORDER } from "../data";
import Icon, { iconSvgMarkup } from "./Icon";
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
  const svg = `<svg viewBox="0 0 64 64" width="42" height="42" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="44" r="11" stroke="#F5B800" stroke-width="4"/><circle cx="46" cy="44" r="11" stroke="#F5B800" stroke-width="4"/><path d="M18 44l10-16h10l8 16M28 28l-4 16M38 28l4 16M24 28h8" stroke="#F5B800" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="33" cy="19" r="4" fill="#F5B800"/></svg>`;
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
  if (!coordinatesAreValid) return false;

  const stopIds = route.stops.map((stop) => stop?.id);
  const expectedStopIds = ["mainmall-start", ...LOOP_ORDER, "mainmall-end"];
  const stopIndexes = route.stops.map((stop) => stop?.index);
  const indexesAreValid = stopIndexes.every((index, i) => (
    Number.isInteger(index) && index >= 0 && index < route.coordinates.length
    && (i === 0 || index > stopIndexes[i - 1])
  ));
  return indexesAreValid && expectedStopIds.every((id, index) => stopIds[index] === id);
}

function routeDistanceMeters(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return 0;
  let distance = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    const [lat1, lng1] = coordinates[index - 1];
    const [lat2, lng2] = coordinates[index];
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;
    const haversine = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
    distance += 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }
  return distance;
}

function TrailRouteRider({ route }) {
  const map = useMap();
  const markerRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const progressRef = useRef(0);
  const lastFrameRef = useRef(0);
  const stopPauseUntilRef = useRef(0);
  const facingWestRef = useRef(false);

  const { coordinates, stops, distanceMeters } = route;
  const stopIndexes = useMemo(() => new Set((stops || []).map((stop) => stop.index)), [stops]);
  const cumulative = useMemo(() => {
    const distances = [0];
    for (let index = 1; index < coordinates.length; index += 1) {
      distances[index] = distances[index - 1] + routeDistanceMeters([coordinates[index - 1], coordinates[index]]);
    }
    return distances;
  }, [coordinates]);
  const total = cumulative[cumulative.length - 1] || distanceMeters || 1;
  const baseMetersPerSecond = (distanceMeters || total) / 50;

  const placeAt = useCallback((distance) => {
    const marker = markerRef.current;
    if (!marker || !coordinates.length) return;
    const clamped = ((distance % total) + total) % total;
    let index = 1;
    while (index < cumulative.length && cumulative[index] < clamped) index += 1;
    const startIndex = Math.max(0, index - 1);
    const endIndex = Math.min(coordinates.length - 1, index);
    const segmentStart = cumulative[startIndex] || 0;
    const segmentEnd = cumulative[endIndex] || segmentStart + 1;
    const ratio = segmentEnd === segmentStart ? 0 : (clamped - segmentStart) / (segmentEnd - segmentStart);
    const [startLat, startLng] = coordinates[startIndex];
    const [endLat, endLng] = coordinates[endIndex];
    const lat = startLat + (endLat - startLat) * ratio;
    const lng = startLng + (endLng - startLng) * ratio;
    marker.setLatLng([lat, lng]);
    const facingWest = endLng < startLng;
    if (facingWest !== facingWestRef.current) {
      facingWestRef.current = facingWest;
      marker.setIcon(riderIcon(facingWest));
    }
  }, [coordinates, cumulative, total]);

  useEffect(() => {
    placeAt(0);
  }, [placeAt]);

  useEffect(() => {
    if (!running) return undefined;
    let frameId;
    const tick = (time) => {
      if (!lastFrameRef.current) lastFrameRef.current = time;
      const deltaSeconds = Math.min(0.05, (time - lastFrameRef.current) / 1000);
      lastFrameRef.current = time;
      if (time >= stopPauseUntilRef.current) {
        progressRef.current = (progressRef.current + deltaSeconds * baseMetersPerSecond * speed) % total;
        placeAt(progressRef.current);
        const nearest = cumulative.reduce((best, value, index) => (
          Math.abs(value - progressRef.current) < Math.abs(cumulative[best] - progressRef.current) ? index : best
        ), 0);
        if (stopIndexes.has(nearest) && Math.abs(cumulative[nearest] - progressRef.current) < 18) {
          stopPauseUntilRef.current = time + 2000;
        }
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
      lastFrameRef.current = 0;
    };
  }, [baseMetersPerSecond, cumulative, placeAt, running, speed, stopIndexes, total]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) setRunning(false); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <>
      <Marker ref={markerRef} position={coordinates[0]} icon={riderIcon(false)} keyboard={false} interactive={false} />
      <div className="heritage-map-trail-controls" aria-label="Trail animation controls">
        <button type="button" onClick={() => setRunning((value) => !value)}>{running ? "Pause ride" : "Play ride"}</button>
        <button type="button" onClick={() => { progressRef.current = 0; placeAt(0); setRunning(false); }}>Restart</button>
        <button type="button" onClick={() => setSpeed((value) => (value === 1 ? 2 : 1))}>{speed}x speed</button>
        <button type="button" onClick={() => map.fitBounds(L.latLngBounds(coordinates))}>Reset view</button>
      </div>
    </>
  );
}

export default function HeritageMap({ height = "520px", highlightedSiteId = null, onSelectSite, trail = false }) {
  const { settings } = useLiveData();
  const radius = Math.max(1, Number(settings.mapRadiusKm) || 10) * 1000;
  const [trailRoute, setTrailRoute] = useState(null);
  const [trailUnavailable, setTrailUnavailable] = useState(false);

  useEffect(() => {
    if (!trail) return undefined;
    let active = true;
    const loader = TRAIL_ROUTE_MODULES["../data/trail-route.json"];
    if (!loader) { setTrailUnavailable(true); return undefined; }
    loader()
      .then((mod) => { if (!active) return; const data = mod?.default || mod; setTrailRoute(isValidTrailRoute(data) ? data : null); setTrailUnavailable(!isValidTrailRoute(data)); })
      .catch(() => { if (active) setTrailUnavailable(true); });
    return () => { active = false; };
  }, [trail]);

  return (
    <div className="heritage-map-shell" style={{ height, minHeight: 320, position: "relative" }}>
      <MapContainer center={MAIN_MALL} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%", borderRadius: 8 }}>
        <TileLayer attribution={trailRoute?.attribution || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'} url={MAPBOX_TILE_URL} />
        <Circle center={MAIN_MALL} radius={radius} pathOptions={{ color: "#D4A017", fillColor: "#D4A017", fillOpacity: 0.04, weight: 1, dashArray: "4 6" }} />
        {trail && trailRoute ? (
          <>
            <Polyline positions={trailRoute.coordinates} pathOptions={{ color: "#38BDF8", weight: 5, opacity: 0.9 }} />
            <TrailRouteRider route={trailRoute} />
          </>
        ) : (
          <Polyline positions={LOOP_COORDINATES} pathOptions={{ color: ROUTE_STYLES.loop.color, weight: 4, opacity: 0.7, dashArray: ROUTE_STYLES.loop.dashArray }} />
        )}
        <Marker position={MAIN_MALL} icon={meetIcon}>
          <Popup><strong>Main Mall</strong><br />Start and finish point for every ride.</Popup>
        </Marker>
        {SITES.map((site) => (
          <Marker key={site.id} position={site.coords} icon={makeIcon(site.color, site.icon, highlightedSiteId === site.id)} eventHandlers={{ click: () => onSelectSite?.(site.id) }}>
            <Tooltip direction="top" offset={[0, -18]}>{site.name}</Tooltip>
            <Popup>
              <strong>{site.name}</strong>
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>{site.short}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {trail && trailUnavailable && <p className="heritage-map-trail-note">Trail route data is unavailable; showing the basic route.</p>}
    </div>
  );
}
