// POST /api/webhook/email — Receives emails from SendGrid Inbound Parse
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { runPipeline } from "@/lib/pipeline";

export async function POST(req: NextRequest) {
  try {
    // SendGrid sends multipart/form-data
    const formData = await req.formData();

    const to = (formData.get("to") as string) ?? "";
    const from = (formData.get("from") as string) ?? "";
    const subject = (formData.get("subject") as string) ?? "(no subject)";
    const body = (formData.get("text") as string) ?? (formData.get("html") as string) ?? "";

    if (!body.trim()) {
      return NextResponse.json({ error: "Empty email body" }, { status: 400 });
    }

    // User routing: parse the "to" address to identify which user
    const forwardingAddress = to.split(",")[0].trim().toLowerCase();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("forwarding_address", forwardingAddress)
      .single();

    if (userError || !user) {
      console.error("Unknown forwarding address:", forwardingAddress);
      return NextResponse.json({ error: "Unknown user" }, { status: 404 });
    }

    // Run the full pipeline
    const result = await runPipeline({
      userId: user.id,
      userEmail: user.email,
      from,
      subject,
      body,
    });

    return NextResponse.json({ success: true, risk_level: result.risk_level, alert_sent: result.alert_sent });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
