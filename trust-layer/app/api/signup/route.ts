import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { store } from "@/backend/lib/store"
import type { User } from "@/backend/lib/types"

export async function POST(req: NextRequest) {
  try {
    const { email, language = "en" } = await req.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 })
    }

    // Check if user already exists
    const existing = store.getAllUsers().find((u) => u.email === email)
    if (existing) {
      return NextResponse.json({ user: existing, forwarding_address: existing.forwarding_address })
    }

    const id = randomUUID()
    const slug = id.split("-")[0]
    const forwarding_address = `${slug}@parse.trustlayer.app`

    const user: User = {
      id,
      email,
      forwarding_address,
      language_preference: language,
      created_at: new Date().toISOString(),
    }

    store.createUser(user)

    return NextResponse.json({ user, forwarding_address })
  } catch (err) {
    console.error("[signup]", err)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
