export const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? "";

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
