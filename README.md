# Astrine AI — Generative UI & Tool Results Interface (FE-07)

A production-grade, state-of-the-art **Streaming AI Chat & Generative UI Interface** built with **Next.js 16 App Router**, **React 19**, **Tailwind CSS**, **Vercel AI SDK (Core, UI, & Tools)**, **Zod**, and **Framer Motion**.

This project implements **FE-07 (Tool Results and Structured Output in the UI)**, rendering real-time typed tool parts with distinct 4-state lifecycle visual treatments, custom UI components (Lead Score Card with hand-rolled SVG forecast chart, Social Meta Inspector, Interactive Action Confirmation), and a designed error state.

---

## 🛠️ Server-Side Tool Contracts (`lib/tools.ts`)

### 1. `scoreLead`
Evaluates B2B sales leads and prospects to compute intent score, tier, deal probability, breakdown metrics, and a 4-month conversion forecast trajectory.

- **Zod Schema**:
```ts
z.object({
  companyName: z.string().describe('Target company name to evaluate (e.g. Stripe, Acme Corp, Vercel)'),
  industry: z.string().optional().describe('Industry sector e.g. Fintech, SaaS, E-commerce, Healthcare'),
  employeeCount: z.number().optional().describe('Estimated number of employees'),
  intentSignals: z.array(z.string()).optional().describe('Observed intent signals e.g. pricing page visits, API docs read'),
  forceError: z.boolean().optional().describe('Set to true to test the designed output-error state'),
})
```

- **Return Shape**:
```ts
{
  companyName: string;
  industry: string;
  leadScore: number; // 0-100
  tier: 'Hot' | 'Warm' | 'Cold';
  conversionProbability: number; // 0-100%
  dealEstimate: string;
  metrics: {
    budgetFit: number;
    techStackFit: number;
    engagementRate: number;
    decisionMakerAccess: number;
  };
  keySignals: string[];
  riskFactors: string[];
  monthlyForecast: Array<{ month: string; probability: number }>;
  recommendedNextAction: string;
  evaluatedAt: string;
}
```

- **UI Render**: `<LeadScoreCard />` featuring SVG circular gauge ring, progress bars for fit metrics, hand-rolled SVG line chart forecast, intent signals list, and recommended action CTA.

---

### 2. `fetchMetaTags`
Scrapes and analyzes website metadata, Open Graph cards, SEO readiness scores, performance ratings, and HTTP security headers.

- **Zod Schema**:
```ts
z.object({
  url: z.string().describe('The web URL to scrape, inspect meta tags, and analyze SEO headers'),
  checkSecurityHeaders: z.boolean().optional().describe('Whether to analyze HTTP security headers'),
  forceError: z.boolean().optional().describe('Set to true to test simulated site offline error'),
})
```

- **Return Shape**:
```ts
{
  url: string;
  title: string;
  description: string;
  ogImage: string;
  siteName: string;
  seoScore: number;
  performanceScore: number;
  metaTags: Record<string, string>;
  securityHeaders: Array<{ name: string; status: 'pass' | 'fail' | 'warning'; details: string }>;
  inspectedAt: string;
}
```

- **UI Render**: `<MetaTagsCard />` featuring Open Graph social share preview mockup, dual score badges, HTTP security headers checklist, and collapsible raw meta tags table.

---

### 3. `confirmAction` (User-Interaction Tool)
Prompts the user for explicit confirmation before executing an automated CRM sync or report export.

- **Zod Schema**:
```ts
z.object({
  actionType: z.enum(['export_lead_report', 'schedule_crm_followup', 'trigger_outreach_sequence'])
    .describe('The action that requires user confirmation before execution'),
  targetName: z.string().describe('Target company or contact name'),
  parameters: z.object({
    priority: z.enum(['high', 'medium', 'low']).default('high'),
    notes: z.string().optional().describe('Execution notes or summary'),
  }),
})
```

