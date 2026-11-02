import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { SITES, MAIN_MALL, LOOP_ORDER } from "../data";
import Icon, { iconSvgMarkup } from "./Icon";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const loadTrailRoute = import.meta.glob("../data/trail-route.json");
const MAPBOX_TILE_URL = MAPBOX_TOKEN ? `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}` : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ROUTE_STYLES = { complete: { color: "#E5683F" }, loop: { color: "#76B582", dashArray: "12 7" }, own: { color: "#E6B331", dashArray: "3 8" } };
const rad = (n) => n * Math.PI / 180;
function metresBetween(a,b) { const dp=rad(b[0]-a[0]), dl=rad(b[1]-a[1]), p=rad(a[0]); const h=Math.sin(dp/2)**2+Math.cos(p)*Math.cos(rad(b[0]))*Math.sin(dl/2)**2; return 12742017.6*Math.asin(Math.sqrt(h)); }
function makeIcon(color,icon) { return L.divIcon({className:"",html:`<div style="width:36px;height:36px;background:${color};border:2px solid #F5EDD9;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#F5EDD9;box-shadow:0 2px 8px rgba(0,0,0,.5)">${iconSvgMarkup(icon,18)}</div>`,iconSize:[36,36],iconAnchor:[18,18],popupAnchor:[0,-20]}); }
const meetIcon=L.divIcon({className:"",html:`<div style="width:44px;height:44px;background:#D4A017;border:3px solid #F5EDD9;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#0D0805;box-shadow:0 2px 12px rgba(212,160,23,.6)">${iconSvgMarkup("mapPin",22)}</div>`,iconSize:[44,44],iconAnchor:[22,22],popupAnchor:[0,-24]});
const riderSvg=`<svg width="58" height="44.5" viewBox="0 0 120 92" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="#082516" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><circle cx="26" cy="68" r="19"/><circle cx="96" cy="68" r="19"/><path d="M5 62 A23 23 0 0 1 36 47 M76 52 A23 23 0 0 1 112 58 M26 68 L58 71 M26 68 L44 52 M44 52 L58 71 M44 52 L86 41 M86 41 L58 71 M86 41 L96 68 M86 41 L87 35 M34 49 L50 49 M52 25 L44 46 M56 28 L86 34 M84 34 Q93 31 94 40 M46 50 L68 54 L63 75 M60 77 L74 77"/><circle cx="58" cy="71" r="7"/><circle cx="26" cy="68" r="3.5" fill="#082516"/><circle cx="96" cy="68" r="3.5" fill="#082516"/></g><circle cx="60" cy="11" r="9.5" fill="#082516"/><g fill="none" stroke="#F5B800" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="26" cy="68" r="19" stroke-width="5"/><circle cx="96" cy="68" r="19" stroke-width="5"/><path d="M5 62 A23 23 0 0 1 36 47"/><path d="M76 52 A23 23 0 0 1 112 58"/><circle cx="26" cy="68" r="3.5" fill="#F5B800" stroke-width="1"/><circle cx="96" cy="68" r="3.5" fill="#F5B800" stroke-width="1"/><path d="M26 68 L58 71 M26 68 L44 52 M44 52 L58 71 M44 52 L86 41 M86 41 L58 71 M86 41 L96 68 M86 41 L87 35 M34 49 L50 49 M52 25 L44 46" stroke-width="4"/><path d="M56 28 L86 34" stroke-width="6"/><path d="M84 34 Q93 31 94 40" stroke-width="4"/><circle cx="58" cy="71" r="7" stroke-width="3"/><path d="M46 50 L68 54 L63 75" stroke-width="9"/><path d="M60 77 L74 77" stroke-width="5"/></g><circle cx="60" cy="11" r="9.5" fill="#F5B800"/></svg>`;
function bicycleIcon() { return L.divIcon({className:"trail-moving-bicycle",html:`<div style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 3px #07140c) drop-shadow(0 0 5px rgba(245,184,0,.7))"><div class="trail-bicycle-art" style="width:58px;height:48px;display:flex;align-items:center;justify-content:center;transform:rotate(0deg);transition:transform 160ms linear">${riderSvg}</div></div>`,iconSize:[64,64],iconAnchor:[32,32]}); }
function bearingDegrees(from,to) { const lat1=rad(from[0]),lat2=rad(to[0]),deltaLng=rad(to[1]-from[1]);const y=Math.sin(deltaLng)*Math.cos(lat2),x=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(deltaLng);return(Math.atan2(y,x)*180/Math.PI+360)%360; }
function setBicycleHeading(marker,bearing) { const artwork=marker?.getElement()?.querySelector(".trail-bicycle-art");if(artwork)artwork.style.transform=`rotate(${bearing-90}deg)`; }
function isValidTrailRoute(data) {
 const ids=["mainmall",...LOOP_ORDER,"mainmall"];
 if(!data||!["mapbox","ors"].includes(data.provider)||typeof data.profile!=="string"||!data.profile||typeof data.attribution!=="string"||!data.attribution.trim()||!Number.isFinite(data.distanceMeters)||data.distanceMeters<4000||data.distanceMeters>30000||!Number.isFinite(data.durationSeconds)||data.durationSeconds<=0||!Array.isArray(data.coordinates)||data.coordinates.length<50||!Array.isArray(data.stops)||data.stops.length!==ids.length)return false;
 if(!data.coordinates.every(point=>Array.isArray(point)&&point.length===2&&Number.isFinite(point[0])&&Number.isFinite(point[1])&&point[0]>=-24.8&&point[0]<=-24.5&&point[1]>=25.8&&point[1]<=26.1))return false;
 return data.stops.every((stop,index)=>stop.id===ids[index]&&Number.isInteger(stop.index)&&stop.index>=0&&stop.index<data.coordinates.length&&Number.isFinite(stop.atMeters)&&stop.atMeters>=0&&(index===0||stop.index>data.stops[index-1].index&&stop.atMeters>data.stops[index-1].atMeters));
}
function reportFallbackOnce(logged,message) { if(!logged.current){logged.current=true;console.info(message);} }

