import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/store"
import { createId, createForwardingAddress } from "@/lib/ids"

export async function POST(req: NextRequest) {
  try {
    const { email, language = "en" } = await req.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }

    // Check if user already exists
    const existing = store.getAllUsers().find((u) => u.email === email)
    if (existing) {
      return NextResponse.json({ forwarding_address: existing.forwarding_address })
    }

    // Create new user with clean prefixed IDs
    const user = store.createUser({
      id: createId("user"),
      email: email.trim(),
      forwarding_address: createForwardingAddress(),
      language_preference: language,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ forwarding_address: user.forwarding_address })
  } catch (err) {
    console.error("[signup]", err)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
