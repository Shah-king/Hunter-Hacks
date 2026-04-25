# TrustLayer — System Architecture (v2)

---

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)                       │
│   Tabs: [ SMS ] [ Email ] [ Call ] [ Social ]  Lang Selector   │
│   Pages: Detection UI  |  TrustWall Feed  |  Leaderboard       │
└───────────────────────┬────────────────────────────────────────┘
                        │ POST /api/analyze
                        │ { text, channel, language }
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                  BACKEND (Next.js API Routes)                   │
│  1. Validates input                                             │
│  2. Routes to ML microservice based on channel                 │
│  3. Combines ML score + red flags                              │
│  4. Calls Claude for explanation + translation                 │
│  5. Returns unified result to frontend                         │
└──────────┬─────────────────────────────┬──────────────────────┘
           │                             │
           ▼                             ▼
┌──────────────────────┐     ┌───────────────────────────┐
│   ML Microservice    │     │   Claude API (Sonnet 4.5)  │
│   Python + FastAPI   │     │   - Explanation layer      │
│                      │     │   - Multilingual output    │
│   Models (.pkl):     │     │   - Action guidance        │
│   - phishing         │     │   - Red flag labeling      │
│   - employment_fraud │     └───────────────────────────┘
│   - social_eng       │
│   - bec              │
│                      │
│   Returns:           │
│   { score, flags }   │
└──────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│                    COMMUNITY LAYER                             │
│   TrustWall — scam posts + reactions + points + badges        │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Model Routing Logic

Channel selection in the UI determines which ML model(s) are called:

```
channel: "email"   → phishing_model + bec_model  (averaged confidence)
channel: "sms"     → social_engineering_model
channel: "call"    → social_engineering_model
channel: "social"  → phishing_model
```

For hackathon demo: only `phishing_model` is required. Others are architecture placeholders.

---

## 3. Full Data Flow (End-to-End)

```
User pastes message, selects Email tab + Chinese output
                │
                ▼
POST /api/analyze
{ text: "...", channel: "email", language: "zh" }
                │
                ▼
Backend → ML Microservice
POST ml-service/predict
{ text: "...", model_type: ["phishing", "bec"] }
                │
                ▼
ML returns:
{ score: 0.94, red_flags: ["spoofed domain", "urgent wire transfer"] }
                │
                ▼
Backend → Claude API
"Given ML score 0.94 and red flags [...], explain in Chinese + give actions"
                │
                ▼
Claude returns:
{
  explanation: "这是一封钓鱼邮件。该域名是伪造的...",
  actions: ["不要点击任何链接", "向FTC举报", ...]
}
                │
                ▼
Backend combines and returns:
{
  risk_level: "scam",
  confidence: 94,
  model_used: "phishing",
  red_flags: ["spoofed domain", "urgent wire transfer"],
  explanation: "这是一封钓鱼邮件...",
  actions: [...]
}
                │
                ▼
Frontend renders:
  - Red badge: SCAM 94%
  - Input text with red_flags highlighted inline
  - Chinese explanation
  - Action steps in Chinese
```

Total round trip: **3–5 seconds**

---

## 4. ML Microservice

**Runtime:** Python 3.11 + FastAPI
**Deployment:** Railway or Render (free tier) — or localhost + ngrok for demo fallback

### Endpoint

```
POST /predict
{
  "text": "string",
  "model_type": ["phishing"] | ["social_engineering"] | ["phishing", "bec"]
}
```

### Response

```json
{
  "score": 0.94,
  "risk_level": "scam",
  "red_flags": ["spoofed domain", "urgent payment request", "impersonates authority"],
  "models_used": ["phishing"]
}
```

### Model Loading

```python
# predict.py — models loaded once at startup, not per-request
import joblib

MODELS = {
    "phishing": joblib.load("models/phishing_model.pkl"),
    "employment_fraud": joblib.load("models/employment_fraud.pkl"),
    "social_engineering": joblib.load("models/social_engineering.pkl"),
    "bec": joblib.load("models/bec_model.pkl"),
}
```

Model source: `vaibhavnsingh07/fraud-detection-models` on Hugging Face

---

## 5. Backend API

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
  "model_used": "social_engineering",
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

### Backend Orchestration Logic

```typescript
// /app/api/analyze/route.ts
export async function POST(req: Request) {
  const { text, channel, language } = await req.json()

  // 1. Validate
  if (!text || text.length > 5000) return error(400)

  // 2. Route to correct models
  const modelTypes = channelToModels(channel)
  // e.g. "email" → ["phishing", "bec"]

  // 3. Call ML microservice
  const mlResult = await fetch(`${ML_SERVICE_URL}/predict`, {
    method: "POST",
    body: JSON.stringify({ text, model_type: modelTypes })
  })
  const { score, red_flags } = await mlResult.json()

  // 4. Call Claude for explanation + translation
  const claudeResult = await getExplanation({ text, score, red_flags, language })

  // 5. Return unified result
  return Response.json({
    risk_level: scoreToRisk(score),
    confidence: Math.round(score * 100),
    red_flags,
    ...claudeResult
  })
}
```

---

## 6. Claude Integration

Claude does NOT do detection — that's the ML model's job. Claude's role:

1. Receive: ML score + red flags + original text + target language
2. Generate: plain-language explanation of *why* it's a scam, *in the target language*
3. Generate: 3–5 specific action steps, *in the target language*
4. Label: map red flags to human-readable phrases for UI highlighting

### System Prompt (core logic)

