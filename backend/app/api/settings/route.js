import { NextResponse } from "next/server";
import { getSettings, publicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Public: the site details an admin edits in Dashboard > Settings (name, contact, meeting point, announcement, SEO).
export async function GET() {
  return NextResponse.json({ settings: publicSettings(await getSettings()) });
}
