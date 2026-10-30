import { useEffect,useState } from "react";
const ZONE="Africa/Gaborone";
const parts=(v,o={})=>new Intl.DateTimeFormat("en-GB",{timeZone:ZONE,...o}).format(v instanceof Date?v:new Date(v));
export const formatDate=v=>parts(v,{day:"2-digit",month:"short",year:"numeric"});
export const formatTime=v=>parts(v,{hour:"2-digit",minute:"2-digit",hour12:false});
export const formatDateTime=v=>`${formatDate(v)}, ${formatTime(v)}`;
export function timeAgo(v,now=new Date()){const ms=now-new Date(v);if(!Number.isFinite(ms))return "";const m=Math.floor(ms/60000);if(m<1)return "just now";if(m<60)return `${m} min ago`;const h=Math.floor(m/60);if(h<24)return `${h} h ago`;if(h<48)return "yesterday";return formatDate(v);}
export const dayKey=v=>new Intl.DateTimeFormat("en-CA",{timeZone:ZONE,year:"numeric",month:"2-digit",day:"2-digit"}).format(v instanceof Date?v:new Date(v));
export function dayLabel(v,now=new Date()){const k=dayKey(v),today=dayKey(now),y=new Date(now);y.setDate(y.getDate()-1);return k===today?"Today":k===dayKey(y)?"Yesterday":parts(v,{weekday:"long",day:"numeric",month:"short",year:"numeric"});}
export function siteClock(now=new Date()){return {weekday:parts(now,{weekday:"long"}),hour:parts(now,{hour:"2-digit",hour12:false}),minute:parts(now,{minute:"2-digit"}),label:parts(now,{hour:"2-digit",minute:"2-digit",hour12:false})};}
export function nextRide(now=new Date()){const p=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:ZONE,weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(now).map(x=>[x.type,x.value]));const day=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(p.weekday),mins=Number(p.hour)*60+Number(p.minute);for(let off=0;off<8;off++){const d=(day+off)%7;if(d===0||d===1||d===2)continue;const slots=d===6?[{m:540,n:"Casual Saturday"}]:[{m:540,n:"Heritage City Ride"},{m:840,n:"Heritage City Ride"}];for(const s of slots)if(off>0||s.m>mins){const date=new Date(now);date.setDate(date.getDate()+off);date.setHours(0,s.m,0,0);return {date,name:s.n,label:off===0?"Today":off===1?"Tomorrow":parts(date,{weekday:"long"}),time:parts(date,{hour:"numeric",minute:"2-digit",hour12:true})};}}return null;}
