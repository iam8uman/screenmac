import { NextResponse } from "next/server";
import { product } from "@/lib/product";
import { waitlistSchema, type WaitlistResult } from "@/lib/waitlist";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    const payload: WaitlistResult = {
      ok: false,
      code: "invalid",
      message: parsed.error.issues[0]?.message ?? "Enter a valid email address.",
    };
    return NextResponse.json(payload, { status: 400 });
  }

  const webhook = process.env.WAITLIST_WEBHOOK_URL;
  if (!webhook) {
    const payload: WaitlistResult = {
      ok: false,
      code: "waitlist_unavailable",
      message: `Beta signup is not configured on this deployment. Email ${product.email} and we will add you manually.`,
    };
    return NextResponse.json(payload, { status: 503 });
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: parsed.data.email,
        source: "screenmac-website",
      }),
    });
    if (!response.ok) {
      throw new Error(`Webhook status ${response.status}`);
    }
    const payload: WaitlistResult = { ok: true };
    return NextResponse.json(payload);
  } catch {
    const payload: WaitlistResult = {
      ok: false,
      code: "upstream_failed",
      message: `The waitlist service did not accept this request. Email ${product.email} instead.`,
    };
    return NextResponse.json(payload, { status: 502 });
  }
}
