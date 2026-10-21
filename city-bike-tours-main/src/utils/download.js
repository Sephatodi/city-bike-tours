const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
import { backendUrl } from "../api/backend";

/**
 * Saves a photo the team has allowed riders to download. The backend checks that the rider is
 * signed in and that downloads are switched on for this photo, then sends the file.
 * kind: "content" (team photo) or "community" (rider photo).
 */
export async function downloadPhoto({ token, kind, id, name }) {
  const response = await fetch(backendUrl(`/api/download?kind=${kind}&id=${encodeURIComponent(id)}`), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || "We couldn't download that photo. Please try again.");
  }
  const blob = await response.blob();
  const base = (name || "city-bike-tours-photo").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "city-bike-tours-photo";
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${base}.${EXTENSIONS[blob.type] || "jpg"}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 4000);
}
