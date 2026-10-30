import {formatDateTime,timeAgo} from "../lib/time";
import useNow from "../hooks/useNow";
export default function Stamp({value,className=""}){const now=useNow(30000);if(!value)return null;const date=new Date(value);if(Number.isNaN(date.getTime()))return null;return <time className={className} dateTime={date.toISOString()} title={formatDateTime(date)}>{formatDateTime(date)} - {timeAgo(date,now)}</time>;}
