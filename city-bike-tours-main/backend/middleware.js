import { NextResponse } from "next/server";
import { allowsProtectedMutationOrigin, isAllowedFrontendOrigin } from "@/lib/origins";
import { neonAuth } from "@/lib/neon-auth-server";

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

// Neon Auth must see the browser coming back from Google so it can swap its one-time code for a session cookie.
// If sign-in did not finish, the visitor is sent back to the website's login page with an error.
function neonReturn(request) {
  const site = (process.env.FRONTEND_ORIGIN || "").split(",")[0].trim().replace(/\/$/, "");
  return neonAuth.middleware({ loginUrl: `${site}/login/callback#error=signin_failed` })(request);
}

export async function middleware(request) {
  const origin = request.headers.get("origin");
  const allowed = Boolean(origin && isAllowedFrontendOrigin(origin));

  if (request.method === "OPTIONS") {
    if (!allowed) return new NextResponse(null, { status: 403, headers: { Vary: "Origin" } });
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (!allowsProtectedMutationOrigin(request)) {
    return NextResponse.json({ error: "Origin is not allowed." }, { status: 403 });
  }

  if (neonAuth && request.nextUrl.pathname === "/api/customer/neon/complete") return neonReturn(request);

  const response = NextResponse.next();
  if (allowed) {
    Object.entries(corsHeaders(origin)).forEach(([name, value]) => response.headers.set(name, value));
  } else {
    response.headers.set("Vary", "Origin");
  }
  return response;
}

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
    "/api/neon-auth/:path*",
  ],
};
