# TrustLayer — System Architecture (24-Hour Build)

---

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)                       │
│   Tabs: [ SMS ] [ Email ] [ Call ] [ Social ]  Lang Selector   │
│   Pages: Detection UI  |  TrustWall Feed                       │
└───────────────────────┬────────────────────────────────────────┘
                        │ POST /api/analyze
                        │ { text, channel, language }
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                  BACKEND (Next.js API Routes)                   │
│  1. Validates input                                             │
│  2. Injects channel-specific context into system prompt        │
│  3. Calls OpenAI GPT-4o with structured output                 │
│  4. Returns unified result to frontend                         │
└───────────────────────────────┬────────────────────────────────┘
                                │
                                ▼
                  ┌─────────────────────────────┐
                  │     OpenAI GPT-4o API        │
                  │  - Fraud detection           │
                  │  - Confidence scoring        │
                  │  - Red flag extraction       │
                  │  - Multilingual explanation  │
                  │  - Action guidance           │
                  └─────────────────────────────┘
```

No ML microservice. No Python service. No separate translation API. One API call does everything.

---

## 2. Full Data Flow (End-to-End)

```
User pastes message, selects Email tab + Chinese output
                │
                ▼
POST /api/analyze
{ text: "...", channel: "email", language: "zh" }
                │
                ▼
Backend builds GPT-4o prompt:
  - System prompt with email scam context
  - User message as content
  - Target language: Chinese
  - Structured JSON output schema
                │
                ▼
GPT-4o returns structured JSON:
{
  risk_level: "scam",
  confidence: 94,
  scam_type: "Phishing",
  red_flags: ["spoofed domain", "urgent wire transfer request"],
  explanation: "这是一封钓鱼邮件。该域名是伪造的...",
  actions: ["不要点击任何链接", "向FTC举报", ...]
}
                │
                ▼
Backend validates + returns to frontend
                │
                ▼
Frontend renders:
  - Red badge: SCAM 94%
  - Original message with red_flags highlighted inline
  - Chinese explanation
  - Chinese action steps
