import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { SITES, MAIN_MALL, LOOP_ORDER } from "../data";
import Icon, { iconSvgMarkup } from "./Icon";

const STORAGE_KEY = "cbt_custom_routes";

// ─── ICONS ────────────────────────────────────────────────────────────────────

function siteIcon(site, { selected, order } = {}) {
  const ring = selected ? "3px solid #D4A017" : "2px solid #F5EDD9";
  const badge = order
    ? `<div style="
        position:absolute; top:-6px; right:-6px;
        width:18px; height:18px; border-radius:50%;
        background:#D4A017; color:#0D0805; font-weight:700; font-size:10px;
        display:flex; align-items:center; justify-content:center;
        border:2px solid #0D0805;
      ">${order}</div>`
    : "";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;">
      <div style="
        width:36px;height:36px;
        background:${site.color};
        border:${ring};
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        color:#F5EDD9;
        box-shadow:0 2px 8px rgba(0,0,0,0.5);
        cursor:pointer;
      ">${iconSvgMarkup(site.icon, 18)}</div>
      ${badge}
    </div>`,
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

// ─── DISTANCE ─────────────────────────────────────────────────────────────────

function haversineKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pathDistanceKm(points) {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) total += haversineKm(points[i], points[i + 1]);
  return total;
}

function readChildText(node, name) {
  return Array.from(node.children).find((child) => child.localName === name)?.textContent?.trim() || "";
}

function samplePoints(points, limit) {
  if (points.length <= limit) return points;
  return Array.from({ length: limit }, (_, index) => points[Math.round((index * (points.length - 1)) / (limit - 1))]);
}

function parseGpx(text) {
  const documentNode = new DOMParser().parseFromString(text, "application/xml");
  if (documentNode.querySelector("parsererror")) throw new Error("This GPX file could not be read.");

  const trackNodes = Array.from(documentNode.getElementsByTagNameNS("*", "trkpt"));
  const routeNodes = Array.from(documentNode.getElementsByTagNameNS("*", "rtept"));
  const pointNodes = trackNodes.length ? trackNodes : routeNodes;
  if (pointNodes.length < 2 || pointNodes.length > 50000) throw new Error("Choose a GPX track with 2 to 50,000 points.");

  const trackPoints = pointNodes.map((point) => {
    const lat = Number(point.getAttribute("lat"));
    const lon = Number(point.getAttribute("lon"));
    const elevationText = readChildText(point, "ele");
    const elevation = elevationText ? Number(elevationText) : null;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      throw new Error("The GPX file contains invalid coordinates.");
    }
    return { coords: [lat, lon], elevation: Number.isFinite(elevation) ? elevation : null };
  });

  const waypointNodes = Array.from(documentNode.getElementsByTagNameNS("*", "wpt")).slice(0, 100);
  const waypoints = waypointNodes.map((point) => ({
    name: readChildText(point, "name") || "Waypoint",
    coords: [Number(point.getAttribute("lat")), Number(point.getAttribute("lon"))],
  })).filter((point) => point.coords.every(Number.isFinite));
  const track = Array.from(documentNode.getElementsByTagNameNS("*", "trk"))[0];
  const route = Array.from(documentNode.getElementsByTagNameNS("*", "rte"))[0];
  const namedParent = track || route;
  const surfaceNode = Array.from(documentNode.getElementsByTagNameNS("*", "surface"))[0];
  const elevations = trackPoints.map((point) => point.elevation).filter(Number.isFinite);
  let elevationGainM = 0;
  for (let index = 1; index < elevations.length; index++) {
    if (elevations[index] > elevations[index - 1]) elevationGainM += elevations[index] - elevations[index - 1];
  }

  return {
    name: namedParent ? readChildText(namedParent, "name") : "",
    trackPoints: samplePoints(trackPoints, 5000),
    distanceKm: Math.round(pathDistanceKm(trackPoints.map((point) => point.coords)) * 10) / 10,
    elevationGainM: elevations.length > 1 ? Math.round(elevationGainM) : null,
    elevationProfile: elevations.length > 1 ? samplePoints(elevations, 256) : [],
    waypoints,
    surfaceType: surfaceNode?.textContent?.trim() || "Unspecified",
  };
}

function TrackViewport({ trackPoints }) {
  const map = useMap();

  useEffect(() => {
    if (trackPoints.length > 1) {
      map.fitBounds(L.latLngBounds(trackPoints.map((point) => point.coords)).pad(0.12), { maxZoom: 16 });
    }
  }, [map, trackPoints]);

  return null;
}

// ─── MODES ────────────────────────────────────────────────────────────────────

const MODES = [
  { id: "complete", label: "Complete Route", color: "#C1440E" },
  { id: "loop", label: "Heritage Loop", color: "#1A3A2A" },
  { id: "own", label: "Design Your Own", color: "#D4A017" },
];

export default function RouteExplorerMap({ height = "520px" }) {
  const [mode, setMode] = useState("complete");
  const [customSeq, setCustomSeq] = useState([]); // array of site ids, in click order
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [routeName, setRouteName] = useState("");
  const [customTrack, setCustomTrack] = useState([]);
  const [customWaypoints, setCustomWaypoints] = useState([]);
  const [elevationProfile, setElevationProfile] = useState([]);
  const [elevationGainM, setElevationGainM] = useState(null);
  const [surfaceType, setSurfaceType] = useState("Unspecified");
  const [importError, setImportError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedRoutes(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
  }, []);

  function persist(routes) {
    setSavedRoutes(routes);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
    } catch {
      // storage unavailable — route still works for this session
    }
  }

  const sitesById = useMemo(() => Object.fromEntries(SITES.map((s) => [s.id, s])), []);

  const loopTrail = useMemo(
    () => [MAIN_MALL, ...LOOP_ORDER.map((id) => sitesById[id].coords), MAIN_MALL],
    [sitesById]
  );

  const customTrail = useMemo(() => {
    if (customTrack.length > 1) return customTrack.map((point) => point.coords);
    if (customSeq.length === 0) return [];
    return [MAIN_MALL, ...customSeq.map((id) => sitesById[id].coords), MAIN_MALL];
  }, [customSeq, customTrack, sitesById]);

  const customDistance = useMemo(() => customTrack.length > 1
    ? pathDistanceKm(customTrack.map((point) => point.coords))
    : pathDistanceKm(customTrail), [customTrack, customTrail]);
  const activeMode = MODES.find((m) => m.id === mode);

  function toggleSite(id) {
    if (mode !== "own") return;
    setCustomTrack([]);
    setCustomWaypoints([]);
    setElevationProfile([]);
    setElevationGainM(null);
    setCustomSeq((seq) => (seq.includes(id) ? seq.filter((s) => s !== id) : [...seq, id]));
  }

  function removeAt(index) {
    setCustomSeq((seq) => seq.filter((_, i) => i !== index));
  }

  function saveRoute() {
    if (!routeName.trim() || customSeq.length < 2) return;
    const entry = {
      id: Date.now(),
      name: routeName.trim(),
      siteIds: customSeq,
      trackPoints: customTrack,
      waypoints: customWaypoints.length ? customWaypoints : customSeq.map((id) => ({ name: sitesById[id].name, coords: sitesById[id].coords })),
      distanceKm: Math.round(customDistance * 10) / 10,
      elevationGainM,
      elevationProfile,
      surfaceType,
      source: customTrack.length ? "GPX" : "Custom waypoints",
    };
    persist([entry, ...savedRoutes]);
    setRouteName("");
    setImportError("");
  }

  function loadRoute(entry) {
    setCustomSeq(entry.siteIds.filter((id) => sitesById[id]));
    setCustomTrack(entry.trackPoints || []);
    setCustomWaypoints(entry.waypoints || []);
    setElevationProfile(entry.elevationProfile || []);
    setElevationGainM(entry.elevationGainM ?? null);
    setSurfaceType(entry.surfaceType || "Unspecified");
    setRouteName(entry.name);
    setMode("own");
  }

  function deleteRoute(id) {
    persist(savedRoutes.filter((r) => r.id !== id));
  }

  async function importGpx(file) {
    if (!file) return;
    setImportError("");
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("GPX files must be 5 MB or smaller.");
      const imported = parseGpx(await file.text());
      const entry = {
        id: Date.now(),
        name: imported.name || file.name.replace(/\.gpx$/i, "") || "Imported GPS route",
        siteIds: [],
        ...imported,
        surfaceType: imported.surfaceType === "Unspecified" ? surfaceType : imported.surfaceType,
        source: "GPX · Ride with GPS compatible",
      };
      persist([entry, ...savedRoutes]);
      loadRoute(entry);
      setRouteName(entry.name);
    } catch (error) {
      setImportError(error.message || "Could not import this GPX file.");
    }
  }

  const elevationSamples = elevationProfile.length > 48
    ? elevationProfile.filter((_, index) => index % Math.ceil(elevationProfile.length / 48) === 0)
    : elevationProfile;
  const minElevation = Math.min(...elevationSamples);
  const maxElevation = Math.max(...elevationSamples);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className="px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest transition-all"
            style={{
              backgroundColor: mode === m.id ? m.color : "rgba(245,237,217,0.08)",
              color: mode === m.id ? "#F5EDD9" : "rgba(245,237,217,0.6)",
              border: `1px solid ${mode === m.id ? m.color : "rgba(245,237,217,0.1)"}`,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div style={{ height, borderRadius: "4px", overflow: "hidden", border: "1px solid rgba(212,160,23,0.25)" }}>
          <MapContainer center={MAIN_MALL} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
            <TrackViewport trackPoints={customTrack} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={19}
            />
            <Circle
              center={MAIN_MALL}
              radius={600}
              pathOptions={{ color: "#C1440E", fillColor: "#C1440E", fillOpacity: 0.05, weight: 1, dashArray: "6 4" }}
            />

            {(mode === "complete" || mode === "loop") && (
              <Polyline
                positions={loopTrail}
                pathOptions={{
                  color: activeMode.color,
                  weight: 4,
                  opacity: 0.85,
                  dashArray: mode === "loop" ? "10 6" : undefined,
                }}
              />
            )}
            {mode === "own" && customTrail.length > 0 && (
              <Polyline positions={customTrail} pathOptions={{ color: "#D4A017", weight: 4, opacity: 0.9, dashArray: "4 4" }} />
            )}

            {mode === "own" && customTrack.length > 1 && customWaypoints.map((waypoint, index) => (
              <Marker key={`${waypoint.name}-${index}`} position={waypoint.coords} icon={siteIcon({ color: "#D4A017", icon: "flag" }, { selected: true, order: index + 1 })}>
                <Popup><strong>{waypoint.name}</strong></Popup>
              </Marker>
            ))}

            <Marker position={MAIN_MALL} icon={meetIcon}>
              <Popup>
                <div style={{ fontFamily: "Outfit, sans-serif", minWidth: "160px" }}>
                  <strong style={{ color: "#C1440E", fontSize: "13px" }}><Icon name="mapPin" size={14} /> Main Mall</strong>
                  <div style={{ fontSize: "11px", marginTop: "4px", color: "#555" }}>
                    Start and end point for every route.
                  </div>
                </div>
              </Popup>
            </Marker>

            {SITES.map((site) => {
              const orderIdx = customSeq.indexOf(site.id);
              return (
                <Marker
                  key={site.id}
                  position={site.coords}
                  icon={siteIcon(site, {
                    selected: mode === "own" && orderIdx !== -1,
                    order: mode === "own" && orderIdx !== -1 ? orderIdx + 1 : null,
                  })}
                  eventHandlers={mode === "own" ? { click: () => toggleSite(site.id) } : {}}
                >
                  <Popup>
                    <div style={{ fontFamily: "Outfit, sans-serif", minWidth: "180px" }}>
                      <strong style={{ color: site.color, fontSize: "13px" }}>
                        <Icon name={site.icon} size={14} /> {site.name}
                      </strong>
                      <div style={{ fontSize: "11px", marginTop: "4px", color: "#555", lineHeight: "1.4" }}>
                        {site.short}
                      </div>
                      {mode === "own" && (
                        <div style={{ fontSize: "11px", marginTop: "6px", color: "#D4A017", fontWeight: 600 }}>
                          {orderIdx !== -1 ? `Stop ${orderIdx + 1} — click to remove` : "Click marker to add to your route"}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <div>
          {(mode === "complete" || mode === "loop") && (
            <div className="p-4 rounded-sm" style={{ backgroundColor: "rgba(245,237,217,0.05)", border: "1px solid rgba(245,237,217,0.1)" }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: activeMode.color }}>
                {activeMode.label} order
              </div>
              <ol className="text-sm" style={{ color: "rgba(245,237,217,0.8)" }}>
                <li className="mb-1.5"><Icon name="mapPin" size={14} /> Main Mall (start)</li>
                {LOOP_ORDER.map((id, i) => (
                  <li key={id} className="mb-1.5">
                    {i + 1}. <Icon name={sitesById[id].icon} size={14} /> {sitesById[id].name}
                  </li>
                ))}
                <li><Icon name="mapPin" size={14} /> Main Mall (finish)</li>
              </ol>
            </div>
          )}

          {mode === "own" && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-sm" style={{ backgroundColor: "rgba(245,237,217,0.05)", border: "1px solid rgba(212,160,23,0.25)" }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#D4A017" }}>
                  Build your route
                </div>
                <p className="text-xs mb-3" style={{ color: "rgba(245,237,217,0.55)" }}>
                  Click site markers on the map, in the order you want to visit them. Click a marker again to remove it.
                </p>

                {customSeq.length === 0 ? (
                  <div className="text-xs italic" style={{ color: "rgba(245,237,217,0.4)" }}>No stops selected yet.</div>
                ) : (
                  <ol className="text-sm mb-3" style={{ color: "rgba(245,237,217,0.85)" }}>
                    {customSeq.map((id, i) => (
                      <li key={id} className="flex items-center justify-between mb-1.5">
                        <span>{i + 1}. <Icon name={sitesById[id].icon} size={14} /> {sitesById[id].name}</span>
                        <button
                          type="button"
                          onClick={() => removeAt(i)}
                          className="text-xs px-1.5 rounded-sm hover:opacity-70"
                          style={{ color: "#C1440E" }}
                          aria-label={`Remove ${sitesById[id].name}`}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ol>
                )}

                {customSeq.length > 0 && (
                  <div className="text-xs mb-3" style={{ color: "rgba(245,237,217,0.5)" }}>
                    ~{customDistance.toFixed(1)} km, Main Mall to Main Mall
                  </div>
                )}

                {customTrack.length > 1 && (
                  <div className="route-library-metadata">
                    <span>{customDistance.toFixed(1)} km track</span>
                    <span>{elevationGainM == null ? "Elevation unavailable" : `${elevationGainM} m ascent`}</span>
                    <span>{surfaceType} surface</span>
                    <span>{customWaypoints.length} named waypoints</span>
                  </div>
                )}

                {elevationSamples.length > 1 && (
                  <div className="route-elevation-panel">
                    <div><strong>Elevation profile</strong><span>{minElevation}–{maxElevation} m</span></div>
                    <div className="route-elevation-chart" role="img" aria-label={`Elevation profile from ${minElevation} to ${maxElevation} meters`}>
                      {elevationSamples.map((elevation, index) => {
                        const range = maxElevation - minElevation || 1;
                        return <span key={`${index}-${elevation}`} style={{ height: `${Math.max(8, ((elevation - minElevation) / range) * 100)}%` }} />;
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setCustomSeq([])}
                    disabled={customSeq.length === 0}
                    className="flex-1 text-xs font-bold uppercase tracking-widest py-2 rounded-sm border disabled:opacity-30"
                    style={{ borderColor: "rgba(245,237,217,0.2)", color: "rgba(245,237,217,0.7)" }}
                  >
                    Clear
                  </button>
                </div>

                <label className="route-library-field">
                  Surface type
                  <select value={surfaceType} onChange={(event) => setSurfaceType(event.target.value)}>
                    <option>Unspecified</option><option>Asphalt</option><option>Paved</option><option>Gravel</option><option>Mixed</option><option>Trail</option>
                  </select>
                </label>

                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="Name this route…"
                  className="w-full text-sm px-3 py-2 rounded-sm mb-2"
                  style={{ backgroundColor: "rgba(245,237,217,0.07)", border: "1px solid rgba(245,237,217,0.15)", color: "#F5EDD9" }}
                />
                <button
                  type="button"
                  onClick={saveRoute}
                  disabled={!routeName.trim() || customSeq.length < 2}
                  className="w-full text-xs font-bold uppercase tracking-widest py-2.5 rounded-sm disabled:opacity-30"
                  style={{ backgroundColor: "#D4A017", color: "#0D0805" }}
                >
                  Save this route
                </button>
                <label className="route-gpx-import">
                  Import GPX from Ride with GPS
                  <input type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml" onChange={(event) => importGpx(event.target.files?.[0])} />
                </label>
                {importError && <p className="route-import-error" role="alert">{importError}</p>}
                {customSeq.length > 0 && customSeq.length < 2 && (
                  <p className="text-xs mt-2" style={{ color: "rgba(245,237,217,0.4)" }}>Pick at least 2 stops to save.</p>
                )}
              </div>

              {savedRoutes.length > 0 && (
                <div className="p-4 rounded-sm" style={{ backgroundColor: "rgba(245,237,217,0.05)", border: "1px solid rgba(245,237,217,0.1)" }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(245,237,217,0.5)" }}>
                    Your saved routes
                  </div>
                  <div className="flex flex-col gap-2">
                    {savedRoutes.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-2 rounded-sm text-xs"
                        style={{ backgroundColor: "rgba(245,237,217,0.04)", border: "1px solid rgba(245,237,217,0.08)" }}
                      >
                        <div>
                          <div style={{ color: "#F5EDD9", fontWeight: 600 }}><Icon name="map" size={14} /> {r.name}</div>
                          <div style={{ color: "rgba(245,237,217,0.4)" }}>{r.waypoints?.length || r.siteIds?.length || 0} waypoints · ~{r.distanceKm} km · {r.surfaceType || "Unspecified"}</div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => loadRoute(r)} className="hover:opacity-70" style={{ color: "#D4A017" }}>
                            Load
                          </button>
                          <button type="button" onClick={() => deleteRoute(r.id)} className="hover:opacity-70" style={{ color: "#C1440E" }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
