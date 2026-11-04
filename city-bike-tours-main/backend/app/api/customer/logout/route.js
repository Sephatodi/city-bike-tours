import { NextResponse } from "next/server";
import { isAllowedFrontendOrigin } from "@/lib/origins";
import { clearCustomerCookie } from "@/lib/customer-auth";

export async function POST(request) {
  const origin = request.headers.get("origin");
  if (!origin || !isAllowedFrontendOrigin(origin)) {
    return NextResponse.json({ error: "Origin is not allowed." }, { status: 403 });
  }
  return clearCustomerCookie(NextResponse.json({ success: true }));
}
