// Stripe-like prefixed IDs — human-readable, URL-safe, no ugly UUIDs
// Generates IDs like: usr_V1StGXR8Z5jd, eml_aBc123XyZ, etc.

import { nanoid } from "nanoid"

const PREFIXES = {
  user: "usr",
  email: "eml",
  analysis: "anl",
} as const

type IdType = keyof typeof PREFIXES

export function createId(type: IdType): string {
  return `${PREFIXES[type]}_${nanoid(16)}`
}

// Forwarding address: tl_<short-id>@<domain>
export function createForwardingAddress(): string {
  const id = nanoid(12).toLowerCase()
  const domain = process.env.NEXT_PUBLIC_FORWARDING_DOMAIN || "parse.trustlayer.app"
  return `tl_${id}@${domain}`
}
