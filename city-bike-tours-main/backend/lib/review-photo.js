import { put } from "@vercel/blob";
import { newId } from "@/lib/id";
import { sniffImage } from "@/lib/blob-url";

export const MAX_REVIEW_PHOTO_BYTES = 4 * 1024 * 1024; // serverless request bodies are capped around 4.5MB

// Checks and stores one review photo. Returns { url } or { error, status }.
export async function storeReviewPhoto(file) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return { error: "Photo uploads aren't switched on yet.", status: 501 };
  if (file.size > MAX_REVIEW_PHOTO_BYTES) return { error: "That photo is too large (max 4MB).", status: 400 };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImage(bytes);
  if (!type) return { error: "Only JPEG, PNG, WebP or GIF photos are allowed.", status: 400 };
  const extension = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[type];
  try {
    const { url } = await put(`city-tours-community/review-${newId()}.${extension}`, Buffer.from(bytes), { access: "public", contentType: type });
    return { url };
  } catch (error) {
    console.error("Review photo upload failed:", error);
    return { error: "Upload failed. Please try again.", status: 502 };
  }
}