```

Total round trip: **2–4 seconds**

---

## 3. Backend API

### `POST /api/analyze`

**Request:**
```json
{
  "text": "URGENT: Your SSN has been suspended. Call 1-800-XXX-XXXX immediately.",
  "channel": "sms",
  "language": "es"
}
```

**Response (200):**
```json
{
  "risk_level": "scam",
  "confidence": 96,
  "scam_type": "Government Impersonation",
  "red_flags": [
    "Urgency pressure — 'immediately'",
    "SSN cannot be suspended",
    "Unsolicited government contact via SMS"
  ],
  "explanation": "Esto es una estafa. El número de Seguro Social no puede ser 'suspendido'. Ninguna agencia del gobierno le contacta por SMS para amenazarle con acción legal.",
  "actions": [
    "No llame a este número",
    "Bloquee al remitente",
    "Reporte en reportfraud.ftc.gov"
  ]
}
```

**Error (400):**
```json
{ "error": "text is required and must be under 5000 characters" }
```

**Error (500):**
```json
{ "error": "Analysis failed. Please try again." }
```

### Backend Implementation

```typescript
// /app/api/analyze/route.ts
import OpenAI from "openai"
import { channelContext } from "@/lib/channelContext"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: Request) {
  const { text, channel, language } = await req.json()

  if (!text || text.length > 5000) {
    return Response.json({ error: "text is required and must be under 5000 characters" }, { status: 400 })
  }

  const systemPrompt = buildSystemPrompt(channel, language)

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text }
    ]
  })

  const result = JSON.parse(completion.choices[0].message.content!)

  return Response.json(result)
}
```

---

## 4. OpenAI Prompt Design

### System Prompt Builder

```typescript
// lib/openai.ts
export function buildSystemPrompt(channel: string, language: string): string {
  return `
You are TrustLayer, an AI fraud detection system protecting immigrants and international students.

CHANNEL CONTEXT:
${channelContext[channel]}

YOUR TASK:
Analyze the user's message and return a JSON object with this exact structure:
{
  "risk_level": "scam" | "suspicious" | "safe",
  "confidence": number between 0-100,
  "scam_type": string (e.g. "Government Impersonation", "Phishing", "Job Fraud", "Safe Message"),
  "red_flags": string[] (specific phrases or patterns found — max 5, empty array if safe),
  "explanation": string (2-3 sentences in ${language} explaining WHY this is or isn't a scam),
  "actions": string[] (3-5 action steps in ${language}, empty array if safe)
}

CLASSIFICATION RULES:
- "scam": 2+ strong signals or clear malicious intent
- "suspicious": 1 signal or ambiguous intent
- "safe": no signals detected

SCAM SIGNALS TO DETECT:
- Urgency: "act now", "immediately", "last warning", "account suspended"
- Authority impersonation: IRS, SSA, ICE, immigration, bank fraud departments
- Unusual payment: gift cards, wire transfer, crypto, Western Union, Zelle
- Threats: arrest, warrant, deportation, lawsuit
- Too-good-to-be-true: unrealistic job offers, lottery winnings, free visa
- Suspicious links or spoofed domains

IMPORTANT:
- Write explanation and actions in ${language} only
- Reference specific phrases found in the message
- Use plain language — the reader may be unfamiliar with US systems
- Return valid JSON only, no extra text
`
}
```

### Channel Context Map

```typescript
// lib/channelContext.ts
export const channelContext: Record<string, string> = {
  sms: `
    This is an SMS/text message. Common scams:
    - Fake USPS/UPS delivery alerts with phishing links
    - Prize winning notifications
    - Bank fraud alerts asking to call back
    - IRS/SSA suspension threats
    - Verification codes from unknown sources
  `,
  email: `
    This is an email message. Common scams:
    - Gmail/Outlook phishing with spoofed sender domains
    - Fake invoice or payment requests
    - Business email compromise (boss impersonation)
    - Account verification emails with malicious links
    - IRS tax refund or audit notices
  `,
  call: `
    This is a phone call script or voicemail transcript. Common scams:
    - IRS agents threatening arrest for unpaid taxes
    - Social Security Administration suspending SSN
    - Immigration officers threatening deportation
    - Bank fraud departments asking for account info
    - Tech support requesting remote access
  `,
  social: `
    This is a social media message or post. Common scams:
    - Instagram/Facebook giveaway scams requiring personal info
    - Fake job offers sent via DM
    - Crypto investment opportunities
    - Romance scams building trust over time
    - Fake influencer sponsorship opportunities
  `
}
```

---

## 5. Frontend Architecture

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Main detection UI — tabs + analysis results |
| `/trustwall` | Community scam feed (hardcoded data) |

### Component Tree

```
app/page.tsx
├── <ChannelTabs />              ← SMS / Email / Call / Social
├── <MessageInput />             ← Textarea + char count + example loader
├── <LanguageSelector />         ← en / zh / es / bn / ht
├── <AnalyzeButton />            ← POST trigger + loading spinner
└── <ResultsPanel />             ← Hidden until analysis complete
    ├── <RiskBadge />            ← SCAM / SUSPICIOUS / SAFE + confidence %
    ├── <HighlightedText />      ← Original message, red flags underlined in red
    ├── <Explanation />          ← 2–3 sentences in selected language
    └── <ActionSteps />          ← Numbered list in selected language

app/trustwall/page.tsx
├── <TrustWallFeed />
│   └── <ScamPost />[]           ← username, snippet, channel, reactions
└── <ReactionButtons />          ← "I got this too" / "Scam confirmed"
```

### UI States

```
input → loading → results → (optional) share to TrustWall
  │         │         │
  │    "Analyzing    RiskBadge (pulse animation on Scam)
  │     with AI..."  HighlightedText
  │                  Explanation
  │                  ActionSteps
  └── error → "Analysis failed. Please try again." + retry
```

---

## 6. Key Types

```typescript
// lib/types.ts

type RiskLevel = "scam" | "suspicious" | "safe"

type Channel = "sms" | "email" | "call" | "social"

type Language = "en" | "zh" | "es" | "bn" | "ht"

type AnalysisResult = {
  risk_level: RiskLevel
  confidence: number
  scam_type: string
  red_flags: string[]
  explanation: string
  actions: string[]
}

