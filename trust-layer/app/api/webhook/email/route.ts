import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/store"
import { runPipeline } from "@/lib/pipeline"

// SendGrid Inbound Parse sends multipart/form-data
export async function POST(req: NextRequest) {
  try {
    // SECURITY 1: Prevent Memory Crash (OOM) by checking content length
    const contentLength = Number(req.headers.get("content-length") || "0")
    if (contentLength > 5 * 1024 * 1024) { // 5MB limit
      console.error("[webhook/email] Payload too large")
      return NextResponse.json({ error: "Payload too large" }, { status: 413 })
    }

    // SECURITY 2: Prevent Webhook Impersonation (Signed Webhooks Placeholder)
    // For production, verify the SendGrid cryptographic signature.
    // For hackathon/demo, we can enforce a basic secret token if configured.
    if (process.env.WEBHOOK_SECRET && req.headers.get("x-webhook-secret") !== process.env.WEBHOOK_SECRET) {
      console.error("[webhook/email] Unauthorized webhook access attempt")
      return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 })
    }

    const formData = await req.formData()

    const toHeader = (formData.get("to") as string) ?? ""
    const from = (formData.get("from") as string) ?? "unknown@example.com"
    const subject = (formData.get("subject") as string) ?? "(no subject)"
    const body = (formData.get("text") as string) ?? (formData.get("html") as string) ?? ""

    if (!body.trim()) {
      return NextResponse.json({ error: "Empty email body" }, { status: 400 })
    }

    // Identify user by forwarding address
    // SendGrid's "to" field can be: "Name" <address@domain.com>
    // We use a regex to extract just the email address part.
    const emailMatch = toHeader.match(/<([^>]+)>|([^\s,<>]+@[^\s,<>]+)/)
    const forwardingAddress = (emailMatch ? (emailMatch[1] || emailMatch[2]) : toHeader).trim().toLowerCase()

    const user = await store.getUserByForwardingAddress(forwardingAddress)

    if (!user) {
      // SECURITY: If the destination address doesn't match a known user, drop it.
      console.warn(`[webhook/email] Dropping email to unknown address: ${forwardingAddress}`)
      return NextResponse.json({ error: "Unknown destination address" }, { status: 404 })
    }

    const { email, analysis } = await runPipeline({ user, sender: from, subject, body })
    return NextResponse.json({ email, analysis })
  } catch (err) {
    console.error("[webhook/email]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
