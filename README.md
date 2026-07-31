# Astrine AI — Error States, Empty States & Edge Cases (FE-08)

A production-grade, state-of-the-art **Streaming AI Chat & Generative UI Interface** built with **Next.js 16 App Router**, **React 19**, **Tailwind CSS**, **Vercel AI SDK (Core, UI, & Tools)**, **Zod**, and **Framer Motion**.

This project implements **FE-08 (Error States, Empty States, and Edge Cases)**, delivering resilience, fallback mechanisms, real-time network loss handling, rate limit backoff visualizers, React error boundaries, zero-data empty states, and input edge-case validators.

---

## 🛡️ Error States & Resilience Architecture

### 1. Global React Error Boundary (`components/error-boundary.tsx`)
Catches uncaught client-side component exceptions gracefully with a dark glassmorphic error fallback UI:
- **Diagnostic Telemetry Stack**: Collapsible stack trace viewer formatted with component hierarchy.
- **Copy Diagnostics**: One-click clipboard copy of complete error telemetry log for debugging.
- **Application Recovery**: "Reload App" trigger to restore state cleanly.

### 2. Handled Tool Execution Errors (`components/tools/tool-error-card.tsx`)
Displays designed output-error state cards for failed tool calls (e.g. simulated server failures, missing API keys, or target site offline):
- Error severity status badge (`output-error`).
- Diagnostic error explanation box with parameter inspection.
- "Retry Execution" action trigger allowing users to re-run the tool with cached parameters.

### 3. API Quota & Rate Limit Throttling (`components/tools/rate-limit-card.tsx`)
Renders an interactive HTTP 429 quota exhaustion card when provider rate limits are hit:
- Real-time countdown timer tracking exponential backoff reset window.
- Provider and throughput metrics display (e.g. 0 / 60 remaining requests).
- Retry button enabled automatically once backoff timer expires.

### 4. App Router Error & 404 Route Handlers (`app/error.tsx`, `app/not-found.tsx`)
- App-level segment error recovery with segment reset triggers.
- Styled 404 Not Found layout for invalid conversation IDs or route paths.

---

## 🎨 Empty States Design System

### 1. Welcome & Zero-Data Workspace (`components/ui/empty-state-card.tsx`)
Interactive welcome screen presented on new or cleared conversation threads:
- Pulsing glassmorphic ambient orb visualizer.
- Categorized starter action cards (Lead Scoring, SEO Inspector, Interactive Confirmation, Error Simulation).
- Zero-data search filter fallbacks for sidebar history queries.

### 2. Search & History Zero States
Custom zero-data states rendering dedicated illustrations and copy when message filtering or history searches yield 0 results.

---

## ⚠️ Edge Cases & Input Validation

### 1. Real-Time Network Disconnect Detection (`hooks/use-online-status.ts` & `components/chat/offline-banner.tsx`)
Monitors `navigator.onLine` and window connectivity events:
- Animated top notification banner alerting users when network connection drops.
- Disables stream submissions until network recovery.
- Auto-reconnect notification toast when connection is re-established.

### 2. Input Length & Overflow Validator (`components/chat/chat-input.tsx`)
- Character length tracking against a 4,000 character prompt limit.
- Animated warning badge when approaching the 90% character threshold (3,800+ chars).
- Prevents oversized API payload submissions with tooltip notice.

### 3. Unregistered & Corrupted Tool Schema Fallback (`components/tools/unknown-tool-card.tsx`)
Fallback renderer for unrecognized tool names or corrupted JSON payload streams, exposing an expandable raw JSON inspector to prevent application crashes.

---

## 🛠️ Server-Side Tool Contracts (`lib/tools.ts`)

### 1. `scoreLead`
Evaluates B2B sales leads to compute intent score, tier, deal probability, breakdown metrics, and a 4-month conversion forecast trajectory.
- **UI Render**: `<LeadScoreCard />` featuring SVG circular gauge ring, progress bars, line chart forecast, intent signals, and CTA.

### 2. `fetchMetaTags`
Scrapes website metadata, Open Graph preview cards, SEO readiness scores, and HTTP security headers.
- **UI Render**: `<MetaTagsCard />` featuring Open Graph preview mockup, dual score badges, and security checklist.

### 3. `confirmAction`
Prompts the user for explicit confirmation before executing CRM sync or report export.
- **UI Render**: `<ConfirmationCard />` featuring interactive Confirm/Deny buttons and status lifecycle updates.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm / pnpm / yarn

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env.local` file in the project root:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Running Automated Mid-Stream Failure Test
```bash
npm run test:mid-stream
```

---

## 📚 Extra Resources & Developer Toolkit

### 1. Chrome DevTools Network Throttling & Request Blocking
No third-party mocking libraries are required for real-world sabotage testing. Use native Chrome DevTools features built directly into `DevTools → Network`:
- **Offline / Disconnect**: Set network preset to **"Offline"** before clicking send to verify `<OfflineBanner />` and pre-send error handling.
- **Network Throttling**: Set preset to **"Slow 3G"** or **"Fast 3G"** to inspect pending `ThinkingSkeleton` animations and zero-CLS transitions.
- **Request Blocking**: Enable **"Request blocking"** for `/api/chat` to simulate network blockages and route boundary failures.

### 2. Buttons with a Brain Pattern
The action buttons in this checkpoint (`Send`, `Stop`, and `Retry`) implement production-grade **Buttons with a Brain** micro-interaction state choreography:
- **Explicit Scope Communication**: The retry button clearly indicates single-message scope (`Scope: Retrying only failed message`).
- **Double-Click Locking**: Utilizes state lock orchestration (`idle` ➔ `retrying` ➔ `success` ➔ `idle`) to prevent duplicate stream requests if double-clicked.
- **Contextual Morphing**: Smoothly transitions between `Send` (ArrowUp icon) when idle, `Stop` (Square fill icon) during active streaming, and `Retry` (RefreshCw icon with state choreography) on error.

---

## 🧪 License & Attribution
Designed for **FE-08: Error States, Empty States & Edge Cases**. Built with Next.js 16, Vercel AI SDK, and Tailwind CSS.
