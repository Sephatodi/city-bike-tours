import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { pageViews } from "@/db/schema";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const done = () => new NextResponse(null, { status: 204 });
const gaboroneDay = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Gaborone" }).format(new Date());

// Counts a page view without cookies. The visitor id is a hash that changes every day, so people can't be followed over time.
export async function POST(request) {
  const ip = clientIp(request);
  if (!rateLimit(`track:${ip}`, 120, 60 * 1000)) return done();
  const ua = request.headers.get("user-agent") || "";
  if (!ua || /bot|crawl|spider|slurp|preview|headless|monitor|uptime|curl|wget/i.test(ua)) return done();

  const body = await request.json().catch(() => null);
  let path = String(body?.path || "/").split("?")[0].split("#")[0].slice(0, 200);
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.startsWith("/admin") || path.startsWith("/api")) return done();

  let referrer = null;
  try {
    const host = new URL(String(body?.referrer || "")).host;
    if (host && host !== String(body?.host || "")) referrer = host.replace(/^www\./, "").slice(0, 100);
  } catch { /* no usable referrer */ }

  const day = gaboroneDay();
  const visitor = createHash("sha256").update(`${ip}|${ua}|${day}|${process.env.NEXTAUTH_SECRET || ""}`).digest("hex").slice(0, 24);
  const device = /ipad|tablet/i.test(ua) ? "tablet" : /mobi|android|iphone/i.test(ua) ? "mobile" : "desktop";

  try { await db.insert(pageViews).values({ day, path, visitor, referrer, device }); } catch (error) { console.error("Page view not saved:", error.message); }
  return done();
}