- **Return Shape**:
```ts
{
  actionType: string;
  targetName: string;
  status: 'executed' | 'cancelled';
  transactionId: string;
  executedAt: string;
  summary: string;
}
```

- **UI Render**: `<ConfirmationCard />` featuring warning header, parameter overview, interactive "Approve & Execute" and "Cancel Action" buttons, morphing to completed transaction badge.

---

### 4. `simulateSystemDiagnostic` (Error Demonstration Tool)
Engineered to trigger handled tool execution failures without crashing the UI.

- **Zod Schema**:
```ts
z.object({
  serviceName: z.string().describe('Service microservice to run diagnostic check on'),
  simulateFailure: z.boolean().default(true).describe('Set true to demonstrate output-error handling'),
})
```

- **UI Render**: `<ToolErrorCard />` featuring red glassmorphic alert box, exception details, stack summary, troubleshooting tips, and an interactive "Retry Tool Execution" button.

---

## 🔄 The 4 Tool Lifecycle States (State Machine)

The `ToolPartRenderer` state machine handles four typed states with distinct visual treatments and smooth 200ms `framer-motion` morphing transitions:

| State | Visual Treatment | Purpose |
|---|---|---|
| **1. `input-streaming`** | Glowing animated pill with parameter stream typing animation. | Shows parameters being generated live by the model. |
| **2. `input-available`** | Execution card with status badge, payload code box, or confirmation gate. | Indicates parameters are valid & execution is starting or pending user approval. |
| **3. `output-available`** | Full custom component render (Score Card, SVG Chart, Social Preview). | Presents structured results as rich interactive UI cards. |
| **4. `output-error`** | Designed error card with code snippet, troubleshooting guide & retry button. | Handles tool failure gracefully without breaking chat flow. |

---

## 🛠️ Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts         # Vercel AI SDK streamText & Zod tools binder
│   │   └── key-status/
│   │       └── route.ts         # Server key status endpoint
│   ├── globals.css              # Dark theme CSS & custom scrollbars
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Astrine AI main view
├── components/
│   ├── chat/
│   │   ├── chat-input.tsx       # Auto-resizing input & quick action chips
│   │   ├── chat-interface.tsx   # Glassmorphic layout container
│   │   ├── markdown-renderer.tsx # Streaming-safe code & markdown parser
│   │   ├── message-item.tsx     # Message bubbles & tool parts dispatcher
│   │   ├── message-list.tsx     # Message thread & auto-scroll container
│   │   └── sidebar.tsx          # Persona & model engine config drawer
│   └── tools/
│       ├── confirmation-card.tsx # Interactive action confirmation component
│       ├── lead-score-card.tsx   # Score gauge & SVG forecast chart
│       ├── meta-tags-card.tsx   # Social card preview & security headers
│       ├── tool-error-card.tsx   # Designed output-error state component
│       └── tool-part-renderer.tsx # 4-state machine wrapper with Framer Motion
├── hooks/
│   ├── use-auto-scroll.ts       # Threshold-aware pin/unpin scroll hook
│   └── use-chat-stream.ts       # AI SDK useChat & typed tool parts stream hook
└── lib/
    ├── ai-config.ts             # Personas, system prompts & model configs
    ├── tools.ts                 # Server-side tool definitions & Zod schemas
    └── utils.ts                 # Class merging helper (cn)
```

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Create `.env.local` in the root directory:
```env
OPENROUTER_API_KEY=your_openrouter_key_here
# ANTHROPIC_API_KEY=your_anthropic_key_here
# OPENAI_API_KEY=your_openai_key_here
```
> *Note: If no API key is set, the application automatically falls back to an offline simulated stream generator so you can test all tool states (`scoreLead`, `fetchMetaTags`, `confirmAction`, `simulateSystemDiagnostic`) instantly.*

### 3. Run Development Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

### 4. Build & Verify
```bash
npm run build
npm run start
```
