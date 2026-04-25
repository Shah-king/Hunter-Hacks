"use client";

// ============================================================
// Signup — User enters email to get a forwarding address
// ============================================================
// TODO (Frontend person):
// 1. Style the form nicely
// 2. POST to a /api/signup endpoint (needs to be created)
// 3. Show the forwarding address after signup
// 4. Show instructions for setting up auto-forward in Gmail/Outlook

import { useState } from "react";
import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Connect Your Email</h2>
        <p className="text-gray-400 text-sm">
          Enter your email to get a unique forwarding address. Set up auto-forwarding in Gmail or Outlook, and TrustLayer will automatically scan every email you receive.
        </p>
      </div>
      <SignupForm />
    </main>
  );
}
