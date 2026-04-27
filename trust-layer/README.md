# TrustLayer

TrustLayer is an AI-powered scam protection platform that helps vulnerable communities detect, understand, and share scam warnings before people get tricked.

## Problem We Solve

Scammers target people who may not recognize warning signs quickly, especially immigrants, international students, older family members, and people reading messages in a second language.

TrustLayer helps by:

- Detecting suspicious messages
- Explaining why something is a scam in simple language
- Translating scam warnings for different communities
- Showing scam patterns other people are seeing
- Helping families and communities warn each other faster

## What TrustLayer Does

TrustLayer provides an accessible, multilingual interface for evaluating suspicious messages and sharing alerts across communities. The platform combines AI-driven fraud scoring and explanation with demo-ready mock data so the app can be shown reliably during a hackathon.

## Why TrustLayer

- 47% of immigrants are targeted by scams within their first two years in the US
- Scammers exploit language barriers, unfamiliar systems, and fear of authorities
- Existing spam filters use keyword matching and do not explain why a message is dangerous
- TrustLayer is built to detect scams, explain risks in simple language, and warn people in their own languages

## How It Works

TrustLayer uses a multi-stage protection pipeline:

1. Detect language and translate incoming text to English if needed
2. Apply rule-based keyword and pattern scoring on the translated text
3. Run an OpenAI fraud-scoring call to assess scam likelihood
4. Aggregate rule and AI scores to classify messages as `Safe`, `Suspicious`, or `Scam`
5. When fraud is confirmed, generate a warning in the detected language and send it via Resend

All analysis is logged to Supabase and shown on the dashboard, giving users visibility into processed messages, risk scores, red flags, and alert history.

## Demo Reliability

The app supports mock and in-memory data for a stable hackathon demo flow. A built-in demo mode can simulate email processing so the experience works even without a full SendGrid / email-forwarding setup.

## Built With

- `Next.js` - web app framework
- `React` - frontend UI
- `TypeScript` - safer code
- `Tailwind CSS` - styling and responsive design
- `OpenAI API` - scam detection, fraud scoring, explanations, translation support
- `Supabase` - user and data infrastructure
- `Resend` - sending scam alert emails
- `Lucide React` - icons
- `GitHub` - team collaboration and version control
- `Mock / in-memory data` - reliable hackathon demo flow
- `Multilingual UI` - English, Chinese, Spanish, Bengali, Haitian Creole, and more
- `claude-api` - AI assistant integration
- `hugging-face-fraud-detection-models` - fraud detection model support
- `next.js-16` / `next.js-api-routes` - app architecture and API routing
- `supabase-ready` - deployment-ready backend support

## Getting Started

1. Open a terminal and change into the project folder:

```bash
cd trust-layer
```

2. Create a `.env.local` file in `trust-layer` with your environment keys:

```bash
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
RESEND_API_KEY=your-resend-api-key
```

3. Install dependencies if needed:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the app.

## Project Structure

- `app/` - Next.js app routes, pages, and components
- `lib/` - shared utilities, API integrations, and helper functions
- `public/` - static assets and social images
- `scripts/` - demo and testing scripts

## Notes

This project is designed to demonstrate AI-powered scam protection for communities that need faster, clearer warnings and multilingual support.
