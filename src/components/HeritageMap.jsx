import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import { SITES, MAIN_MALL, LOOP_ORDER } from "../data";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_TILE_URL = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function makeIcon(color, emoji) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:36px;height:36px;
      background:${color};
      border:2px solid #F5EDD9;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:16px;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
    ">${emoji}</div>`,
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
    font-size:20px;
    box-shadow:0 2px 12px rgba(212,160,23,0.6);
  ">📍</div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -24],
});

export default function HeritageMap({ height = "480px" }) {
  const sitesById = Object.fromEntries(SITES.map((site) => [site.id, site]));
  const routeCoordinates = [MAIN_MALL, ...LOOP_ORDER.map((id) => sitesById[id].coords), MAIN_MALL];

  return (
    <div style={{ height, borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(212,160,23,0.25)" }}>
      <MapContainer
        center={MAIN_MALL}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
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
          pathOptions={{ color: "#D4A017", weight: 5, dashArray: "8 8", opacity: 0.9 }}
        />
        <Circle
          center={MAIN_MALL}
          radius={600}
          pathOptions={{ color: "#C1440E", fillColor: "#C1440E", fillOpacity: 0.06, weight: 1.5, dashArray: "6 4" }}
        />
        <Marker position={MAIN_MALL} icon={meetIcon}>
          <Popup>
            <div style={{ fontFamily: "Outfit, sans-serif", minWidth: "160px" }}>
              <strong style={{ color: "#C1440E", fontSize: "13px" }}>📍 Main Mall</strong>
              <div style={{ fontSize: "11px", marginTop: "4px", color: "#555" }}>
                Meeting point for all City Bike Tours rides.<br />
                <em>Look for the orange flag.</em>
              </div>
            </div>
          </Popup>
        </Marker>
        {SITES.map((site) => (
          <Marker key={site.id} position={site.coords} icon={makeIcon(site.color, site.emoji)}>
            <Popup>
              <div style={{ fontFamily: "Outfit, sans-serif", minWidth: "180px" }}>
                <strong style={{ color: site.color, fontSize: "13px" }}>{site.emoji} {site.name}</strong>
                <div style={{ fontSize: "11px", marginTop: "4px", color: "#555", lineHeight: "1.4" }}>
                  {site.short}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
