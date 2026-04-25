"use client";

// ============================================================
// SignupForm — Enter email, get forwarding address
// ============================================================
// TODO: Create POST /api/signup endpoint that:
// 1. Generates a UUID-based forwarding address
// 2. Inserts user into Supabase
// 3. Returns the forwarding address

import { useState } from "react";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [forwardingAddress, setForwardingAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: POST to /api/signup
      // For now, generate a fake forwarding address for UI demo
      const fakeId = Math.random().toString(36).substring(2, 10);
      setForwardingAddress(`${fakeId}@parse.trustlayer.app`);
    } catch {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (forwardingAddress) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="text-center">
          <span className="text-4xl">✅</span>
          <h3 className="text-lg font-bold mt-2">You&apos;re Connected!</h3>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Your Forwarding Address</p>
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm text-blue-400 select-all">
            {forwardingAddress}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Setup Instructions</p>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              Open Gmail Settings → Forwarding
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Add the forwarding address above
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              Confirm the verification email
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</span>
              Enable &quot;Forward a copy of incoming mail&quot;
            </li>
          </ol>
        </div>

        <a href="/" className="block text-center text-sm text-blue-400 hover:text-blue-300 mt-4">
          ← Go to Dashboard
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-widest block mb-2">
          Your Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-sm disabled:opacity-50 transition-colors"
      >
        {loading ? "Setting up..." : "Get Forwarding Address"}
      </button>
    </form>
  );
}
