import { NextResponse } from "next/server";

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
  const allowedOrigin = process.env.FRONTEND_ORIGIN;

  if (request.method === "OPTIONS") {
    if (!origin || origin !== allowedOrigin) return new NextResponse(null, { status: 403 });
    return new NextResponse(null, { status: 204, headers: corsHeaders(allowedOrigin) });
  }

  const response = NextResponse.next();
  if (origin && origin === allowedOrigin) {
    Object.entries(corsHeaders(allowedOrigin)).forEach(([name, value]) => response.headers.set(name, value));
  }
  return response;
}

export const config = {
  matcher: ["/api/booking-requests", "/api/health"],
};