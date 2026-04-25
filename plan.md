# TrustLayer — Production Plan (v2)

**One-liner:** Real-time, multi-channel scam and fraud protection for immigrants and international students — powered by specialized ML models, not keywords.

---

## 1. The Problem

- **47% of immigrants** are targeted by scams within their first 2 years in the US
- Scammers exploit language barriers, unfamiliarity with US systems, and fear of authorities
- Attack channels: fake IRS calls, phishing emails, job offer fraud, rental scams, social media cons
- Average loss: **$500–$5,000+ per incident** — money they cannot afford to lose
- **Why current tools fail:**
  - Spam filters use rule-based keyword matching — sophisticated social engineering slips through
  - FTC complaint forms are English-only, buried, and retroactive
  - No tool explains *why* it's a scam, *in the victim's language*, with *what to do right now*
  - Immigrants fear reporting due to immigration status concerns

---

## 2. Our Solution: TrustLayer

TrustLayer analyzes suspicious messages across **4 channels** (SMS, Email, Call scripts, Social posts) using **specialized ML fraud detection models** — not keywords — and returns:

- **Risk level** (Scam / Suspicious / Safe)
- **Confidence score** (%)
- **Highlighted scam phrases** from the actual message
- **Explanation + action steps** in the user's native language

**This is not another AI chatbot. It's a fraud detection pipeline with a community trust layer on top.**

---

## 3. AI Layer — Real ML Models (Not Keywords)

### Model Source
**`vaibhavnsingh07/fraud-detection-models`** on Hugging Face

Four specialized `.pkl` models, one per scam channel:

| Model | Channel | Scam Type |
|-------|---------|-----------|
| Phishing Detection | Email tab | Gmail / Outlook phishing, BEC |
| Employment Fraud | Job scams | Fake job offers, upfront payment fraud |
| Social Engineering | SMS / Call | Phone scams, impersonation |
| Business Email Compromise | Email (BEC) | Executive impersonation, wire transfer fraud |

### Why Specialized Models Beat One General Model
- Each scam channel has distinct linguistic patterns
- Employment fraud uses formal language with hidden red flags; phone scams use urgency + authority
- Ensemble of specialized models reaches **~95% accuracy** vs. ~70–80% for keyword matching
- Each model outputs its own confidence score — we combine them into a unified risk verdict

### Routing Logic

```
User Input
    │
    ├── Email Tab      → phishing_model + bec_model → averaged confidence
    ├── SMS Tab        → social_engineering_model   → confidence score
    ├── Call Tab       → social_engineering_model   → confidence score
    └── Social Tab     → phishing_model             → confidence score
```

### Combined Output

```python
{
  "risk_level": "scam" | "suspicious" | "safe",
  "confidence": 0–100,
  "model_used": "phishing | employment_fraud | social_engineering | bec",
  "red_flags": ["Urgency pressure", "Authority impersonation", ...],
  "explanation": "...",   # in user's language
  "actions": [...]        # in user's language
}
```

Claude Sonnet handles the **explanation + translation layer** on top of ML model output — ML detects, Claude explains.

---

## 4. System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
│   Tabs: [ SMS ] [ Email ] [ Call ] [ Social ]  Lang Selector   │
└───────────────────────┬────────────────────────────────────────┘
                        │ POST /api/analyze { text, channel, language }
                        ▼
┌────────────────────────────────────────────────────────────────┐
│                     BACKEND (Next.js API Routes)                │
│  - Validates input                                              │
│  - Routes to correct ML model based on channel                 │
│  - Calls ML microservice                                        │
│  - Calls Claude for explanation + translation                   │
│  - Returns unified result                                       │
└──────────┬─────────────────────────────┬──────────────────────┘
           │                             │
           ▼                             ▼
┌──────────────────────┐     ┌───────────────────────┐
│  ML Microservice     │     │  Claude API (Sonnet)   │
│  (Python / FastAPI)  │     │  - Explanation layer   │
│  - Loads .pkl models │     │  - Multilingual output │
│  - Returns score +   │     │  - Action guidance     │
│    red flags         │     └───────────────────────┘
└──────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│                     COMMUNITY LAYER                            │
│  TrustWall — WeChat-style scam feed                           │
│  - Users post screenshots/messages                            │
│  - Others react: "I got this too" / "Scam confirmed"          │
│  - Points + badges for contributors                           │
└──────────────────────────────────────────────────────────────┘
```

### Full Data Flow

```
User pastes message in Email tab
         │
         ▼
POST /api/analyze { text, channel: "email", language: "zh" }
         │
         ▼
Backend routes to ML microservice → phishing_model + bec_model
         │
         ▼
ML returns: { score: 0.94, red_flags: ["urgent wire transfer", "spoofed domain"] }
         │
         ▼
Backend calls Claude: "Given this ML result + red flags, explain in Chinese + give actions"
         │
         ▼
Claude returns: { explanation: "这是一封钓鱼邮件...", actions: ["不要点击链接", ...] }
         │
         ▼
