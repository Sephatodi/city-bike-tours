import { useNow } from "../hooks/useNow";
import { siteClock } from "../lib/time";

// Live Gaborone date and time.
export default function SiteClock({ className = "" }) {
  const clock = siteClock(useNow(15000));
  return <span className={`site-clock ${className}`}><span className="site-clock-dot" aria-hidden="true" /> Gaborone time · {clock.date}, {clock.time}</span>;
}
