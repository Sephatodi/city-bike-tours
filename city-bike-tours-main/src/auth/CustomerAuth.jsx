import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const signOut = useCallback(async () => {
    try {
      const response = await fetch("/api/customer/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Unable to sign out. Please try again.");
    } finally {
      setUser(null);
      setReady(true);
    }
  }, []);

  const signIn = useCallback((nextUser) => {
    setUser(nextUser || null);
    setReady(true);
  }, []);

  const api = useCallback(async (path, { method = "GET", body, form, signal } = {}) => {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetch(path, {
      method,
      headers,
      signal,
      cache: "no-store",
      credentials: "include",
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
    const result = await response.json().catch(() => null);
    if (response.status === 401) await signOut();
    if (!response.ok) throw new Error(result?.error || "Something went wrong. Please try again.");
    return result ?? {};
  }, [signOut]);

  useEffect(() => {
    try {
      window.localStorage.removeItem("cbt-customer-token");
    } catch {
      // Storage may be disabled by the browser.
    }

    const controller = new AbortController();
    fetch("/api/customer/me", {
      signal: controller.signal,
      cache: "no-store",
      credentials: "include",
    })
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        if (response.ok && result?.user && !controller.signal.aborted) setUser(result.user);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setReady(true);
      });
    return () => controller.abort();
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    isSignedIn: Boolean(user),
    signIn,
    signOut,
    api,
  }), [user, ready, signIn, signOut, api]);
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
export function takeNext(fallback = "/dashboard") {
  try {
    const value = window.sessionStorage.getItem(NEXT_KEY);
    window.sessionStorage.removeItem(NEXT_KEY);
    return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
  } catch { return fallback; }
}
