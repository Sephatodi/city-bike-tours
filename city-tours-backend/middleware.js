import { NextResponse } from "next/server";

// FRONTEND_ORIGIN may list several origins, comma separated (e.g. production + preview).
function allowedOrigins() {
  return (process.env.FRONTEND_ORIGIN || "").split(",").map((o) => o.trim().replace(/\/$/, "")).filter(Boolean);
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
  const allowed = origin && allowedOrigins().includes(origin);

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
  matcher: ["/api/booking-requests", "/api/health", "/api/routes-config", "/api/content"],
};
