import useNow from "../hooks/useNow";
import {siteClock} from "../lib/time";
export default function SiteClock(){const clock=siteClock(useNow(1000));return <span className="site-clock"><span className="site-clock-dot" aria-hidden="true"/>Gaborone time <strong>{clock.label}</strong></span>;}
