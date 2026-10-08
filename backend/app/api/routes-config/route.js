import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { companyRoutesConfig } from "@/db/schema";

export const dynamic = "force-dynamic";

// Public: live route names, prices (BWP) and departure times, editable by the admin.
// The Vite site merges these over its static route details (src/hooks/LiveDataContext.jsx).
export async function GET() {
  try {
    const routes = await db.select().from(companyRoutesConfig).orderBy(asc(companyRoutesConfig.routeId));
    return NextResponse.json({ routes });
  } catch (error) {
    console.error("Routes config unavailable:", error);
    return NextResponse.json({ error: "Route settings are unavailable." }, { status: 503 });
  }
}
