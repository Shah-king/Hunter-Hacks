# TrustLayer — System Architecture

## 1. High-Level Architecture

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│   Frontend   │──────▶│  Next.js API      │──────▶│  Claude API  │
│  (Next.js)   │◀──────│  Route /analyze   │◀──────│  (Sonnet)    │
└─────────────┘       └──────────────────┘       └─────────────┘
```

**4 components, that's it:**

- **Frontend** — Single-page UI. Input box, analyze button, results panel, language selector
- **Backend** — One API route (`POST /api/analyze`). Validates input, calls Claude, returns structured result
- **AI Layer** — Claude Sonnet 4.5 via Anthropic SDK. Does ALL the heavy lifting: classification, explanation, translation
- **No database, no auth, no external translation API** — stateless request/response

---

## 2. System Flow (End-to-End)

```
User pastes message
       │
       ▼
Frontend sends POST /api/analyze
  { text: "...", language: "es" }
       │
       ▼
Backend validates input (non-empty, under 5000 chars)
       │
       ▼
Backend sends structured prompt to Claude API
  - System prompt with scam detection instructions
  - User's message as content to analyze
  - Target language for output
       │
       ▼
Claude returns JSON:
  { risk_level, scam_type, explanation, actions }
       │
       ▼
Backend parses + returns response to frontend
       │
       ▼
Frontend renders: risk badge, explanation, action steps
```

Total round trip: **2-4 seconds**

---

## 3. Core Components

### Frontend (`/app/page.tsx`)

Single page with 3 states: **input → loading → results**

- `<MessageInput />` — textarea + character count
- `<LanguageSelector />` — dropdown (English, Spanish, Mandarin, Bengali, Haitian Creole)
- `<AnalyzeButton />` — triggers POST, shows spinner during loading
- `<ResultsPanel />` — appears after analysis:
  - `<RiskBadge />` — color-coded: red (Scam), yellow (Suspicious), green (Safe)
  - `<ScamType />` — label: "Government Impersonation", "Phishing", etc.
  - `<Explanation />` — 2-3 sentences in selected language
  - `<ActionSteps />` — numbered list of what to do
- `<ExampleMessages />` — 3 clickable pre-loaded scam examples for quick demo

### Backend (`/app/api/analyze/route.ts`)

One POST endpoint. No middleware, no auth, no database.

```typescript
// Request
{
  text: string       // the suspicious message (required, max 5000 chars)
  language: string   // output language code: "en" | "es" | "zh" | "bn" | "ht"
}

// Response
{
  risk_level: "scam" | "suspicious" | "safe"
  confidence: number           // 0-100
  scam_type: string            // e.g. "Government Impersonation"
  explanation: string          // in requested language
  red_flags: string[]          // specific signals found
  actions: string[]            // what to do next
}
```

**Backend logic:**
1. Validate: text is non-empty, under 5000 chars
2. Build Claude prompt with system instructions + user text + target language
3. Call Anthropic SDK with `response_format` for structured JSON
4. Parse Claude's response
5. Return formatted JSON to frontend

### AI Layer (Claude Sonnet 4.5)

Claude handles everything in one call — no chaining, no multi-step pipeline.

**System prompt instructs Claude to:**
1. Analyze the message for scam indicators
2. Classify risk level (Scam / Suspicious / Safe)
3. Identify the scam type if applicable
4. List specific red flags found in the text
5. Generate a plain-language explanation in the target language
6. Generate actionable next steps in the target language

**Why Claude and not a custom model:**
- Multilingual natively — no separate translation step
- Understands cultural context (IRS scams, visa fraud, etc.)
- Structured JSON output via tool use
- Zero training required — prompt engineering only

---

## 4. Data Flow

```
INPUT                    PROCESSING                OUTPUT
─────                    ──────────                ──────

"URGENT: IRS says     →  Claude receives:        →  {
 you owe $5000.          - system prompt              risk_level: "scam",
 Call now or face         - scam detection rules       scam_type: "Government Impersonation",
 arrest."                 - the message text           confidence: 95,
                          - target language: "es"      explanation: "Esto es una estafa. El IRS
                                                         nunca contacta por texto ni amenaza
language: "es"        →  Claude analyzes:               con arresto...",
                          - keyword signals             red_flags: [
                          - pattern matching              "Urgency pressure",
                          - intent classification          "Threat of arrest",
                          - cultural context               "IRS impersonation",
                                                          "Phone number request"
                                                        ],
                                                        actions: [
                                                          "No llame a este número",
                                                          "Bloquee al remitente",
                                                          "Reporte en reportfraud.ftc.gov"
                                                        ]
                                                      }
