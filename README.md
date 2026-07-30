# Astrine AI — Streaming AI Chat Interface

A production-grade, state-of-the-art **Streaming AI Chat Interface** built with **Next.js 15 App Router**, **React 19**, **Tailwind CSS**, **Vercel AI SDK (Core, UI, & Harnesses)**, **OpenRouter / Anthropic / OpenAI**, and **Framer Motion**.

Inspired by Vercel's open-source [AI Chatbot Template](https://github.com/vercel/ai-chatbot) and the **Motion with Intent** design principles.

---

## 🌟 Key Features & Production Architecture

### 1. Vercel AI SDK UI & Core Response Pipeline
- **Server Stream Handler (`app/api/chat/route.ts`)**:
  - `streamText`: Provider-agnostic text streaming pipeline across Anthropic, OpenAI, Google, and OpenRouter.
  - `convertToModelMessages(messages)`: Safely converts UI messages to model-ready messages.
  - `createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })`: Standardized Vercel AI SDK UI event stream handler.
- **Client Transport (`hooks/use-chat-stream.ts`)**:
  - Managed using `@ai-sdk/react`'s `useChat` hook and `DefaultChatTransport`.
  - Supports typed message `parts` (`part.type === 'text' | 'reasoning'`).
  - Supports status states (`submitted`, `streaming`, `ready`, `error`), mid-stream cancellation (`stop()`), and prompt regeneration (`regenerate()`).

### 2. Motion with Intent Choreography
- **Thinking-to-Token Handoff**: Pulsing thinking indicator seamlessly crossfades into streamed token text without layout jump or frame drops.
- **5-State Action Button**: Morphing Send/Stop button (`Idle`, `Disabled`, `Thinking`, `Streaming`, `Stopped`) with interactive Framer Motion scale & spring feedback.
- **Message Entrance Choreography**: Smooth spring entrance animations (`y: 10 -> 0`, `duration: 0.25s`) respecting `prefers-reduced-motion`.

### 3. Robust Auto-Scroll Pinning Algorithm
- Threshold-aware detector (`scrollTop + clientHeight >= scrollHeight - 60px`).
- Viewport remains locked to the bottom **only** while the user is at the bottom.
- Manually scrolling up during streaming releases the bottom lock immediately.
- Floating **"Jump to latest"** affordance button pops up when scrolled up.

### 4. Streaming-Aware Safe Markdown Renderer
- Prevents visual breaks from unclosed markdown tags (` ``` `, `**`) mid-stream.
- Code syntax highlighting with a one-click **Copy Code** button.

### 5. Server API Key Security & Dynamic Key Status
- Keys (`OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, etc.) live strictly server-side in `.env.local`.
- Dynamic `/api/key-status` route prevents React SSR hydration mismatches.

---

## 🛠️ Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts         # Vercel AI SDK streamText & UI message stream handler
│   │   └── key-status/
│   │       └── route.ts         # Server key status endpoint
│   ├── globals.css              # Dark theme CSS & custom scrollbars
│   ├── layout.tsx               # Root layout with suppressHydrationWarning
│   └── page.tsx                 # Astrine AI main view
├── components/
│   └── chat/
│       ├── chat-input.tsx       # Auto-resizing input & 5-State Action Button
│       ├── chat-interface.tsx   # Glassmorphic layout container
│       ├── markdown-renderer.tsx # Streaming-safe code & markdown parser
│       ├── message-item.tsx     # Message bubbles & thinking handoff
│       ├── message-list.tsx     # Message thread & auto-scroll container
│       └── sidebar.tsx          # Persona & model engine config drawer
├── hooks/
│   ├── use-auto-scroll.ts       # Threshold-aware pin/unpin scroll hook
│   └── use-chat-stream.ts       # AI SDK useChat & transport hook
└── lib/
    ├── ai-config.ts             # Personas, system prompts & model configs
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
> *Note: If no API key is set, the application automatically falls back to an offline simulated stream generator so you can test all streaming, stop, and auto-scroll features immediately.*

### 3. Run Development Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```
