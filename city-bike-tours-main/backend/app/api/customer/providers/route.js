import { NextResponse } from "next/server";
import { otpChannels } from "@/lib/otp";

export const dynamic = "force-dynamic";

// Tells the website which sign-in methods are switched on, so it never shows a button that can't work.
export async function GET() {
  const channels = otpChannels();
  const devOtp = process.env.NODE_ENV !== "production";
  return NextResponse.json({
    google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    facebook: Boolean(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
    apple: Boolean(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET),
    sms: channels.sms || devOtp,
    whatsapp: channels.whatsapp || devOtp,
  });
}
