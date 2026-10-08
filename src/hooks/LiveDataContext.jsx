import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchBackendJson } from "../api/backend";
import { ROUTES_DATA } from "../data";

const LiveDataContext = createContext(null);

function mergeRoutes(configuredRoutes) {
  const byId = new Map(configuredRoutes.map((route) => [route.routeId, route]));
  return ROUTES_DATA.map((route) => {
    const configured = byId.get(route.id);
    if (!configured) return route;

    const price = Number(configured.priceBwp);
    return {
      ...route,
      ...(typeof configured.routeName === "string" ? { name: configured.routeName } : {}),
      ...(Number.isFinite(price) ? { price } : {}),
    };
  });
}

export function LiveDataProvider({ children }) {
  const [routes, setRoutes] = useState(ROUTES_DATA);
  const [content, setContent] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const controller = new AbortController();

    async function load(key, path, property, onData) {
      try {
        const result = await fetchBackendJson(path, { signal: controller.signal, cache: "no-store" }, `Could not load live ${key}.`);
        if (!Array.isArray(result[property])) throw new Error(`The backend returned invalid ${key} data.`);
        onData(result[property]);
        setErrors((current) => ({ ...current, [key]: "" }));
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrors((current) => ({ ...current, [key]: error.message || `Could not load live ${key}.` }));
      }
    }

    void load("prices", "/api/routes-config", "routes", (configured) => setRoutes(mergeRoutes(configured)));
    void load("content", "/api/content", "content", setContent);

    return () => controller.abort();
  }, []);

  const value = useMemo(() => ({ routes, content, errors }), [routes, content, errors]);

  return (
    <LiveDataContext.Provider value={value}>
      {Object.values(errors).some(Boolean) && (
        <div
          role="status"
          aria-live="polite"
          style={{ position: "fixed", top: 92, left: 16, right: 16, zIndex: 60, padding: "10px 16px", color: "#fff", background: "#7a2812", textAlign: "center" }}
        >
          Some live website data could not be loaded. Please try again later.
        </div>
      )}
      {children}
    </LiveDataContext.Provider>
  );
}

export function useLiveData() {
  const value = useContext(LiveDataContext);
  if (!value) throw new Error("useLiveData must be used within LiveDataProvider.");
  return value;
}
