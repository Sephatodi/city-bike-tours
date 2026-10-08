import { NextResponse } from "next/server";
import { aiDraftSchema } from "@/lib/validators";
import { isAdmin } from "@/lib/admin";

// Drafts article text for the admin to review and edit before publishing.
export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI drafting is not configured (set ANTHROPIC_API_KEY)." }, { status: 501 });
  }
  const parsed = aiDraftSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-5-5",
      max_tokens: 1500,
      system: "You write friendly, accurate blog articles for City Bike Tours, a guided heritage cycling-tour business in Gaborone, Botswana. Plain text, short paragraphs, no markdown headings. Do not invent prices, dates, or facts you were not given.",
      messages: [{ role: "user", content: parsed.data.prompt }],
    }),
  });
  if (!response.ok) {
    console.error("Anthropic API error", response.status, await response.text());
    return NextResponse.json({ error: "AI request failed." }, { status: 502 });
  }
  const data = await response.json();
  const text = (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
  return NextResponse.json({ text });
}
