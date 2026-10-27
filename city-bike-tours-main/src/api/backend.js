// Use the explicit Vercel environment variable when supplied. Without it, route
// production sign-in requests to the deployed Render API instead of the Vercel
// frontend (which does not host these /api/customer endpoints).
const configuredBackend = import.meta.env.VITE_API_BASE_URL?.trim();
const defaultBackend = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://city-bike-tours.onrender.com";

export const BACKEND_BASE_URL = (configuredBackend || defaultBackend).replace(/\\/+$/, "");
export const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_BASE_URL?.replace(/\\/+$/, "") ?? "";

export function backendUrl(path) {
  return `${BACKEND_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchBackendJson(path, options, fallbackMessage) {
  const response = await fetch(backendUrl(path), options);
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || fallbackMessage);
  if (!result) throw new Error(fallbackMessage);
  return result;
}
