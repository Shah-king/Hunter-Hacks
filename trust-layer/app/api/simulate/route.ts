// POST /api/simulate — Simulate an email arriving (for demo)
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { runPipeline } from "@/lib/pipeline";

// Demo user — create this in Supabase or use the first user
const DEMO_USER_ID = process.env.DEMO_USER_ID ?? "demo";
const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL ?? "demo@example.com";

export async function POST(req: NextRequest) {
  try {
    const { from, subject, body } = await req.json();

    if (!body?.trim()) {
      return NextResponse.json({ error: "body is required" }, { status: 400 });
    }

    const result = await runPipeline({
      userId: DEMO_USER_ID,
      userEmail: DEMO_USER_EMAIL,
      from: from ?? "scammer@suspicious.com",
      subject: subject ?? "Suspicious Email",
      body,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Simulate error:", err);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
