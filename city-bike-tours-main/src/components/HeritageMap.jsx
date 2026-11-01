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
const riderSvg=`<svg viewBox="0 0 120 92" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="#F5B800" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><circle cx="26" cy="68" r="19" stroke-width="5"/><circle cx="96" cy="68" r="19" stroke-width="5"/><path d="M5 62A23 23 0 0 1 36 47M76 52A23 23 0 0 1 112 58M26 68L58 71M26 68L44 52L58 71L86 41L96 68M44 52L86 41M86 41L87 35M34 49L50 49M52 25L44 46M56 28L86 34M84 34Q93 31 94 40M46 50L68 54L63 75M60 77L74 77"/><circle cx="58" cy="71" r="7"/><circle cx="26" cy="68" r="3.5" fill="#F5B800"/><circle cx="96" cy="68" r="3.5" fill="#F5B800"/></g><circle cx="60" cy="11" r="9.5" fill="#F5B800"/></svg>`;
function bicycleIcon(flip=false) { return L.divIcon({className:"trail-moving-bicycle",html:`<div style="width:58px;height:48px;transform:scaleX(${flip?-1:1});filter:drop-shadow(0 2px 3px #07140c) drop-shadow(0 0 5px rgba(245,184,0,.7))">${riderSvg}</div>`,iconSize:[58,48],iconAnchor:[29,24]}); }

