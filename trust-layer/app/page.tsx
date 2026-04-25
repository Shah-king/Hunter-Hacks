"use client";

// ============================================================
// Dashboard — Main page showing all processed emails
// ============================================================
// TODO (Frontend person):
// 1. Fetch emails from GET /api/emails
// 2. Render StatsBar at top
// 3. Render list of EmailRow components
// 4. Add SimulateButton
// 5. Add risk level filter buttons
// 6. Add loading skeleton while fetching

import { useState, useEffect } from "react";
import { StatsBar } from "@/components/StatsBar";
import { EmailRow } from "@/components/EmailRow";
import { SimulateButton } from "@/components/SimulateButton";
import type { DashboardEmail } from "@/lib/types";

export default function DashboardPage() {
  const [emails, setEmails] = useState<DashboardEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  async function fetchEmails() {
    setLoading(true);
    try {
      const url = filter ? `/api/emails?risk_level=${filter}` : "/api/emails";
      const res = await fetch(url);
      const data = await res.json();
      setEmails(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to fetch emails");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmails();
  }, [filter]);

  const stats = {
    total: emails.length,
    scam: emails.filter((e) => e.risk_level === "scam").length,
    suspicious: emails.filter((e) => e.risk_level === "suspicious").length,
    safe: emails.filter((e) => e.risk_level === "safe").length,
    alertsSent: emails.filter((e) => e.alert_sent).length,
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Stats */}
      <StatsBar {...stats} />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {[null, "scam", "suspicious", "safe"].map((level) => (
            <button
              key={level ?? "all"}
              onClick={() => setFilter(level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filter === level
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500"
              }`}
            >
              {level ? level.charAt(0).toUpperCase() + level.slice(1) : "All"}
            </button>
          ))}
        </div>
        <SimulateButton onSimulated={fetchEmails} />
      </div>

      {/* Email list */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading emails...</div>
        ) : emails.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg mb-2">No emails processed yet</p>
            <p className="text-sm">Click &quot;Simulate Email&quot; to test the pipeline</p>
          </div>
        ) : (
          emails.map((email) => <EmailRow key={email.id} email={email} />)
        )}
      </div>
    </main>
  );
}
