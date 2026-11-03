const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};
import { backendUrl } from "../api/backend";

/**
 * Saves media the team or rider has allowed the public to download.
 * kind: "content" (team media) or "community" (rider media).
 */
export async function downloadMedia({ kind, id, name }) {
  const response = await fetch(backendUrl(`/api/download?kind=${kind}&id=${encodeURIComponent(id)}`), {
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || "We couldn't download that photo. Please try again.");
  }
  const blob = await response.blob();
  const extension = EXTENSIONS[blob.type];
  if (!extension) throw new Error("This media format can't be downloaded.");
  const base = (name || "city-bike-tours-photo").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "city-bike-tours-photo";
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${base}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 4000);
}
