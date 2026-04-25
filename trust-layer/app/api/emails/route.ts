import { NextResponse } from "next/server"
import { store } from "@/lib/store"

export async function GET() {
  const emails = store.getAllEmailsWithAnalysis()
  const stats = store.getStats()
  return NextResponse.json({ emails, stats })
}