```
You are TrustLayer's explanation engine. A fraud detection ML model has already 
classified this message with a confidence score and red flags.

Your job:
1. Write a 2–3 sentence explanation of WHY this is a scam in {language}
2. List 3–5 specific action steps in {language}
3. Do NOT re-classify — trust the ML score
4. Use plain language appropriate for someone unfamiliar with US systems
5. Reference the specific red flags found: {red_flags}

Output as JSON: { explanation, actions }
```

---

## 7. Frontend Architecture

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Main detection UI — tabs + analysis results |
| `/trustwall` | Community scam feed |
| `/leaderboard` | Top contributors |

### Component Tree

```
app/page.tsx
├── <ChannelTabs />              ← SMS / Email / Call / Social
├── <MessageInput />             ← Textarea + char count
├── <LanguageSelector />         ← en / zh / es / bn / ht
├── <AnalyzeButton />            ← Triggers POST, shows spinner
└── <ResultsPanel />             ← Hidden until analysis complete
    ├── <RiskBadge />            ← SCAM / SUSPICIOUS / SAFE + confidence %
    ├── <HighlightedText />      ← Original message with red flags underlined
    ├── <Explanation />          ← 2–3 sentences in selected language
    └── <ActionSteps />          ← Numbered list in selected language

app/trustwall/page.tsx
├── <TrustWallFeed />
│   └── <ScamPost />[]           ← username, snippet, channel tag, reactions
└── <ReactionButtons />          ← "I got this too" / "Scam confirmed"
```

### UI States

```
input → loading → results
  │         │         │
  │    spinner +    RiskBadge
  │    "Analyzing   HighlightedText
  │     with ML     Explanation
  │     models..."  ActionSteps
  │
  └── error → friendly error message + retry button
```

---

## 8. TrustWall Data Model

For demo: hardcoded JSON. For production: Supabase or PlanetScale.

```typescript
type ScamPost = {
  id: string
  username: string              // anonymous or handle
  channel: "sms" | "email" | "call" | "social"
  language: string              // language of original message
  snippet: string               // first 200 chars of scam message
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

## 9. Gamification Data Model

```typescript
type UserStats = {
  username: string
  points: number
  badges: Badge[]
  submissions: number
  confirmed_scams: number
}

type Badge =
  | "scam_spotter"       // 5+ submissions
  | "community_protector" // 10+ confirmed
  | "multilingual_guardian" // submissions in 3+ languages
  | "scam_pioneer"       // first to report a new pattern
```

---

## 10. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14 + Tailwind CSS | App Router, TypeScript |
| Backend | Next.js API Routes | Orchestrates ML + Claude |
| ML Models | `vaibhavnsingh07/fraud-detection-models` | .pkl files via joblib |
| ML Service | Python 3.11 + FastAPI | Loaded at startup, not per-request |
| Explanation | Claude API (claude-sonnet-4-5) | Multilingual, action guidance |
| SDK | `@anthropic-ai/sdk` | Official Node.js client |
| Frontend Deploy | Vercel | Free tier |
| ML Deploy | Railway or Render | Free tier / localhost + ngrok |

---

## 11. Project Structure

```
Hunter-Hacks/
├── trust-layer/
│   ├── frontend/
│   │   ├── app/
│   │   │   ├── page.tsx                   ← Detection UI
│   │   │   ├── layout.tsx
│   │   │   ├── globals.css
│   │   │   ├── trustwall/
│   │   │   │   └── page.tsx               ← TrustWall feed
│   │   │   └── api/
│   │   │       └── analyze/
│   │   │           └── route.ts           ← POST /api/analyze
│   │   ├── components/
│   │   │   ├── ChannelTabs.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── LanguageSelector.tsx
│   │   │   ├── AnalyzeButton.tsx
│   │   │   ├── ResultsPanel.tsx
│   │   │   ├── RiskBadge.tsx
│   │   │   ├── HighlightedText.tsx
│   │   │   ├── Explanation.tsx
│   │   │   ├── ActionSteps.tsx
│   │   │   ├── TrustWallFeed.tsx
│   │   │   ├── ScamPost.tsx
│   │   │   └── ReactionButtons.tsx
│   │   └── lib/
│   │       ├── claude.ts                  ← Claude client + system prompt
│   │       ├── types.ts                   ← AnalysisResult, ScamPost, etc.
│   │       ├── channelRouter.ts           ← channel → model_type mapping
│   │       └── constants.ts              ← Languages, fake TrustWall data
│   └── ml-service/
│       ├── main.py                        ← FastAPI app
│       ├── predict.py                     ← Model loading + inference
│       ├── models/
│       │   ├── phishing_model.pkl
│       │   ├── employment_fraud.pkl
│       │   ├── social_engineering.pkl
│       │   └── bec_model.pkl
│       └── requirements.txt
├── plan.md
└── architecture.md
```

---

## 12. Hackathon Constraints

| Constraint | Decision |
|-----------|---------|
| Only 1 model needed for demo | Load `phishing_model.pkl` only; others are stubs |
| No real database | TrustWall uses hardcoded JSON in `constants.ts` |
| No auth | No login, no accounts, no sessions |
| ML service may be slow to deploy | Localhost + ngrok as demo fallback |
| Claude API latency | Pre-warm with dummy call before presenting |

**Minimum viable demo:** phishing model loaded → Email tab → Chinese output → TrustWall feed visible. Everything else is polish.

---

## 13. Scalability Path (Tell Judges)

- Stateless frontend + stateless API → horizontal scaling on Vercel edge
- ML microservice → containerize with Docker, deploy on GCP Cloud Run
- TrustWall posts → Supabase (Postgres) with real-time subscriptions
- Model retraining → community-confirmed posts as labeled training data (active learning)
- Rate limiting → Upstash Redis on Vercel edge middleware
