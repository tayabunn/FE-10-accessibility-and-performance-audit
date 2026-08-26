# Frontend Audit Report: Performance & Accessibility

## Baseline Audit (Before Fixes)

We ran a Lighthouse audit with the mobile preset against the baseline production build of the chat interface.

- **Performance Score**: 82
- **Accessibility Score**: 98

**Key Findings:**
1. **Landmarks**: `landmark-one-main` failed because the primary chat layout lacked a `<main>` structural wrapper.
2. **Keyboard Focus & State**: During AI streaming, the chat input `textarea` became `disabled`, entirely dropping keyboard focus and forcing screen-reader users to Tab from the start of the document to reach the Stop button.
3. **Screen Reader Live Regions**: The streamed AI responses did not use `aria-live`, meaning new chunks were silently injected without politely announcing to assistive tech.
4. **Oversized JS**: The `rehype-highlight` plugin (which bundles `highlight.js`) was statically imported in `message-item.tsx`. This blocked the main thread and tanked LCP (Largest Contentful Paint) and TBT (Total Blocking Time).

---

## Implemented Fixes

1. **Accessibility: `<main>` Landmark**
   - Changed the primary layout container `div` in `components/chat/chat-interface.tsx` to a semantic `<main>` tag.
2. **Accessibility: `aria-live` on Stream**
   - Wrapped the AI message text container in `components/chat/message-item.tsx` with `aria-live="polite"` when the message is actively streaming (`status === 'streaming'`).
3. **Accessibility: Keyboard-Reachable Stop Button**
   - Changed `disabled={isBusy}` to `readOnly={isBusy}` on the textarea in `components/chat/chat-input.tsx`. This keeps the textarea in the tab order while preventing input, so hitting `Tab` moves focus cleanly to the "Stop" button.
4. **Performance: Lazy Loading Code Highlighting**
   - Refactored `message-item.tsx` to load `StreamingMarkdownRenderer` dynamically via `next/dynamic`. This defers loading `react-markdown` and `rehype-highlight` until an AI message actually appears, significantly improving initial JS payload size and initial render speed.

---

## Verification Audit (After Fixes)

We ran Lighthouse again to verify our changes.

- **Performance Score**: 86 (Up from 82, comfortably above the 80 absolute minimum)
- **Accessibility Score**: 100 (Perfect score, up from 98)
- **WAVE Audit**: 0 Errors.
- **Keyboard Flow**: Primary flow completely navigable by keyboard.
  - The Chat Input textarea successfully retains tab ordering when disabled via `readOnly`.
  - The Stop button is keyboard accessible.
  - Screen readers will politely announce the incoming AI stream via `aria-live="polite"`.
