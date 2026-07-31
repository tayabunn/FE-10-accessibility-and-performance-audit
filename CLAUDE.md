# Astrine AI (FE-08 + FE-03) — Project Rules & Verification Standards

This document specifies the project guidelines, automated verification loop commands, code style standards, and agentic workflows for `FE-08-error-states-empty-states-edge-cases`.

---

## 🛠️ Verification & Development Commands

Always run verification checks after implementing features or refactoring code. Do not mark a task complete without running and verifying test results.

| Task | Command | Description |
| :--- | :--- | :--- |
| **Unit Tests** | `npm run test` | Runs Vitest unit test suite (`schema.test.ts`, `user-profile-settings.test.tsx`) |
| **Production Build** | `npm run build` | Compiles Next.js 16 App Router pages & runs TypeScript type checking |
| **Linter Check** | `npm run lint` | Runs ESLint and React 19 compiler rules |
| **Mid-Stream Test** | `npm run test:mid-stream` | Executes automated mid-stream stream interruption verification script |
| **Development Server**| `npm run dev` | Starts local Next.js dev server |

---

## 🔁 Verification Loop Workflow

Follow this 4-phase workflow for all non-trivial changes:

1. **Explore**:
   - Inspect existing files, components, schemas, and dependencies before writing code.
   - Do not guess API shapes or file structures — read authoritative source files directly.
2. **Plan**:
   - Create or update implementation plans when making multi-file modifications or architectural decisions.
   - Outline verification criteria (e.g. unit test cases, type checks, build exit codes).
3. **Implement & Verify**:
   - Implement code adhering to accessibility (a11y) and TypeScript standards.
   - Run `npm run test` and `npm run build` after making changes.
   - **Address root causes**: Never swallow errors, return dummy fallbacks, or comment out failing assertions to hide symptoms.
4. **Evidence & Summary**:
   - Present concrete command outputs (e.g. passing test suites, zero-error builds) to prove success.

---

## 🎨 Code Style & Conventions

- **Framework**: Next.js 16 App Router + React 19.
- **Styling**: Tailwind CSS v4 with dark glassmorphic design system (`bg-[#06050c]`, `backdrop-blur-xl`, purple glowing borders `#0b081e`).
- **Validation**: Zod schema validation for forms (`creatorSettingsSchema`). Always handle email subaddressing aliases (`user+alias@domain.com`).
- **State Initialization**: Use lazy state initialization (`useState(() => ...)` or `useMemo`) for initial state loaded from `localStorage` or external APIs to avoid calling `setState` inside `useEffect`.
- **Accessibility (a11y)**:
  - Form controls must bind `aria-invalid` dynamically.
  - Inline error messages must use `aria-describedby` matching the error message `id`.
  - Form containers must auto-focus the first invalid input when submission fails.
  - Live announcements must use `role="status"` and `aria-live="polite"`.

---

## 🧠 Prompt Engineering & Evaluation Standards

1. **Structured System Prompts (XML Framing)**:
   - Use explicit XML tags (`<role>`, `<context>`, `<constraints>`, `<examples>`, `<verification_criteria>`) when crafting or updating system prompts.
   - Explicitly define success criteria, negative constraints, and output shape.
2. **Empirical Evaluation**:
   - Establish empirical verification criteria before tweaking system prompts or tool definitions.
   - Verify prompt efficacy by inspecting generated code or running unit test suites (`npm run test`).
3. **Role & Constraint Framing**:
   - Assign domain-specific roles (e.g. Senior Frontend Architect, Security Auditor).
   - Set strict boundaries preventing hallucinated APIs or unverified fallbacks.

---

## 🛡️ Governance & Safety Directives

- **No Unauthorized Pushing**: NEVER run `git push` or `vercel push` unless explicitly commanded by the user.
- **Environment Secrets**: Keep API keys in `.env.local`. Never check in raw secrets or credentials.

@AGENTS.md
