"use client";

import { useState } from "react";
import { RiskBadge } from "@/components/RiskBadge";
import { AnalysisDetail } from "@/components/AnalysisDetail";
import type { DashboardEmail } from "@/lib/types";

export function EmailRow({ email }: { email: DashboardEmail }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-gray-800/50 transition-colors"
      >
        <RiskBadge level={email.risk_level} score={email.final_score} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-200 truncate">{email.subject}</p>
          <p className="text-xs text-gray-500 truncate">From: {email.sender}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {email.alert_sent && (
            <span className="text-xs bg-red-900/50 text-red-300 border border-red-800 px-2 py-0.5 rounded-full">
              Alert Sent
            </span>
          )}
          <span className="text-xs text-gray-600">
            {new Date(email.received_at).toLocaleTimeString()}
          </span>
          <span className="text-gray-600 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && <AnalysisDetail email={email} />}
    </div>
  );
}
