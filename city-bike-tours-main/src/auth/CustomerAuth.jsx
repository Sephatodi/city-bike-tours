import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { backendUrl } from "../api/backend";

const STORAGE_KEY = "cbt-customer-token";
const CustomerAuthContext = createContext(null);

// Storage can be blocked (private mode, strict settings), so every access is guarded.
const readToken = () => { try { return window.localStorage.getItem(STORAGE_KEY) || ""; } catch { return ""; } };
const writeToken = (value) => {
  try { value ? window.localStorage.setItem(STORAGE_KEY, value) : window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
};

export function CustomerAuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!readToken());

  const signOut = useCallback(() => {
    writeToken("");
    setToken("");
    setUser(null);
  }, []);

  const signIn = useCallback((nextToken, nextUser) => {
    writeToken(nextToken);
    setToken(nextToken);
    setUser(nextUser || null);
    setReady(true);
  }, []);

  // Calls the backend as the signed-in customer. Throws Error(message) on failure.
  const api = useCallback(async (path, { method = "GET", body, form, signal } = {}) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetch(backendUrl(path), {
      method, headers, signal, cache: "no-store",
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
    const result = await response.json().catch(() => null);
    if (response.status === 401 && token) signOut();
    if (!response.ok) throw new Error(result?.error || "Something went wrong. Please try again.");
    return result ?? {};
  }, [token, signOut]);

  // Confirm a stored token is still valid when the site opens.
  useEffect(() => {
    if (!token || user) { setReady(true); return undefined; }
    const controller = new AbortController();
    api("/api/customer/me", { signal: controller.signal })
      .then((result) => setUser(result.user))
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setReady(true); });
    return () => controller.abort();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(() => ({ token, user, ready, isSignedIn: Boolean(token && user), signIn, signOut, api }), [token, user, ready, signIn, signOut, api]);
  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomer() {
  const value = useContext(CustomerAuthContext);
  if (!value) throw new Error("useCustomer must be used within CustomerAuthProvider.");
  return value;
}

// Where to send people after they sign in.
export const NEXT_KEY = "cbt-after-login";
export function rememberNext(path) { try { window.sessionStorage.setItem(NEXT_KEY, path); } catch { /* ignore */ } }
export function takeNext(fallback = "/connect") {
  try {
    const value = window.sessionStorage.getItem(NEXT_KEY);
    window.sessionStorage.removeItem(NEXT_KEY);
    return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
  } catch { return fallback; }
}