function MapViewport({bounds,markerRefs,request,onUserGesture}) {
 const map=useMap();
 useEffect(()=>{const pause=()=>onUserGesture?.();map.on("dragstart zoomstart",pause);return()=>map.off("dragstart zoomstart",pause);},[map,onUserGesture]);
 useEffect(()=>{if(request?.siteId){const site=SITES.find(s=>s.id===request.siteId);if(!site)return;map.flyTo(site.coords,18,{duration:.8});markerRefs.current[site.id]?.openPopup();return;}map.fitBounds(bounds.pad(.2),{maxZoom:16});},[bounds,map,markerRefs,request]);
 return null;
}
function TrailAnimation({route,playing,speed,follow,visible,markerRefs,setActiveStop,setArriving,animationRef}) {
 const map=useMap(), bike=useRef(null), ridden=useRef(null), elapsed=useRef(0), direction=useRef(false), lastStop=useRef(-1);
 const cumulative=useMemo(()=>{const values=[0];for(let i=1;i<route.coordinates.length;i++)values.push(values[i-1]+metresBetween(route.coordinates[i-1],route.coordinates[i]));return values;},[route]);
 const total=cumulative[cumulative.length-1];
 useEffect(()=>{
   const coords=route.coordinates;
   L.polyline(coords,{color:"#E5683F",weight:6,opacity:.95,lineCap:"round",lineJoin:"round"}).addTo(map);
   ridden.current=L.polyline([coords[0]],{color:"#D4A017",weight:7,opacity:1,lineCap:"round",lineJoin:"round"}).addTo(map);
   bike.current=L.marker(coords[0],{icon:bicycleIcon(),interactive:false,zIndexOffset:1200}).addTo(map);
   animationRef.current={reset:()=>{elapsed.current=0;lastStop.current=-1;bike.current?.setLatLng(coords[0]);ridden.current?.setLatLngs([coords[0]]);bike.current?.setIcon(bicycleIcon(false));direction.current=false;}};
   return()=>{map.eachLayer(layer=>{if(layer===ridden.current||layer===bike.current||layer instanceof L.Polyline&&layer.options.color==="#E5683F")map.removeLayer(layer);});animationRef.current=null;};
 },[map,route,animationRef]);
 useEffect(()=>{
   if(!playing||!visible||document.hidden)return undefined;
   let raf=0,previous=0,pauseUntil=0,lastDistance=elapsed.current;
   const stopList=route.stops.filter(s=>s.id!=="mainmall");
   const frame=(now)=>{
     if(!previous)previous=now;
     const dt=Math.min(80,now-previous);previous=now;
     if(now>=pauseUntil){
       const before=elapsed.current;
       elapsed.current+=dt*(total/50000)*speed;
       if(elapsed.current>=total){elapsed.current=0;lastStop.current=-1;lastDistance=0;}
       const reached=stopList.findIndex((stop,index)=>index>lastStop.current&&before<stop.atMeters&&elapsed.current>=stop.atMeters);
       if(reached>=0){const stop=stopList[reached];elapsed.current=stop.atMeters;lastStop.current=reached;pauseUntil=now+2000;const site=SITES.find(s=>s.id===stop.id);setActiveStop(stop.id);setArriving(site?`Arriving at ${site.name}`:"Arriving at Main Mall");markerRefs.current[stop.id]?.openTooltip();window.setTimeout(()=>markerRefs.current[stop.id]?.closeTooltip(),2000);}
       let lo=0,hi=cumulative.length-1;while(lo<hi){const mid=(lo+hi)>>1;if(cumulative[mid]<elapsed.current)lo=mid+1;else hi=mid;}
       const next=Math.max(1,lo),prev=next-1,t=(elapsed.current-cumulative[prev])/(cumulative[next]-cumulative[prev]||1),a=route.coordinates[prev],b=route.coordinates[next];
       const pos=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],dx=b[1]-a[1];
       if(Math.abs(dx)>.000015){const flip=dx<0;if(flip!==direction.current){direction.current=flip;bike.current?.setIcon(bicycleIcon(flip));}}
       bike.current?.setLatLng(pos);
       const traveled=route.coordinates.slice(0,prev+1);traveled.push(pos);ridden.current?.setLatLngs(traveled);
       if(follow)map.panTo(pos,{animate:false});
       lastDistance=elapsed.current;
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
 const markerRefs=useRef({}),animationRef=useRef(null),wrapperRef=useRef(null),wasPlaying=useRef(false),playingRef=useRef(false);
 const [mapRequest,setMapRequest]=useState(null),[route,setRoute]=useState(null),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[follow,setFollow]=useState(false),[visible,setVisible]=useState(!trail),[reducedMotion,setReducedMotion]=useState(false),[activeStop,setActiveStop]=useState("mainmall"),[arriving,setArriving]=useState("");
 useEffect(()=>{if(!trail)return;let alive=true;const loader=loadTrailRoute["../data/trail-route.json"];if(!loader){console.info("Street trail route is not generated yet; using the standard straight-line map.");return()=>{alive=false;};}loader().then(module=>{const data=module.default||module;if(alive&&Array.isArray(data.coordinates)&&data.coordinates.length>=50&&Array.isArray(data.stops)&&data.distanceMeters>0)setRoute(data);else if(alive)console.info("Street trail route is invalid; using the standard straight-line map.");}).catch(()=>{if(alive)console.info("Street trail route is unavailable; using the standard straight-line map.");});return()=>{alive=false;};},[trail]);
 useEffect(()=>{if(!trail)return;const media=window.matchMedia("(prefers-reduced-motion: reduce)");setReducedMotion(media.matches);const change=()=>{setReducedMotion(media.matches);if(media.matches)setPlaying(false);};media.addEventListener?.("change",change);return()=>media.removeEventListener?.("change",change);},[trail]);
 useEffect(()=>{playingRef.current=playing;},[playing]);
 useEffect(()=>{if(!trail||!wrapperRef.current)return;const observer=new IntersectionObserver(([entry])=>{setVisible(entry.isIntersecting);if(!entry.isIntersecting){wasPlaying.current=playingRef.current;setPlaying(false);}else if(wasPlaying.current){setPlaying(true);wasPlaying.current=false;}},{threshold:.12});observer.observe(wrapperRef.current);return()=>observer.disconnect();},[trail]);
 useEffect(()=>{const change=()=>{if(document.hidden){wasPlaying.current=playing;setPlaying(false);}else if(wasPlaying.current){setPlaying(true);wasPlaying.current=false;}};document.addEventListener("visibilitychange",change);return()=>document.removeEventListener("visibilitychange",change);},[playing]);
 const pauseFollow=()=>setFollow(false);
 const reset=()=>{animationRef.current?.reset?.();setActiveStop("mainmall");setArriving("");setPlaying(true);setFollow(false);setMapRequest({reset:true,nonce:Date.now()});};
 const safeRoute=trail&&route;
 return <div ref={wrapperRef}>
  <div style={{height,borderRadius:4,overflow:"hidden",border:"1px solid rgba(212,160,23,.25)"}}>
   <MapContainer center={MAIN_MALL} zoom={15} minZoom={12} maxZoom={19} style={{height:"100%",width:"100%"}} zoomControl scrollWheelZoom doubleClickZoom touchZoom>
    <MapViewport bounds={bounds} markerRefs={markerRefs} request={mapRequest} onUserGesture={trail?pauseFollow:undefined}/>
    <TileLayer attribution={MAPBOX_TOKEN?'&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>':'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'} url={MAPBOX_TILE_URL} tileSize={MAPBOX_TOKEN?512:256} zoomOffset={MAPBOX_TOKEN?-1:0} maxZoom={19}/>
    {safeRoute?<TrailAnimation route={route} playing={playing} speed={speed} follow={follow} visible={visible} markerRefs={markerRefs} setActiveStop={setActiveStop} setArriving={setArriving} animationRef={animationRef}/>:<Polyline positions={routeCoordinates} pathOptions={{...routeStyle,weight:6,opacity:.95,lineCap:"round",lineJoin:"round"}}/>}
    <Circle center={MAIN_MALL} radius={600} pathOptions={{color:"#C1440E",fillColor:"#C1440E",fillOpacity:.06,weight:1.5,dashArray:"6 4"}}/>
    <Marker position={MAIN_MALL} icon={meetIcon}><Popup><div style={{fontFamily:"Outfit,sans-serif",minWidth:160}}><strong style={{color:"#C1440E",fontSize:13}}><Icon name="mapPin" size={14}/> Main Mall</strong><div style={{fontSize:11,marginTop:4,color:"#555"}}>Meeting point for all City Bike Tours rides.<br/><em>Look for the orange flag.</em></div></div></Popup></Marker>
    {SITES.map(site=><Marker key={site.id} ref={marker=>{if(marker){markerRefs.current[site.id]=marker;if(safeRoute&&!marker.getTooltip())marker.bindTooltip(site.name,{direction:"top",offset:[0,-12]});}}} position={site.coords} icon={makeIcon(site.color,site.icon)} eventHandlers={{click:()=>setMapRequest({siteId:site.id})}}><Popup><div style={{fontFamily:"Outfit,sans-serif",minWidth:180}}><strong style={{color:site.color,fontSize:13}}><Icon name={site.icon} size={14}/> {site.name}</strong><div style={{fontSize:11,marginTop:4,color:"#555",fontWeight:600}}>{site.street}, Gaborone</div><div style={{fontSize:11,marginTop:4,color:"#555",lineHeight:1.4}}>{site.short}</div></div></Popup></Marker>)}
   </MapContainer>
  </div>
  {trail&&safeRoute&&<div className="trail-animation-controls" style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:10,marginTop:12}}>
   <button type="button" aria-label={playing?"Pause bicycle":"Play bicycle"} onClick={()=>setPlaying(v=>!v)}>{playing?"Ⅱ Pause":"▶ Play"}</button>
   <button type="button" aria-label="Restart bicycle at Main Mall" onClick={reset}>↺ Restart</button>
   <button type="button" aria-label="Change bicycle speed" aria-pressed={speed===2} onClick={()=>setSpeed(v=>v===1?2:1)}>{speed}x speed</button>
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
