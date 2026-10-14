import { NextResponse } from "next/server";
import { del, list } from "@vercel/blob";
import { requirePermission } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requirePermission("media:read");
  if (guard.error) return guard.error;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ configured: false, files: [] });
  try {
    const { blobs } = await list({ prefix: "city-tours/", limit: 500 });
    const files = blobs.map((b) => ({ url: b.url, name: b.pathname.replace(/^city-tours\/\d+-/, ""), size: b.size, uploadedAt: b.uploadedAt }))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    return NextResponse.json({ configured: true, files });
  } catch (error) {
    console.error("Media list failed:", error);
    return NextResponse.json({ error: "Could not load your files." }, { status: 502 });
  }
}

export async function DELETE(request) {
  const guard = await requirePermission("media:write");
  if (guard.error) return guard.error;
  const url = new URL(request.url).searchParams.get("url") || "";
  let ok = false;
  try { const u = new URL(url); ok = u.protocol === "https:" && u.hostname.endsWith(".blob.vercel-storage.com") && u.pathname.startsWith("/city-tours/"); } catch { /* invalid */ }
  if (!ok) return NextResponse.json({ error: "That isn't one of your uploaded files." }, { status: 400 });
  try {
    await del(url);
    await logAudit(guard.staff, "media.delete", `Deleted file ${decodeURIComponent(url.split("/").pop())}`, { targetType: "media", targetId: url });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media delete failed:", error);
    return NextResponse.json({ error: "Could not delete the file." }, { status: 502 });
  }
}
