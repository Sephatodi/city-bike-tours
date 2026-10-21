import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { bookingRequests, companyRoutesConfig } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { createRidePassToken, createRidePassUrl } from "@/lib/ride-pass";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requirePermission("bookings:read");
  if (guard.error) return guard.error;

  try {
    const requests = await db.select().from(bookingRequests)
      .where(eq(bookingRequests.status, "pending"))
      .orderBy(desc(bookingRequests.createdAt));

    const routeMap = new Map();
    const routes = await db.select().from(companyRoutesConfig);
    for (const r of routes) routeMap.set(r.routeId, r.routeName);

    const data = requests.map((r) => {
      const token = createRidePassToken(r.id);
      const ridePassUrl = createRidePassUrl(token, `http://localhost:5173`); // Will be overridden by frontend
      return {
        id: r.id,
        customerName: r.name,
        phoneNumber: r.phone,
        date: r.rideDate,
        time: r.notes?.match(/Preferred start time:\s*(\d{2}:\d{2})/)?.[1] || "09:00",
        groupSize: r.riders,
        route: routeMap.get(r.routeId) || r.routeId,
        token,
        ridePassUrl,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Pending bookings query failed:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}