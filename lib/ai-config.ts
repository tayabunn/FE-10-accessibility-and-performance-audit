/**
 * Centralized AI Model & System Prompt Configuration Module
 * --------------------------------------------------------
 * This module defines model parameters, system prompts, personas, 
 * and API key configurations for Astrine AI, powered by the Vercel AI SDK.
 * 
 * Primary Surfaces Encapsulated:
 * - AI SDK Core: Unified API for text streaming, object generation & agents (streamText, convertToModelMessages).
 * - AI SDK UI: Standardized hook state management (useChat, createUIMessageStreamResponse, toUIMessageStream).
 * - AI SDK Harnesses: HarnessAgent interface for running agent harnesses like Claude Code, Codex, and Pi.
 */

export interface AIPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
  systemPrompt: string;
  suggestedPrompts: string[];
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'google' | 'demo';
  sdkModelName: string;
  description: string;
  badge: string;
  maxTokens: number;
  temperature: number;
}

/**
 * Supported Personas with specialized system instructions.
 */
export const AI_PERSONAS: AIPersona[] = [
  {
    id: 'mentor',
    name: 'FE Capstone Mentor',
    role: 'Senior Frontend Architect',
    avatar: '⚡',
    description: 'Expert guidance on React 19, Next.js App Router, CSS Architecture, & Accessibility.',
    systemPrompt: `You are an elite Senior Frontend Architect and Mentor reviewing a developer's Capstone assignment.
Your responses should be:
- Exceptionally clear, well-structured, and visually inviting (use bolding, clean lists, and code blocks).
- Pragmatic and focused on web performance, accessibility (a11y), state management, and modern React 19 / Next.js patterns.
- Direct, friendly, and structured with clear headings.
- When writing code, provide production-ready TypeScript with helpful inline comments.`,
    suggestedPrompts: [
      'How do I handle scroll-pinning during token streaming in React?',
      'Explain the handoff transition from a thinking indicator to streamed tokens.',
      'What are the best practices for stopping an SSE stream mid-flight without corrupting state?'
    ]
  },
  {
    id: 'ai-sdk-architect',
    name: 'AI SDK Architect',
    role: 'Vercel AI SDK Specialist',
    avatar: '▲',
    description: 'Deep expertise on AI SDK Core, AI SDK UI, and AI SDK Harnesses (HarnessAgent).',
    systemPrompt: `You are an expert Solutions Architect specializing in the Vercel AI SDK (TypeScript toolkit).
Explain AI SDK Core (streamText, convertToModelMessages), AI SDK UI (useChat, createUIMessageStreamResponse, toUIMessageStream, typed message parts), and AI SDK Harnesses (HarnessAgent for Claude Code, Codex, and Pi).
Provide practical code examples in TypeScript.`,
    suggestedPrompts: [
      'Explain the 3 primary surfaces of Vercel AI SDK: Core, UI, and Harnesses.',
      'How does convertToModelMessages and createUIMessageStreamResponse work in Next.js App Router?',
      'Show how to handle typed message parts (text, reasoning, tool-use) in AI SDK UI.'
    ]
  },
  {
    id: 'code-auditor',
    name: 'Senior Code Auditor',
    role: 'Security & Optimization Expert',
    avatar: '🛡️',
    description: 'Deep-dive security, performance auditing, edge cases, and code refactoring.',
    systemPrompt: `You are a Senior Code Auditor & Performance Specialist.
Your task is to analyze code for edge cases, memory leaks, re-render bottlenecks, and security flaws.
Always structure your feedback as:
1. Executive Summary
2. Potential Flaws / Risks (highlighted clearly)
3. Optimized Refactored Solution (with code diffs or clean snippets)
4. Key Takeaways.`,
    suggestedPrompts: [
      'Audit my React auto-scroll hook for race conditions and scroll locking bugs.',
      'How can I ensure API keys never leak to the client during streaming?',
      'What are common memory leaks when handling AbortController in custom React hooks?'
    ]
  },
  {
    id: 'tech-writer',
    name: 'AI Documentation Lead',
    role: 'Technical Writer',
    avatar: '✍️',
    description: 'Creates concise documentation, architecture diagrams, and API specifications.',
    systemPrompt: `You are a Technical Writer specializing in frontend software architecture and design specs.
Write clean, concise, technical documentation using standard Markdown, Mermaid-style ASCII diagrams, and organized tables.`,
    suggestedPrompts: [
      'Write a component architecture document for a streaming AI chat interface.',
      'Create an SSE vs WebSockets comparison table for real-time frontend streaming.',
      'Draft a README section explaining how to configure server-side API keys.'
    ]
  }
];

/**
 * Supported AI Models.
 */