type ScamPost = {
  id: string
  username: string
  channel: Channel
  language: string
  snippet: string
  scam_type: string
  confidence: number
  reactions: {
    got_this_too: number
    scam_confirmed: number
    seems_safe: number
  }
  points_awarded: number
  created_at: string
}
```

---

## 7. TrustWall (Hardcoded for Demo)

For the hackathon, TrustWall uses a static array of realistic fake posts in `lib/constants.ts`.

```typescript
// lib/constants.ts
export const FAKE_TRUSTWALL_POSTS: ScamPost[] = [
  {
    id: "1",
    username: "user_mx_492",
    channel: "sms",
    language: "es",
    snippet: "Su número de Seguro Social ha sido suspendido. Llame al 1-800-555-0199 inmediatamente...",
    scam_type: "Government Impersonation",
    confidence: 98,
    reactions: { got_this_too: 47, scam_confirmed: 31, seems_safe: 0 },
    points_awarded: 25,
    created_at: "2026-04-25T10:22:00Z"
  },
  {
    id: "2",
    username: "user_cn_871",
    channel: "email",
    language: "zh",
    snippet: "您的亚马逊账户存在异常登录，请立即点击以下链接验证您的身份...",
    scam_type: "Phishing",
    confidence: 95,
    reactions: { got_this_too: 63, scam_confirmed: 41, seems_safe: 2 },
    points_awarded: 25,
    created_at: "2026-04-25T09:15:00Z"
  },
  // add 3–5 more entries in Bengali, Haitian Creole, English
]

export const EXAMPLE_MESSAGES = {
  sms: "URGENT: Your Social Security Number has been suspended due to suspicious activity. To reactivate call 1-800-555-0199 immediately or a warrant will be issued.",
  email: "Dear Customer, We detected unauthorized access to your Wells Fargo account. Click here to verify your identity within 24 hours or your account will be permanently closed: http://wellsfargo-secure-verify.net",
  call: "Hello, this is Officer Thompson from the IRS. We have a case filed against you for tax evasion. You owe $4,200. If you don't pay today using Google Play gift cards, federal agents will arrest you within the hour.",
  social: "Hey! I'm a talent recruiter at Amazon. We're hiring remote workers — $85/hr, no experience needed. Just send me your SSN and bank info for the background check to get started today!"
}
```

---

## 8. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14 + Tailwind CSS | App Router, TypeScript |
| Backend | Next.js API Routes | No separate server |
| AI | OpenAI GPT-4o | Detection + explanation + translation in one call |
| SDK | `openai` npm package | Official Node.js client |
| Deployment | Vercel | Free tier, one-click deploy |

No database. No auth. No Python service. No external translation API.

---

## 9. Project Structure

```
Hunter-Hacks/
├── trust-layer/
│   ├── app/
│   │   ├── page.tsx                   ← Main detection UI
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── trustwall/
│   │   │   └── page.tsx               ← TrustWall feed
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts           ← POST /api/analyze
│   ├── components/
│   │   ├── ChannelTabs.tsx
│   │   ├── MessageInput.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── AnalyzeButton.tsx
│   │   ├── ResultsPanel.tsx
│   │   ├── RiskBadge.tsx
│   │   ├── HighlightedText.tsx
│   │   ├── Explanation.tsx
│   │   ├── ActionSteps.tsx
│   │   ├── TrustWallFeed.tsx
│   │   ├── ScamPost.tsx
│   │   └── ReactionButtons.tsx
│   └── lib/
│       ├── openai.ts                  ← OpenAI client + prompt builder
│       ├── channelContext.ts          ← channel → prompt context
│       ├── types.ts                   ← AnalysisResult, ScamPost, etc.
│       └── constants.ts              ← Languages, example messages, fake posts
├── .env.local                         ← OPENAI_API_KEY
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── plan.md
└── architecture.md
```

---

## 10. Hackathon Constraints

| Constraint | Decision |
|-----------|---------|
| <24 hours | OpenAI GPT-4o — one API call, no infrastructure |
| No ML service | GPT-4o handles detection natively |
| No database | TrustWall uses hardcoded JSON |
| No auth | No login, no accounts, no sessions |
| Demo reliability | Pre-warm API before presenting; have backup screenshots |

**Minimum viable demo:** Email tab → paste scam → Chinese output → highlighted red flags → TrustWall visible.

---

## 11. Scalability Path (Tell Judges)

- **Phase 2:** Fine-tune a specialized model on TrustWall-confirmed scam posts (active learning)
- **Phase 3:** Channel-specific models replace GPT-4o for lower latency + cost
- **Browser extension:** Real-time email scanning inside Gmail / Outlook
- **SMS integration:** Forward suspicious texts to TrustLayer's number → get a reply
- **Database:** Supabase for real TrustWall posts + user points
- **API access:** Let immigrant-serving nonprofits embed TrustLayer in their apps
