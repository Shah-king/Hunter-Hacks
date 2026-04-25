import { NextRequest, NextResponse } from "next/server"
import { store } from "@/lib/store"
import { runPipeline } from "@/lib/pipeline"

// SendGrid Inbound Parse sends multipart/form-data
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const to = (formData.get("to") as string) ?? ""
    const from = (formData.get("from") as string) ?? "unknown@example.com"
    const subject = (formData.get("subject") as string) ?? "(no subject)"
    const body = (formData.get("text") as string) ?? (formData.get("html") as string) ?? ""

    if (!body.trim()) {
      return NextResponse.json({ error: "Empty email body" }, { status: 400 })
    }

    // Identify user by forwarding address
    const forwardingAddress = to.split(",")[0].trim()
    const user = store.getUserByForwardingAddress(forwardingAddress)

    if (!user) {
      // Fall back to demo user so webhook always runs during demo
      const demoUser = store.getAllUsers()[0]
      if (!demoUser) return NextResponse.json({ error: "No users registered" }, { status: 404 })

      const { email, analysis } = await runPipeline({ user: demoUser, sender: from, subject, body })
      return NextResponse.json({ email, analysis })
    }

    const { email, analysis } = await runPipeline({ user, sender: from, subject, body })
    return NextResponse.json({ email, analysis })
  } catch (err) {
    console.error("[webhook/email]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
