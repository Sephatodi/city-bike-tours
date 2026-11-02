import { useEffect, useRef } from "react";

// Runs `callback` now, then every `intervalMs` while the tab is visible, and again whenever the visitor comes back
// to the tab. This is what keeps messages, reviews and prices up to date without a page refresh.
export function usePolling(callback, intervalMs, enabled = true) {
  const latest = useRef(callback);
  useEffect(() => { latest.current = callback; });
  useEffect(() => {
    if (!enabled) return undefined;
    const run = () => { if (!document.hidden) void latest.current(); };
    run();
    const timer = setInterval(run, intervalMs);
    document.addEventListener("visibilitychange", run);
    window.addEventListener("focus", run);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", run); window.removeEventListener("focus", run); };
  }, [intervalMs, enabled]);
}
