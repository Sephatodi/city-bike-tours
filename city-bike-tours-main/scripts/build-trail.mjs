import { mkdir, writeFile, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITES, MAIN_MALL, LOOP_ORDER } from "../src/data.js";

// Optional hand-tuned via points, in Leaflet [latitude, longitude] order.
const TRAIL_VIA = {};

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = resolve(ROOT, "src/data/trail-route.json");
const R = 6371008.8;
const rad = (n) => n * Math.PI / 180;
function metres(a, b) {
  const p1 = rad(a[0]), p2 = rad(b[0]), dp = rad(b[0] - a[0]), dl = rad(b[1] - a[1]);
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function segmentDistance(p, a, b) {
  const lat = rad((p[0] + a[0] + b[0]) / 3), sx = Math.cos(lat) * R * Math.PI / 180, sy = R * Math.PI / 180;
  const xy = (v) => [v[1] * sx, v[0] * sy], [ax, ay] = xy(a), [bx, by] = xy(b), [px, py] = xy(p);
  const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
function simplify(points, mandatory, tolerance = 2) {
  const keep = new Set(mandatory), anchors = [...new Set([0, ...mandatory, points.length - 1])].sort((a,b)=>a-b);
  for (let n = 0; n < anchors.length - 1; n++) {
    const stack = [[anchors[n], anchors[n + 1]]];
    while (stack.length) {
      const [a,b] = stack.pop(); let best = tolerance, index = -1;
      for (let i = a + 1; i < b; i++) { const d = segmentDistance(points[i], points[a], points[b]); if (d > best) { best = d; index = i; } }
      if (index >= 0) { keep.add(index); stack.push([a,index],[index,b]); }
    }
  }
  return [...keep].sort((a,b)=>a-b);
}
async function main() {
  const provider = process.env.TRAIL_PROVIDER || (process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN ? "mapbox" : process.env.ORS_API_KEY ? "ors" : "");
  if (!["mapbox","ors"].includes(provider)) { console.error("Set MAPBOX_TOKEN or VITE_MAPBOX_TOKEN for Mapbox, or ORS_API_KEY for OpenRouteService. Optionally set TRAIL_PROVIDER=mapbox|ors."); process.exitCode=1; return; }
  const token = provider === "mapbox" ? (process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN) : process.env.ORS_API_KEY;
  if (!token) { console.error(provider === "mapbox" ? "TRAIL_PROVIDER=mapbox requires MAPBOX_TOKEN or VITE_MAPBOX_TOKEN." : "TRAIL_PROVIDER=ors requires ORS_API_KEY."); process.exitCode=1; return; }
  const byId = Object.fromEntries(SITES.map(s=>[s.id,s]));
  const ordered = LOOP_ORDER.map(id=>byId[id]);
  if (ordered.some(s=>!s)) throw new Error("LOOP_ORDER contains an unknown site id.");
  const stops = [{id:"mainmall",coords:MAIN_MALL}, ...ordered.map(s=>({id:s.id,coords:s.coords})), {id:"mainmall",coords:MAIN_MALL}];
  const points = [];
  stops.forEach((stop,i)=>{ points.push([stop.coords[1],stop.coords[0]]); if(i<stops.length-1) for(const v of TRAIL_VIA[stop.id]||[]) points.push([v[1],v[0]]); });
  let res, geometry, summary, attribution;
  if(provider==="mapbox") {
    const path=points.map(([x,y])=>`${x},${y}`).join(";");
    const url=new URL(`https://api.mapbox.com/directions/v5/mapbox/cycling/${path}`);
    url.search=new URLSearchParams({geometries:"geojson",overview:"full",steps:"false",access_token:token}).toString();
    res=await fetch(url); const body=await res.json().catch(()=>({}));
    if(!res.ok){console.error(`Mapbox HTTP ${res.status}: ${body.message||body.error||"routing request failed"}`);process.exitCode=1;return;}
    const route=body.routes?.[0]; geometry=route?.geometry?.coordinates; summary={distance:route?.distance,duration:route?.duration}; attribution="© Mapbox © OpenStreetMap";
  } else {
    res=await fetch("https://api.openrouteservice.org/v2/directions/cycling-regular/geojson",{method:"POST",headers:{Authorization:token,"Content-Type":"application/json"},body:JSON.stringify({coordinates:points})});
    const body=await res.json().catch(()=>({}));
    if(!res.ok){const error=body.error?.message||body.message||body.error||"routing request failed";console.error(`OpenRouteService HTTP ${res.status}: ${typeof error==="string"?error:JSON.stringify(error)}`);process.exitCode=1;return;}
    const feature=body.features?.[0]; geometry=feature?.geometry?.coordinates; summary=feature?.properties?.summary; attribution=body.metadata?.attribution||"openrouteservice.org";
  }
  if(!Array.isArray(geometry)||geometry.length<2||!Number.isFinite(summary?.distance)||!Number.isFinite(summary?.duration)){console.error("Routing provider returned no usable GeoJSON geometry or summary.");process.exitCode=1;return;}
  const full=geometry.map(([lng,lat])=>[lat,lng]);
  const nearest=(point,from,to)=>{let best=from,dist=Infinity;for(let i=from;i<=to;i++){const d=metres(point,full[i]);if(d<dist){dist=d;best=i;}}return best;};
  const fullStops=[{id:"mainmall",index:0}];let previous=0;
  ordered.forEach((site,i)=>{const index=nearest(site.coords,previous,full.length-(ordered.length-i));fullStops.push({id:site.id,index});previous=index;});
  fullStops.push({id:"mainmall",index:full.length-1});
  const indexes=simplify(full,fullStops.map(s=>s.index)), coords=indexes.map(i=>full[i]), cumulative=[0];
  for(let i=1;i<coords.length;i++)cumulative.push(cumulative[i-1]+metres(coords[i-1],coords[i]));
  const remap=new Map(indexes.map((original,index)=>[original,index]));
  const outputStops=fullStops.map(s=>({id:s.id,index:remap.get(s.index),atMeters:Math.round(cumulative[remap.get(s.index)]*10)/10}));
  const distanceMeters=summary.distance;
  const valid=coords.length>=50&&coords.every(([lat,lng])=>Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=-24.8&&lat<=-24.5&&lng>=25.8&&lng<=26.1)&&distanceMeters>=4000&&distanceMeters<=30000&&outputStops.every((s,i)=>i===0||s.index>outputStops[i-1].index);
  if(!valid){console.error(`Route validation failed (vertices=${coords.length}, distance=${Math.round(distanceMeters)}m, stop indexes=${outputStops.map(s=>s.index).join("→")}). Existing output was not changed.`);process.exitCode=1;return;}
  const result={provider,profile:provider==="mapbox"?"mapbox/cycling":"cycling-regular",attribution,generatedAt:new Date().toISOString(),distanceMeters:Math.round(distanceMeters),durationSeconds:Math.round(summary.duration),coordinates:coords,stops:outputStops};
  const tmp=`${OUTPUT}.tmp`;await mkdir(dirname(OUTPUT),{recursive:true});await writeFile(tmp,JSON.stringify(result,null,2)+"\n","utf8");await rename(tmp,OUTPUT);
  console.log(`Generated src/data/trail-route.json: ${(distanceMeters/1000).toFixed(1)} km, ${coords.length} vertices, ${provider}.`);
}
main().catch(error=>{console.error(`Trail build failed: ${error.message}`);process.exitCode=1;});
