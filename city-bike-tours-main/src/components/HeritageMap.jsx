import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { SITES, MAIN_MALL, LOOP_ORDER } from "../data";
import Icon, { iconSvgMarkup } from "./Icon";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_TILE_URL = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const ROUTE_STYLES = {
  complete: { color: "#E5683F", dashArray: undefined },
  loop: { color: "#76B582", dashArray: "12 7" },
  own: { color: "#E6B331", dashArray: "3 8" },
};

function makeIcon(color, icon) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:36px;height:36px;
      background:${color};
      border:2px solid #F5EDD9;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:#F5EDD9;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
    ">${iconSvgMarkup(icon, 18)}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
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

function MapViewport({ bounds, markerRefs, request }) {
  const map = useMap();

  useEffect(() => {
    if (request?.siteId) {
      const site = SITES.find((entry) => entry.id === request.siteId);
      if (!site) return;
      map.flyTo(site.coords, 18, { duration: 0.8 });
      markerRefs.current[site.id]?.openPopup();
      return;
    }

    map.fitBounds(bounds.pad(0.2), { maxZoom: 16 });
  }, [bounds, map, markerRefs, request]);

  return null;
}

export default function HeritageMap({ height = "480px", routeId = "complete" }) {
  const sitesById = Object.fromEntries(SITES.map((site) => [site.id, site]));
  const routeCoordinates = [MAIN_MALL, ...LOOP_ORDER.map((id) => sitesById[id].coords), MAIN_MALL];
  const routeStyle = ROUTE_STYLES[routeId] || ROUTE_STYLES.complete;
  const bounds = useMemo(() => L.latLngBounds([MAIN_MALL, ...SITES.map((site) => site.coords)]), []);
  const markerRefs = useRef({});
  const [mapRequest, setMapRequest] = useState(null);

  return (
    <div>
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
        <MapViewport bounds={bounds} markerRefs={markerRefs} request={mapRequest} />
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
          pathOptions={{ ...routeStyle, weight: 6, opacity: 0.95, lineCap: "round", lineJoin: "round" }}
        />
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
            icon={makeIcon(site.color, site.icon)}
            eventHandlers={{ click: () => setMapRequest({ siteId: site.id }) }}
          >
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "8px", marginTop: "12px" }}>
        {SITES.map((site) => (
          <button
            key={site.id}
            type="button"
            onClick={() => setMapRequest({ siteId: site.id })}
            style={{
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
          onClick={() => setMapRequest({ reset: true })}
          style={{
            padding: "10px 12px",
            backgroundColor: "#D4A017",
            border: "1px solid #D4A017",
            borderRadius: "3px",
            color: "#0D0805",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          Reset view
        </button>
      </div>
    </div>
  );
}
