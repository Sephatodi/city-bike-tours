const MAX_SIDE = 1800;
const MAX_BYTES = 3.8 * 1024 * 1024; // the backend accepts 4MB per request

// Shrinks phone photos in the browser before upload so they fit and load quickly.
export async function prepareImage(file) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose a photo (JPEG, PNG, WebP or GIF).");
  if (file.type === "image/gif") {
    if (file.size > MAX_BYTES) throw new Error("That GIF is too large (max 4MB).");
    return file;
  }
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= MAX_BYTES) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.86, 0.72, 0.6]) {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= MAX_BYTES) return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
    }
  } catch { /* fall through to the size check below */ }
  if (file.size > MAX_BYTES) throw new Error("That photo is too large. Try a smaller one (max 4MB).");
  return file;
}