```

**Key point:** No intermediate storage. Text goes in, result comes out. Stateless.

---

## 5. Detection Logic

Claude uses a layered approach, all within a single prompt:

**Layer 1 — Keyword Signals**
- Urgency: "act now", "immediately", "last warning", "suspended"
- Authority: "IRS", "Social Security", "ICE", "immigration officer"
- Payment: "gift card", "wire transfer", "Bitcoin", "Western Union"
- Threats: "arrest", "warrant", "deportation", "legal action"

**Layer 2 — Pattern Recognition**
- Unsolicited contact claiming to be government
- Request for personal info (SSN, bank account)
- Too-good-to-be-true offers (job paying $5000/week, free visa)
- Artificial time pressure ("respond within 1 hour")
- Suspicious URLs or phone numbers

**Layer 3 — Contextual Reasoning**
- Claude knows the IRS doesn't text people
- Claude knows legitimate employers don't ask for payment
- Claude knows real landlords show units before collecting deposits
- Claude understands immigrant-specific scam patterns (visa lottery, fake lawyers)

**No ML training, no fine-tuning, no vector database.** Just a well-crafted prompt.

---

## 6. API Design

### `POST /api/analyze`

**Request:**
```json
{
  "text": "URGENT: Your SSN has been suspended. Call 1-800-XXX-XXXX immediately.",
  "language": "es"
}
```

**Response (200):**
```json
{
  "risk_level": "scam",
  "confidence": 97,
  "scam_type": "Government Impersonation",
  "explanation": "Esto es una estafa. El número de Seguro Social no puede ser 'suspendido'. Ninguna agencia del gobierno le contactará por mensaje de texto para amenazarle.",
  "red_flags": [
    "Urgency pressure — 'immediately'",
    "Government impersonation — SSN claim",
    "Impossible action — SSN cannot be 'suspended'",
    "Suspicious phone number"
  ],
  "actions": [
    "No llame a este número",
    "Bloquee al remitente",
    "Reporte esta estafa en reportfraud.ftc.gov",
    "El IRS real solo contacta por correo postal"
  ]
}
```

**Error (400):**
```json
{
  "error": "Message text is required and must be under 5000 characters"
}
```

**Error (500):**
```json
{
  "error": "Analysis failed. Please try again."
}
```

---

## 7. Example Flow (Demo Case)

**Input:**
> "Hello, this is Officer James from the IRS. We have detected suspicious activity on your tax account. You owe $4,350 in back taxes. If you do not pay within 2 hours using Google Play gift cards, a federal warrant will be issued for your arrest. Call 1-888-555-0199 now."

**Claude processes:**
- Keyword hits: "IRS", "arrest", "warrant", "gift cards", "pay within 2 hours"
- Pattern: government impersonation + payment demand + urgency + unusual payment method
- Context: IRS never calls, never demands gift cards, never threatens immediate arrest

**Output (language: English):**
```
Risk Level:  🔴 SCAM (98% confidence)
Type:        Government Impersonation (Fake IRS)

Explanation:
This is a scam. The IRS never contacts taxpayers by phone to demand
immediate payment. They never threaten arrest, and they absolutely
never accept gift cards as payment. The real IRS communicates by mail
first and offers payment plans.

Red Flags:
• Claims to be IRS calling directly
• Demands payment via gift cards
• Threatens arrest within 2 hours
• Uses urgency to prevent you from thinking

What To Do:
1. Do NOT call this number
2. Do NOT buy gift cards
3. Hang up and block the number
4. Report to FTC: reportfraud.ftc.gov
5. Report IRS impersonation: tigta.gov
```

---

## 8. Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Framework | Next.js 14 (App Router) | Frontend + API in one project |
| Language | TypeScript | Type safety for API responses |
| Styling | Tailwind CSS | Fast UI development |
| AI | Anthropic Claude API (claude-sonnet-4-5) | Scam detection + multilingual |
| SDK | `@anthropic-ai/sdk` | Official Node.js client |
| Deployment | Vercel | Free tier, instant deploys |

**Not using:** database, auth, Stripe, Twilio, Redis, Docker, Kubernetes, or anything else.

---

## 9. Project Structure

```
Hunter-Hacks/
├── src/
│   ├── app/
│   │   ├── page.tsx                  ← Main UI (input + results)
│   │   ├── layout.tsx                ← Root layout, fonts, metadata
│   │   ├── globals.css               ← Tailwind imports
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts          ← POST /api/analyze endpoint
│   ├── components/
│   │   ├── MessageInput.tsx          ← Textarea + char count
│   │   ├── AnalyzeButton.tsx         ← Button with loading state
│   │   ├── LanguageSelector.tsx      ← Dropdown for output language
│   │   ├── ResultsPanel.tsx          ← Container for all results
│   │   ├── RiskBadge.tsx             ← Color-coded Scam/Suspicious/Safe
│   │   ├── Explanation.tsx           ← Explanation text block
│   │   ├── ActionSteps.tsx           ← Numbered action list
│   │   └── ExampleMessages.tsx       ← Pre-loaded clickable examples
│   └── lib/
│       ├── claude.ts                 ← Anthropic client + system prompt
│       ├── types.ts                  ← AnalysisResult type definition
│       └── constants.ts              ← Languages, example messages
├── public/
│   └── favicon.ico
├── .env.local                        ← ANTHROPIC_API_KEY
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── plan.md
└── architecture.md
```

---

## 10. Scalability Notes

- **Stateless** — no database, no sessions. Every request is independent
- **Vercel serverless** — auto-scales API routes per request
- **Claude API** — rate limits are the only bottleneck (~50 RPM on free tier, 1000+ on paid)
- **No caching needed for hackathon** — but could add edge caching for repeated messages later

---

## 11. Hackathon Constraints

- **One page, one endpoint, one AI call** — that's the entire system
- **No accounts** — removes auth complexity entirely
- **No database** — removes schema, migrations, hosting
- **No translation API** — Claude handles it natively
- **Demo-first mindset** — every architectural decision optimizes for "does it look good in a 3-minute demo?"
- **Fail gracefully** — if Claude API is slow, show a loading state. If it errors, show a friendly message. Never crash.