function MapViewport({bounds,markerRefs,request,onUserGesture}) {
 const map=useMap();
 useEffect(()=>{const pause=()=>onUserGesture?.();map.on("dragstart zoomstart",pause);return()=>map.off("dragstart zoomstart",pause);},[map,onUserGesture]);
 useEffect(()=>{if(request?.siteId){const site=SITES.find(s=>s.id===request.siteId);if(!site)return;map.flyTo(site.coords,18,{duration:.8});markerRefs.current[site.id]?.openPopup();return;}map.fitBounds(bounds.pad(.2),{maxZoom:16});},[bounds,map,markerRefs,request]);
 return null;
}
function TrailAnimation({route,playing,speed,follow,visible,markerRefs,setActiveStop,setArriving,animationRef}) {
 const map=useMap(), bike=useRef(null), streetRoute=useRef(null), elapsed=useRef(0), lastStop=useRef(-1), pauseRemaining=useRef(0),lastBearing=useRef(90);
 const cumulative=useMemo(()=>{const values=[0];for(let i=1;i<route.coordinates.length;i++)values.push(values[i-1]+metresBetween(route.coordinates[i-1],route.coordinates[i]));return values;},[route]);
 const total=cumulative[cumulative.length-1];
 useEffect(()=>{
   const coords=route.coordinates;
   streetRoute.current=L.polyline(coords,{color:"#38A6D8",weight:6,opacity:.98,lineCap:"round",lineJoin:"round"}).addTo(map);
   bike.current=L.marker(coords[0],{icon:bicycleIcon(),interactive:false,zIndexOffset:1200}).addTo(map);
   animationRef.current={reset:()=>{elapsed.current=0;lastStop.current=-1;pauseRemaining.current=0;lastBearing.current=90;bike.current?.setLatLng(coords[0]);setBicycleHeading(bike.current,lastBearing.current);for(const site of SITES){const marker=markerRefs.current[site.id];marker?.closeTooltip();marker?.setIcon(makeIcon(site.color,site.icon));}}};
   return()=>{streetRoute.current?.remove();bike.current?.remove();animationRef.current=null;};
 },[map,route,animationRef]);
 useEffect(()=>{
   if(!playing||!visible||document.hidden)return undefined;
   let raf=0,previous=0;
   const stopList=route.stops.filter(s=>s.id!=="mainmall");
   const frame=(now)=>{
     if(!previous)previous=now;
     const dt=now-previous;previous=now;
     if(pauseRemaining.current>0){
       pauseRemaining.current=Math.max(0,pauseRemaining.current-dt);
     }else{
       const before=elapsed.current;
       elapsed.current+=dt*(total/38000)*speed;
       if(elapsed.current>=total){elapsed.current=0;lastStop.current=-1;setActiveStop("mainmall");}
       const reached=stopList.findIndex((stop,index)=>index>lastStop.current&&before<stop.atMeters&&elapsed.current>=stop.atMeters);
       if(reached>=0){const stop=stopList[reached];elapsed.current=stop.atMeters;lastStop.current=reached;pauseRemaining.current=2000;const site=SITES.find(s=>s.id===stop.id);setActiveStop(stop.id);setArriving(site?`Arriving at ${site.name}`:"Arriving at Main Mall");const stopMarker=markerRefs.current[stop.id];if(stopMarker){stopMarker.setIcon(makeIcon("#F5B800",site?.icon||"mapPin"));stopMarker.openTooltip();window.setTimeout(()=>{stopMarker.closeTooltip();if(site)stopMarker.setIcon(makeIcon(site.color,site.icon));},2000);}}
       let lo=0,hi=cumulative.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(cumulative[mid]<elapsed.current)lo=mid+1;else hi=mid;}
       const next=Math.max(1,lo),prev=next-1,t=(elapsed.current-cumulative[prev])/(cumulative[next]-cumulative[prev]||1),a=route.coordinates[prev],b=route.coordinates[next];
       const pos=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
       if(cumulative[next]-cumulative[prev]>.25)lastBearing.current=bearingDegrees(a,b);
       bike.current?.setLatLng(pos);
       setBicycleHeading(bike.current,lastBearing.current);
       if(follow)map.panTo(pos,{animate:true,duration:.15});
     }
     raf=requestAnimationFrame(frame);
   };
   raf=requestAnimationFrame(frame);return()=>cancelAnimationFrame(raf);
 },[playing,speed,follow,visible,map,route,cumulative,total,markerRefs,setActiveStop,setArriving]);
 return null;
}