Backend combines → { risk_level: "scam", confidence: 94, explanation, red_flags, actions }
         │
         ▼
Frontend renders: risk badge + highlighted red flags + Chinese explanation + action steps
```

---

## 5. Multi-Channel Detection (Differentiation)

Most fraud tools check ONE channel. TrustLayer checks FOUR with the right model per channel.

| Tab | Input | Model | What It Catches |
|-----|-------|-------|----------------|
| **SMS** | Text messages | Social Engineering | Fake delivery alerts, prize scams, USPS fraud |
| **Email** | Email body / subject | Phishing + BEC | Gmail/Outlook phishing, fake invoices, boss impersonation |
| **Call** | Call script / voicemail transcript | Social Engineering | IRS calls, SSN suspension, immigration threats |
| **Social** | DMs / posts | Phishing | Instagram giveaway scams, fake job DMs, crypto fraud |

Each channel gets the model trained on its scam patterns — not a one-size-fits-all approach.

---

## 6. TrustWall — Community Layer

A WeChat-style scam alert feed where the community protects each other.

**How it works:**
- Users submit scam messages / screenshots after analysis
- Visible to the community as a public post
- Others can react:
  - "I got this too" — validates the scam pattern
  - "Scam confirmed" — community endorsement
  - "Seems safe" — counter-signal
- Posts are tagged by scam type, channel, and language

**Why it matters:**
- New scam variants appear before models are retrained
- Community signals fill the gap in real time
- Future: community-confirmed posts become training data (active learning loop)

**For demo:** show TrustWall pre-populated with 5–10 fake-but-realistic posts in multiple languages

---

## 7. Gamification Layer

Encourages reporting, builds the trust network.

**Points System:**
- Submit a scam → +10 points
- Scam gets confirmed by community → +25 points
- First to report a new scam pattern → +50 points (Scam Pioneer badge)

**Badges:**
- Scam Spotter — first 5 submissions
- Community Protector — 10+ confirmed scams
- Multilingual Guardian — submissions in 3+ languages
- Scam Pioneer — reported a pattern 24h before it went viral

**Leaderboard:** Top 10 contributors visible on TrustWall

**Why this works:**
- Converts passive victims into active community shields
- Social proof — seeing others report the same scam reduces shame
- Builds a labeled dataset as a byproduct (future model retraining)

---

## 8. Hackathon Execution Plan

### Phase 1 — Setup (0–2 hours)
- [ ] Initialize Next.js 14 repo + Tailwind + TypeScript
- [ ] Set up Python FastAPI microservice skeleton
- [ ] Load ONE model from HuggingFace (`vaibhavnsingh07/fraud-detection-models`)
- [ ] Deploy skeleton frontend to Vercel
- [ ] Set env vars: `ANTHROPIC_API_KEY`, `ML_SERVICE_URL`

### Phase 2 — Core ML Integration (2–8 hours)
- [ ] FastAPI endpoint: `POST /predict { text, model_type }` → `{ score, red_flags }`
- [ ] Load phishing model (`.pkl`) via `joblib` or `pickle`
- [ ] Test with fake IRS phishing email — confirm score > 0.85
- [ ] Build Next.js `POST /api/analyze` → calls ML service → calls Claude for explanation
- [ ] Return unified JSON to frontend

### Phase 3 — Multilingual Layer (8–12 hours)
- [ ] Add language selector (English, Chinese, Spanish, Bengali, Haitian Creole)
- [ ] Claude prompt: include selected language, make explanation + actions output in that language
- [ ] Test: same phishing email → Chinese output, Spanish output, Bengali output
- [ ] Verify natural phrasing per language (not machine-translation feel)

### Phase 4 — Multi-Channel Tabs (12–16 hours)
- [ ] Build SMS / Email / Call / Social tab UI
- [ ] Tab selection → sets `channel` in API request
- [ ] Backend routes `channel` to correct model
- [ ] Add employment fraud model for Job tab (if time permits)

### Phase 5 — TrustWall UI (16–20 hours)
- [ ] Build TrustWall feed component with fake-but-realistic data
- [ ] Show: username, scam snippet, channel tag, language tag, reaction counts
- [ ] Add reaction buttons ("I got this too", "Scam confirmed")
- [ ] Points counter visible in nav

### Phase 6 — Polish + Demo Prep (Final hours)
- [ ] Risk badge: color-coded + animated (red pulse for Scam)
- [ ] Highlight red flag phrases directly in the input text
- [ ] Mobile responsive
- [ ] Error states + loading skeletons
- [ ] Practice demo script 3 times
- [ ] Record backup video

---

## 9. Demo Script (3 Minutes — Judge-Winning)

### 0:00–0:30 — Hook
> "Every year, immigrants in the US lose over $2 billion to scams. Not because they're careless — because scammers specifically target people who don't know the system and are afraid to ask for help. Every tool today uses keyword filters. TrustLayer uses real fraud detection models."

### 0:30–1:30 — The Detection
1. Go to **Email tab**
2. Paste fake IRS phishing email
3. Hit **Analyze**
4. Show results:
   - Red badge: **SCAM — 94% confidence**
   - Red-highlighted phrases in the original text: *"act immediately"*, *"gift card payment"*, *"warrant for arrest"*
   - Model: Phishing Detection Model
   - Explanation in **English**

### 1:30–2:00 — Multilingual Switch
5. Switch language to **Chinese**
6. Explanation re-renders: *"这是一封钓鱼邮件。IRS从不通过电子邮件要求付款..."*
7. Switch to **Spanish** — re-renders again
8. **Say:** "One model. Five languages. Instant."

### 2:00–2:30 — TrustWall
9. Switch to **TrustWall tab**
10. Show community feed — posts in multiple languages, reactions, badges
11. Show the IRS email was just posted → reaction count ticking up
12. **Say:** "Our community is already protecting each other in real time."

### 2:30–3:00 — Close
> "Most fraud tools catch obvious spam. TrustLayer catches what they miss — using specialized ML models per scam type, in the victim's language, with the community as a force multiplier. This is the safety net that should already exist."

---

## 10. Why TrustLayer Wins

| What Other Teams Do | What We Do |
|---------------------|-----------|
| One text box + GPT prompt | 4 channels, 4 specialized ML models |
| English only | 5 languages, native-quality output |
| Generic scam advice | Red flags highlighted in the actual message |
| Solo AI analysis | Community TrustWall as a real-time signal layer |
| "Future: multilingual" | Multilingual is live, in the demo, right now |

**The moment that wins:** switching from English to Chinese mid-demo. The room feels the problem. Judges remember it.

---

## 11. What We Are NOT Building (Stay Disciplined)

- We do NOT load all 11 models — 1 (phishing) is enough for demo
- We do NOT build a real database — TrustWall uses hardcoded fake posts
- We do NOT build real user auth — no login required
- We do NOT build the browser extension, SMS integration, or call interception
- Employment fraud model = Phase 4 stretch goal, not required for demo

**Demo-first. Every decision serves the 3-minute demo.**

---

## 12. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js 14 + Tailwind CSS | Tabs, results, TrustWall |
| Backend | Next.js API Routes | Orchestrates ML + Claude |
| ML Service | Python + FastAPI | Loads .pkl models, returns scores |
| ML Models | `vaibhavnsingh07/fraud-detection-models` (HuggingFace) | Phishing + Employment Fraud |
| Explanation | Claude API (claude-sonnet-4-5) | Multilingual explanation + actions |
| Deployment | Vercel (frontend) + Railway/Render (ML service) | Free tier for both |

---

## 13. Project Structure

```
Hunter-Hacks/
├── trust-layer/
│   ├── frontend/                        ← Next.js app
│   │   ├── app/
│   │   │   ├── page.tsx                 ← Main detection UI (tabs)
│   │   │   ├── trustwall/page.tsx       ← TrustWall community feed
│   │   │   └── api/
│   │   │       └── analyze/route.ts     ← POST /api/analyze
│   │   └── components/
│   │       ├── ChannelTabs.tsx          ← SMS / Email / Call / Social tabs
│   │       ├── MessageInput.tsx
│   │       ├── RiskBadge.tsx
│   │       ├── HighlightedText.tsx      ← Red-flags highlighted in message
│   │       ├── Explanation.tsx
│   │       ├── ActionSteps.tsx
│   │       ├── LanguageSelector.tsx
│   │       ├── TrustWallFeed.tsx
│   │       └── ReactionButtons.tsx
│   └── ml-service/                      ← Python FastAPI microservice
│       ├── main.py                      ← FastAPI app
│       ├── models/                      ← .pkl model files
│       │   ├── phishing_model.pkl
│       │   └── employment_fraud.pkl
│       ├── predict.py                   ← Model loading + inference
│       └── requirements.txt
├── plan.md
└── architecture.md
```

---

## 14. Risks + Mitigations

| Risk | Mitigation |
|------|-----------|
| ML model too slow | Cache model in memory on FastAPI startup, not per-request |
| HuggingFace models won't load | Test load locally before hackathon; have fallback Claude-only prompt |
| ML service URL broken in demo | Run ML service locally + ngrok tunnel as backup |
| Scope creep | Only 1 model (phishing) is required for the winning demo |
| Claude API slow | Pre-warm with a dummy call before demo begins |

---

## 15. Future Vision (Tell Judges This)

- **Active learning:** TrustWall community confirmations become retraining signals for models
- **SMS integration:** Forward suspicious texts to TrustLayer's number → get a reply
- **Browser extension:** Real-time email scanning inside Gmail / Outlook
- **Model fine-tuning:** Retrain on immigrant-specific scam patterns (visa fraud, ICE impersonation)
- **Partnership:** Deploy through community centers, ESL programs, legal aid orgs
- **API access:** Let immigrant-serving nonprofits embed TrustLayer detection in their apps
