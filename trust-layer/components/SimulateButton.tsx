"use client";

import { useState } from "react";

const SAMPLE_EMAILS = [
  {
    from: "officer.james@irs-department.com",
    subject: "URGENT: IRS Tax Violation — Arrest Warrant Issued",
    body: `Dear Taxpayer,

This is Officer James from the Internal Revenue Service. We have detected suspicious activity on your tax account. You owe $4,350 in back taxes.

If you do not pay within 2 hours using Google Play gift cards, a federal warrant will be issued for your arrest. Call 1-888-555-0199 now to resolve this matter immediately.

Failure to respond will result in immediate legal action including arrest and deportation proceedings.

IRS Tax Enforcement Division`,
  },
  {
    from: "hr@global-careers-inc.net",
    subject: "Congratulations! You've Been Selected for a $5,000/week Remote Position",
    body: `Hello!

We reviewed your resume and are pleased to offer you a Remote Customer Service Manager position paying $5,000/week!

To get started, we need:
1. Your full name and Social Security Number
2. Bank account details for direct deposit
3. A $200 processing fee via Zelle to our HR department

This offer expires in 24 hours. Don't miss this opportunity!

Best regards,
Global Careers Inc.`,
  },
  {
    from: "noreply@amazon-security-alert.com",
    subject: "Your Amazon account has been compromised",
    body: `Dear Customer,

We detected unauthorized access to your Amazon account. Your account has been temporarily suspended.

Click here to verify your identity: http://amaz0n-secure-verify.com/login

You must verify within 1 hour or your account will be permanently closed.

Amazon Security Team`,
  },
];

export function SimulateButton({ onSimulated }: { onSimulated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");

  async function simulate(email: { from: string; subject: string; body: string }) {
    setLoading(true);
    try {
      await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      });
      onSimulated();
      setOpen(false);
    } catch {
      console.error("Simulation failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors"
      >
        + Simulate Email
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Simulate Incoming Email</h3>
          <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white">✕</button>
        </div>

        {/* Preset samples */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Quick Samples</p>
          <div className="space-y-2">
            {SAMPLE_EMAILS.map((email, i) => (
              <button
                key={i}
                disabled={loading}
                onClick={() => simulate(email)}
                className="w-full text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg px-4 py-3 transition-colors disabled:opacity-50"
              >
                <p className="text-sm font-medium text-gray-200 truncate">{email.subject}</p>
                <p className="text-xs text-gray-500 truncate">From: {email.from}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom input */}
        <div>
          <button
            onClick={() => setCustomMode(!customMode)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {customMode ? "Hide custom input" : "Or paste your own →"}
          </button>
          {customMode && (
            <div className="mt-3 space-y-2">
              <input
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                placeholder="From (e.g. scammer@fake.com)"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600"
              />
              <input
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Subject"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600"
              />
              <textarea
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder="Email body..."
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 resize-none"
              />
              <button
                disabled={loading || !customBody.trim()}
                onClick={() => simulate({ from: customFrom || "unknown@example.com", subject: customSubject || "Custom Email", body: customBody })}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? "Processing..." : "Analyze Custom Email"}
              </button>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center text-sm text-gray-400 py-2">
            Running pipeline... (Stage 0 → 4)
          </div>
        )}
      </div>
    </div>
  );
}