export default function HeritageMap({height="480px",routeId="complete",trail=false}) {
 const sitesById=Object.fromEntries(SITES.map(site=>[site.id,site]));
 const routeCoordinates=[MAIN_MALL,...LOOP_ORDER.map(id=>sitesById[id].coords),MAIN_MALL];
 const routeStyle=ROUTE_STYLES[routeId]||ROUTE_STYLES.complete;
 const bounds=useMemo(()=>L.latLngBounds([MAIN_MALL,...SITES.map(site=>site.coords)]),[]);
 const markerRefs=useRef({}),animationRef=useRef(null),wrapperRef=useRef(null),visibleRef=useRef(!trail),playRequested=useRef(false),fallbackLogged=useRef(false);
 const [mapRequest,setMapRequest]=useState(null),[route,setRoute]=useState(null),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[follow,setFollow]=useState(false),[visible,setVisible]=useState(!trail),[activeStop,setActiveStop]=useState("mainmall"),[arriving,setArriving]=useState("");
 useEffect(()=>{if(!trail)return;let alive=true;const loader=loadTrailRoute["../data/trail-route.json"];if(!loader){reportFallbackOnce(fallbackLogged,"Street trail route is not generated yet; using the standard straight-line map.");return()=>{alive=false;};}loader().then(module=>{const data=module.default||module;if(alive&&isValidTrailRoute(data)){setRoute(data);if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){playRequested.current=true;setPlaying(visibleRef.current&&!document.hidden);}}else if(alive)reportFallbackOnce(fallbackLogged,"Street trail route is invalid; using the standard straight-line map.");}).catch(()=>{if(alive)reportFallbackOnce(fallbackLogged,"Street trail route is unavailable; using the standard straight-line map.");});return()=>{alive=false;};},[trail]);
 useEffect(()=>{if(!trail)return;const media=window.matchMedia("(prefers-reduced-motion: reduce)");const change=()=>{if(media.matches){playRequested.current=false;setPlaying(false);}};media.addEventListener?.("change",change);return()=>media.removeEventListener?.("change",change);},[trail]);
 useEffect(()=>{if(!trail||!wrapperRef.current)return;const observer=new IntersectionObserver(([entry])=>{visibleRef.current=entry.isIntersecting;setVisible(entry.isIntersecting);setPlaying(playRequested.current&&entry.isIntersecting&&!document.hidden);},{threshold:.12});observer.observe(wrapperRef.current);return()=>observer.disconnect();},[trail]);
 useEffect(()=>{if(!trail)return;const change=()=>setPlaying(playRequested.current&&visibleRef.current&&!document.hidden);document.addEventListener("visibilitychange",change);return()=>document.removeEventListener("visibilitychange",change);},[trail]);
 const pauseFollow=()=>setFollow(false);
 const reset=()=>{animationRef.current?.reset?.();setActiveStop("mainmall");setArriving("");playRequested.current=true;setPlaying(visibleRef.current&&!document.hidden);setFollow(false);setMapRequest({reset:true,nonce:Date.now()});};
 const togglePlayback=()=>{const next=!playing;playRequested.current=next;setPlaying(next&&visibleRef.current&&!document.hidden);};
 const safeRoute=trail&&route;
 return <div ref={wrapperRef}>
  <div ref={wrapperRef} style={{height,borderRadius:4,overflow:"hidden",border:"1px solid rgba(212,160,23,.25)"}}>
   <MapContainer center={MAIN_MALL} zoom={15} minZoom={12} maxZoom={19} style={{height:"100%",width:"100%"}} zoomControl scrollWheelZoom doubleClickZoom touchZoom>
    <MapViewport bounds={bounds} markerRefs={markerRefs} request={mapRequest} onUserGesture={trail?pauseFollow:undefined}/>
    <TileLayer attribution={(MAPBOX_TOKEN?'&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>':'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')+(safeRoute?' · '+route.attribution:'')} url={MAPBOX_TILE_URL} tileSize={MAPBOX_TOKEN?512:256} zoomOffset={MAPBOX_TOKEN?-1:0} maxZoom={19}/>
    {safeRoute?<TrailAnimation route={route} playing={playing} speed={speed} follow={follow} visible={visible} markerRefs={markerRefs} setActiveStop={setActiveStop} setArriving={setArriving} animationRef={animationRef}/>:<Polyline positions={routeCoordinates} pathOptions={{...routeStyle,weight:6,opacity:.95,lineCap:"round",lineJoin:"round"}}/>}
    <Circle center={MAIN_MALL} radius={600} pathOptions={{color:"#C1440E",fillColor:"#C1440E",fillOpacity:.06,weight:1.5,dashArray:"6 4"}}/>
    <Marker position={MAIN_MALL} icon={meetIcon}><Popup><div style={{fontFamily:"Outfit,sans-serif",minWidth:160}}><strong style={{color:"#C1440E",fontSize:13}}><Icon name="mapPin" size={14}/> Main Mall</strong><div style={{fontSize:11,marginTop:4,color:"#555"}}>Meeting point for all City Bike Tours rides.<br/><em>Look for the orange flag.</em></div></div></Popup></Marker>
    {SITES.map(site=><Marker key={site.id} ref={marker=>{if(marker){markerRefs.current[site.id]=marker;if(safeRoute&&!marker.getTooltip())marker.bindTooltip(site.name,{direction:"top",offset:[0,-12]});}}} position={site.coords} icon={makeIcon(site.color,site.icon)} eventHandlers={{click:()=>setMapRequest({siteId:site.id})}}><Popup><div style={{fontFamily:"Outfit,sans-serif",minWidth:180}}><strong style={{color:site.color,fontSize:13}}><Icon name={site.icon} size={14}/> {site.name}</strong><div style={{fontSize:11,marginTop:4,color:"#555",fontWeight:600}}>{site.street}, Gaborone</div><div style={{fontSize:11,marginTop:4,color:"#555",lineHeight:1.4}}>{site.short}</div></div></Popup></Marker>)}
   </MapContainer>
  </div>
  {trail&&safeRoute&&<div className="trail-animation-controls" style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:10,marginTop:12}}>
   <button type="button" aria-label={playing?"Pause bicycle":"Play bicycle"} onClick={togglePlayback}>{playing?"Ⅱ Pause":"▶ Play"}</button>
   <button type="button" aria-label="Restart bicycle at Main Mall" onClick={reset}>↺ Restart</button>
   <button type="button" aria-label="Play at 1x speed" aria-pressed={speed===1} onClick={()=>setSpeed(1)}>1x</button>
   <button type="button" aria-label="Play at 2x speed" aria-pressed={speed===2} onClick={()=>setSpeed(2)}>2x</button>
   <button type="button" aria-label="Follow the bike" aria-pressed={follow} onClick={()=>setFollow(v=>!v)}>Follow the bike {follow?"On":"Off"}</button>
   <span>Route length {(route.distanceMeters/1000).toFixed(1)} km along streets · {route.provider} · {route.attribution}</span>
   <span className="sr-only" aria-live="polite">{arriving}</span>
  </div>}
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8,marginTop:12}}>
   {SITES.map(site=><button key={site.id} type="button" aria-pressed={activeStop===site.id} onClick={()=>setMapRequest({siteId:site.id})} style={{minHeight:44,padding:"10px 12px",backgroundColor:activeStop===site.id?"rgba(212,160,23,.22)":"rgba(245,237,217,.05)",border:`1px solid ${activeStop===site.id?"#D4A017":site.color+"66"}`,borderRadius:3,color:"#F5EDD9",cursor:"pointer",textAlign:"left",fontSize:12,outlineOffset:3}}><Icon name={site.icon} size={14} style={{marginRight:8}}/>{site.name}</button>)}
   <button type="button" onClick={reset} style={{minHeight:44,padding:"10px 12px",backgroundColor:"#D4A017",border:"1px solid #D4A017",borderRadius:3,color:"#0D0805",cursor:"pointer",fontSize:12,fontWeight:700,outlineOffset:3}}>Reset view</button>
  </div>
 </div>;
}
