import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/admin";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
// Serverless request bodies are capped (~4.5MB on Vercel). For longer videos paste a YouTube/Vimeo link instead.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "File uploads are not configured (set BLOB_READ_WRITE_TOKEN). You can still paste a media URL." }, { status: 501 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  if (!TYPES.includes(file.type)) return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF, MP4 or WebM files are allowed." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large (max 4MB). For larger videos paste a YouTube/Vimeo link." }, { status: 400 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  try {
    const blob = await put(`city-tours/${Date.now()}-${safeName}`, file, { access: "public" });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 502 });
  }
}
