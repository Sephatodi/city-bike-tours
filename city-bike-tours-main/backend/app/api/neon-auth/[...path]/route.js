import { NextResponse } from "next/server";
import { neonAuth } from "@/lib/neon-auth-server";

export const dynamic = "force-dynamic";

// The browser talks to Neon Auth through this proxy, so its session cookies belong to this backend.
// (It lives at /api/neon-auth because /api/auth is already used by NextAuth.)
const handlers = neonAuth ? neonAuth.handler() : null;
const unavailable = () => NextResponse.json({ error: "Neon Auth is not configured." }, { status: 503 });

export const GET = handlers ? handlers.GET : unavailable;
export const POST = handlers ? handlers.POST : unavailable;
