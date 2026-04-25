// GET /api/emails — Fetch processed emails for dashboard
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const riskFilter = searchParams.get("risk_level"); // optional: "scam" | "suspicious" | "safe"

  try {
    let query = supabase
      .from("processed_emails")
      .select(`
        id,
        sender,
        subject,
        received_at,
        detected_language,
        analysis_results (
          rule_score,
          ai_score,
          final_score,
          risk_level,
          scam_type,
          red_flags,
          explanation,
          actions,
          alert_sent
        )
      `)
      .order("received_at", { ascending: false })
      .limit(50);

    const { data, error } = await query;

    if (error) {
      console.error("DB error:", error);
      return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
    }

    // Flatten the joined data for the frontend
    const emails = (data ?? [])
      .map((email: any) => {
        const analysis = email.analysis_results?.[0];
        if (!analysis) return null;

        return {
          id: email.id,
          sender: email.sender,
          subject: email.subject,
          received_at: email.received_at,
          detected_language: email.detected_language,
          rule_score: analysis.rule_score,
          ai_score: analysis.ai_score,
          final_score: analysis.final_score,
          risk_level: analysis.risk_level,
          scam_type: analysis.scam_type,
          red_flags: analysis.red_flags,
          explanation: analysis.explanation,
          actions: analysis.actions,
          alert_sent: analysis.alert_sent,
        };
      })
      .filter(Boolean)
      .filter((e: any) => !riskFilter || e.risk_level === riskFilter);

    return NextResponse.json(emails);
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
