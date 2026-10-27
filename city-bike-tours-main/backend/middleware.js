import { NextResponse } from "next/server";

// Keep this in sync with the Vite frontend's deployed origin. Additional preview
// origins can be comma-separated in FRONTEND_ORIGIN.
function allowedOrigins() {
  const configured = process.env.FRONTEND_ORIGIN || "https://city-bike-tours.vercel.app";
  return configured.split(",").map((o) => o.trim().replace(/\/$/, "")).filter(Boolean);
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function middleware(request) {
  const origin = request.headers.get("origin");
  const allowed = Boolean(origin && allowedOrigins().includes(origin.replace(/\/$/, "")));

  // Preflight requests must be answered before route handlers run.
  if (request.method === "OPTIONS") {
    if (!allowed) return new NextResponse(null, { status: 403 });
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  }

  const response = NextResponse.next();
  // Add CORS headers to successful responses and API error responses alike.
  if (allowed) {
    Object.entries(corsHeaders(origin)).forEach(([name, value]) => response.headers.set(name, value));
  }
  return response;
}

// Customer and community endpoints are public-facing; admin APIs remain session-protected.
export const config = {
  matcher: [
    "/api/booking-requests",
    "/api/health",
    "/api/track",
    "/api/enquiries",
    "/api/reviews",
    "/api/subscribe",
    "/api/seo",
    "/api/routes-config",
    "/api/content",
    "/api/settings",
    "/api/availability",
    "/api/tickets/:path*",
    "/api/messages/inbox",
    "/api/customer/:path*",
    "/api/community/:path*",
    "/api/download",
  ],
};