export const AI_MODELS: AIModelConfig[] = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    sdkModelName: 'claude-3-5-sonnet-20241022',
    description: 'Top-tier reasoning, code generation, and complex analysis.',
    badge: 'Recommended',
    maxTokens: 4096,
    temperature: 0.7
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    sdkModelName: 'gpt-4o',
    description: 'Fast, highly intelligent multimodal reasoning.',
    badge: 'Fast',
    maxTokens: 4096,
    temperature: 0.7
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    sdkModelName: 'gemini-1.5-pro',
    description: 'Long-context reasoning & technical deep dives.',
    badge: 'Pro',
    maxTokens: 4096,
    temperature: 0.7
  },
  {
    id: 'demo-fallback',
    name: 'Simulated Stream (No API Key)',
    provider: 'demo',
    sdkModelName: 'demo-streamer',
    description: 'Built-in server mock stream for offline testing & grading without API keys.',
    badge: 'Offline / Mock',
    maxTokens: 2048,
    temperature: 0.7
  }
];

/**
 * Returns active environment API key status.
 */
export function getAPIKeyStatus() {
  const hasOpenRouter = Boolean(
    process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY?.startsWith('sk-or-v1')
  );

  return {
    hasOpenRouterKey: hasOpenRouter,
    hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY) || hasOpenRouter,
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY) || hasOpenRouter,
    hasGoogleKey: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY) || hasOpenRouter,
  };
}

/**
 * Gets active model config or falls back to demo mode if key is missing.
 */
export function getModelConfig(modelId: string): AIModelConfig {
  const model = AI_MODELS.find((m) => m.id === modelId) || AI_MODELS[0];
  const keys = getAPIKeyStatus();

  if (model.provider === 'anthropic' && !keys.hasAnthropicKey) {
    if (!keys.hasOpenAIKey && !keys.hasGoogleKey) {
      return AI_MODELS.find((m) => m.id === 'demo-fallback')!;
    }
  }
  return model;
}

/**
 * Realistic response generator for fallback demo mode.
 * Provides high quality markdown response streamed token-by-token when no API key is set.
 */
export function getDemoResponseForPrompt(userPrompt: string, personaPrompt: string): string {
  const promptLower = userPrompt.toLowerCase();

  if (promptLower.includes('surfaces') || promptLower.includes('sdk') || promptLower.includes('harness')) {
    return `### ▲ Vercel AI SDK Core Architecture

The **Vercel AI SDK** is structured into three primary surfaces designed for TypeScript AI development:

1. **AI SDK Core**:
   - \`streamText\`: Unified text streaming pipeline.
   - \`convertToModelMessages\`: Converts UI messages to model-ready structures.
   - \`generateObject\` & \`generateText\`: Structured data extraction & tool invocation.

2. **AI SDK UI**:
   - \`useChat\`: React 19 hook for managed message states, cancellation, regeneration, and transport configuration.
   - \`createUIMessageStreamResponse\`: Server helper wrapping streams into UI event streams.
   - \`parts\`: Typed message parts (\`text\`, \`reasoning\`, \`file\`, \`tool-invocation\`).

3. **AI SDK Harnesses**:
   - \`HarnessAgent\`: A uniform API for running established agent harnesses (Claude Code, Codex, Pi) decoupled from specific providers.

\`\`\`typescript
import { streamText, convertToModelMessages, createUIMessageStreamResponse, toUIMessageStream } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: openrouter('anthropic/claude-3.5-sonnet'),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
\`\`\``;
  }

  if (promptLower.includes('scroll') || promptLower.includes('auto-scroll')) {
    return `### 🌊 Robust Auto-Scroll Architecture for Token Streams

Handling auto-scroll during real-time token streaming requires a **pinned state model** rather than simple unconditional scrolling.

#### Key Principles:
1. **Pinning Threshold**: Pin the viewport to the bottom *only* if \`scrollTop + clientHeight >= scrollHeight - threshold\` (typically ~60px).
2. **Immediate Release**: The moment the user triggers an explicit scroll up, set \`isPinned = false\`.
3. **Re-pinning Affordance**: Display a floating *"Jump to latest"* button when unpinned.

\`\`\`typescript
const handleScroll = () => {
  if (!containerRef.current) return;
  const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
  const isAtBottom = scrollHeight - (scrollTop + clientHeight) <= 60;
  setIsPinned(isAtBottom);
};
\`\`\``;
  }

  return `### 🚀 Welcome to Astrine AI!

I am your **AI SDK Solutions Architect**, streaming responses token-by-token using Vercel AI SDK Core & UI primitives.

#### Core Features:
- **Token-by-token Streaming**: Watch text render smoothly as chunks arrive.
- **Thinking Handoff**: Notice the smooth pulsing thinking indicator before the first token appears.
- **Stop Mid-Stream**: Click the red **Stop** button at any time to pause stream generation safely.
- **Auto-Scroll Pinning**: Try scrolling up while I am outputting text—the auto-scroll will release, and a *"Jump to latest"* button will appear!
- **Markdown & Syntax Highlighting**: Includes code fences, copy buttons, tables, and quote blocks.`;
}
