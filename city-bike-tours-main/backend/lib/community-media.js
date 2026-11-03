import { createHmac, timingSafeEqual } from "node:crypto";
import { isOurBlob } from "@/lib/blob-url";

export const PRIVATE_COMMUNITY_PREFIX = "/city-tours-rider-private/";
const SIGNED_MEDIA_TTL_SECONDS = 5 * 60;

const signingSecret = () => process.env.BLOB_PRIVATE_READ_WRITE_TOKEN || "";
const sign = (id, expires) => createHmac("sha256", signingSecret())
  .update(`community-media:${id}:${expires}`)
  .digest("base64url");

export function isPrivateCommunityBlob(url) {
  return isOurBlob(url, [PRIVATE_COMMUNITY_PREFIX]);
}

export function communityMediaUrl(request, photo) {
  const mediaUrl = new URL(`/api/community/photos/${encodeURIComponent(photo.id)}/media`, request.nextUrl.origin);
  if (photo.status !== "approved" || photo.visibility === "private") {
    const secret = signingSecret();
    if (!secret) return "";
    const expires = Math.floor(Date.now() / 1000) + SIGNED_MEDIA_TTL_SECONDS;
    const signature = sign(photo.id, expires);
    mediaUrl.searchParams.set("expires", String(expires));
    mediaUrl.searchParams.set("signature", signature);
  }
  return mediaUrl.toString();
}

export function hasValidCommunityMediaSignature(id, expiresValue, signature) {
  const secret = signingSecret();
  const expires = Number(expiresValue);
  const now = Math.floor(Date.now() / 1000);
  if (!secret || !Number.isSafeInteger(expires) || expires < now || expires > now + SIGNED_MEDIA_TTL_SECONDS) return false;
  const expected = Buffer.from(sign(id, expires));
  const provided = Buffer.from(String(signature || ""));
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}
