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
    const envelopeRaw = (formData.get("envelope") as string) ?? ""
    const from = (formData.get("from") as string) ?? "unknown@example.com"
    const subject = (formData.get("subject") as string) ?? "(no subject)"
    const body = (formData.get("text") as string) ?? (formData.get("html") as string) ?? ""

    console.log(`[webhook/email] Received email: to=${toHeader}, from=${from}, subject=${subject}`)

    if (!body.trim()) {
      console.error("[webhook/email] Rejected: Empty body")
      return NextResponse.json({ error: "Empty email body" }, { status: 400 })
    }

    // Identify user by forwarding address
    // Priority 1: Envelope recipient (100% accurate)
    // Priority 2: Parsed 'to' header
    let forwardingAddress = ""
    try {
      if (envelopeRaw) {
        const envelope = JSON.parse(envelopeRaw)
        forwardingAddress = envelope.to?.[0] || ""
      }
    } catch (e) {
      console.error("[webhook/email] Error parsing envelope:", e)
    }

    if (!forwardingAddress) {
      const emailMatch = toHeader.match(/<([^>]+)>|([^\s,<>]+@[^\s,<>]+)/)
      forwardingAddress = (emailMatch ? (emailMatch[1] || emailMatch[2]) : toHeader).trim().toLowerCase()
    }
    
    forwardingAddress = forwardingAddress.toLowerCase().trim()
    console.log(`[webhook/email] Final target address: ${forwardingAddress}`)

    const user = await store.getUserByForwardingAddress(forwardingAddress)

    if (!user) {
      console.error(`[webhook/email] Rejected: No user found for ${forwardingAddress}`)
      // SECURITY: If the destination address doesn't match a known user, drop it.
      return NextResponse.json({ error: "Unknown destination address" }, { status: 404 })
    }

    console.log(`[webhook/email] Routing email to user: ${user.id} (${user.email})`)

    const { email, analysis } = await runPipeline({ user, sender: from, subject, body })
    console.log(`[webhook/email] Success: Processed email ${email.id}, Risk: ${analysis.risk_level}`)
    return NextResponse.json({ email, analysis })
  } catch (err) {
    console.error("[webhook/email]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
