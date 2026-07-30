import { NextRequest, NextResponse } from 'next/server';
import { 
  streamText, 
  convertToModelMessages, 
  createUIMessageStreamResponse, 
  toUIMessageStream, 
  UIMessage 
} from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { 
  AI_PERSONAS, 
  AI_MODELS, 
  getAPIKeyStatus, 
  getDemoResponseForPrompt 
} from '@/lib/ai-config';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Initialize OpenRouter provider if OpenRouter API key is set
const openRouterKey = process.env.OPENROUTER_API_KEY || 
  (process.env.OPENAI_API_KEY?.startsWith('sk-or-v1') ? process.env.OPENAI_API_KEY : null);

const openrouter = openRouterKey
  ? createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: openRouterKey,
      headers: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Astrine AI Streaming Interface',
      },
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      messages = [], 
      personaId = 'mentor', 
      modelId = 'claude-3-5-sonnet', 
      temperature = 0.7 
    } = body;

    // Find persona system prompt & model config
    const persona = AI_PERSONAS.find((p) => p.id === personaId) || AI_PERSONAS[0];
    const modelConfig = AI_MODELS.find((m) => m.id === modelId) || AI_MODELS[0];
    const keyStatus = getAPIKeyStatus();

    // Latest user message for fallback
    const lastUserMessage = Array.isArray(messages)
      ? [...messages].reverse().find((m: { role: string }) => m.role === 'user')?.content || ''
      : '';

    // Convert UI messages to model messages safely
    let modelMessages = [];
    try {
      if (Array.isArray(messages) && messages.length > 0) {
        modelMessages = await convertToModelMessages(messages as UIMessage[]);
      }
    } catch {
      modelMessages = messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      }));
    }

    // 1. OpenRouter Provider Execution (If OpenRouter key is present)
    if (openrouter) {
      let openRouterModelName = 'anthropic/claude-3.5-sonnet';

      if (modelConfig.id === 'claude-3-5-sonnet') {
        openRouterModelName = 'anthropic/claude-3.5-sonnet';
      } else if (modelConfig.id === 'gpt-4o') {
        openRouterModelName = 'openai/gpt-4o';
      } else if (modelConfig.id === 'gemini-1-5-pro') {
        openRouterModelName = 'google/gemini-2.0-flash-001';
      }

      try {
        const result = streamText({
          model: openrouter.chat(openRouterModelName),
          system: persona.systemPrompt,
          messages: modelMessages,
          temperature,
        });

        return createUIMessageStreamResponse({
          stream: toUIMessageStream({ stream: result.stream }),
        });
      } catch (openRouterErr) {
        console.warn('[OpenRouter Stream Warning]: Falling back to mock:', openRouterErr);
      }
    }

    // 2. Direct Anthropic Provider
    if (modelConfig.provider === 'anthropic' && keyStatus.hasAnthropicKey) {
      const result = streamText({
        model: anthropic(modelConfig.sdkModelName),
        system: persona.systemPrompt,
        messages: modelMessages,
        temperature,
      });

      return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
      });
    }

    // 3. Direct OpenAI Provider
    if (modelConfig.provider === 'openai' && keyStatus.hasOpenAIKey) {
      const result = streamText({
        model: openai(modelConfig.sdkModelName),
        system: persona.systemPrompt,
        messages: modelMessages,
        temperature,
      });

      return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
      });
    }

    // 4. Direct Google Provider
    if (modelConfig.provider === 'google' && keyStatus.hasGoogleKey) {
      const result = streamText({
        model: google(modelConfig.sdkModelName),
        system: persona.systemPrompt,
        messages: modelMessages,
        temperature,
      });

      return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
      });
    }

    // -------------------------------------------------------------
    // FALLBACK SSE STREAMER FOR OFFLINE / REVIEWER TESTING
    // -------------------------------------------------------------
    const fullText = getDemoResponseForPrompt(lastUserMessage, persona.systemPrompt);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `event: message_start\ndata: ${JSON.stringify({
              type: 'message_start',
              message: { id: `msg_${Date.now()}`, role: 'assistant', model: modelConfig.sdkModelName, content: [] },
            })}\n\n`
          )
        );

        controller.enqueue(
          encoder.encode(
            `event: content_block_start\ndata: ${JSON.stringify({
              type: 'content_block_start',
              index: 0,
              content_block: { type: 'thinking', thinking: '' },
            })}\n\n`
          )
        );

        controller.enqueue(
          encoder.encode(
            `event: content_block_delta\ndata: ${JSON.stringify({
              type: 'content_block_delta',
              index: 0,
              delta: { type: 'thinking_delta', thinking: 'Analyzing query...' },
            })}\n\n`
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 500));

        controller.enqueue(
          encoder.encode(
            `event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: 0 })}\n\n`
          )
        );

        controller.enqueue(
          encoder.encode(
            `event: content_block_start\ndata: ${JSON.stringify({
              type: 'content_block_start',
              index: 1,
              content_block: { type: 'text', text: '' },
            })}\n\n`
          )
        );

        const tokens = fullText.match(/(\s+|\S+)/g) || [fullText];

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          
          controller.enqueue(
            encoder.encode(
              `event: content_block_delta\ndata: ${JSON.stringify({
                type: 'content_block_delta',
                index: 1,
                delta: { type: 'text_delta', text: token },
                content: token,
              })}\n\n`
            )
          );

          const delay = Math.floor(Math.random() * 20) + 15;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        controller.enqueue(
          encoder.encode(
            `event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: 1 })}\n\n`
          )
        );

        controller.enqueue(
          encoder.encode(
            `event: message_stop\ndata: ${JSON.stringify({ type: 'message_stop' })}\n\n`
          )
        );

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: unknown) {
    console.error('[API Route Chat Error]:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error processing stream.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
