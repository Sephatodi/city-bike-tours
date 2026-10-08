import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { bookingRequests } from "@/db/schema";
import { bookingRequestSchema } from "@/lib/validators";
import { newId } from "@/lib/id";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  try {
    const [created] = await db
      .insert(bookingRequests)
      .values({ id: newId(), ...parsed.data, status: "pending" })
      .returning({ id: bookingRequests.id, status: bookingRequests.status });

    return NextResponse.json({ request: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to save booking request:", error);
    return NextResponse.json({ error: "We couldn't save your request. Please try again." }, { status: 503 });
  }
}