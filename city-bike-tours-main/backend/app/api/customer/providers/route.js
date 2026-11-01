import { NextResponse } from "next/server";
import { otpChannels } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function GET() {
  const channels = otpChannels();
  const devOtp = process.env.NODE_ENV !== "production";
  const neonGoogleReady = Boolean((process.env.AUTH_URL || process.env.NEON_AUTH_BASE_URL) && process.env.NEON_AUTH_COOKIE_SECRET);
  return NextResponse.json({
    google: neonGoogleReady,
    googleVia: neonGoogleReady ? "neon" : null,
    facebook: Boolean(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
    apple: Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
    sms: channels.sms || devOtp,
    whatsapp: channels.whatsapp || devOtp,
  });
}
