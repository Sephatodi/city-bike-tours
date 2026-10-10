import { NextResponse } from "next/server";

const DEFAULT_FRONTEND_ORIGIN = "https://city-bike-tours.vercel.app";

// FRONTEND_ORIGIN may list several origins, comma separated (e.g. production + preview).
function allowedOrigins() {
  const configured = [process.env.FRONTEND_ORIGIN, process.env.PUBLIC_FRONTEND_URL]
    .filter(Boolean)
    .flatMap((origins) => origins.split(","))
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

  return new Set([DEFAULT_FRONTEND_ORIGIN, ...configured]);
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function middleware(request) {
  const origin = request.headers.get("origin");
  const allowed = origin && allowedOrigins().has(origin);

  if (request.method === "OPTIONS") {
    if (!allowed) return new NextResponse(null, { status: 403 });
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  }

  const response = NextResponse.next();
  if (allowed) Object.entries(corsHeaders(origin)).forEach(([name, value]) => response.headers.set(name, value));
  return response;
}

// Public endpoints used by the Vite site. Admin APIs are NOT listed: they stay same-origin + session-protected.
export const config = {
  matcher: ["/api/booking-requests", "/api/health", "/api/routes-config", "/api/content", "/api/availability", "/api/tickets/:path*"],
};
