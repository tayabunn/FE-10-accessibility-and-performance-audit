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
} from '@/lib/ai-config';
import { ALL_TOOLS, scoreLeadTool, fetchMetaTagsTool, confirmActionTool, simulateSystemDiagnosticTool } from '@/lib/tools';

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

    const persona = AI_PERSONAS.find((p) => p.id === personaId) || AI_PERSONAS[0];
    const modelConfig = AI_MODELS.find((m) => m.id === modelId) || AI_MODELS[0];
    const keyStatus = getAPIKeyStatus();

    const lastUserMessage = Array.isArray(messages)
      ? [...messages].reverse().find((m: { role: string }) => m.role === 'user')?.content || ''
      : '';

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

    const systemPromptWithTools = `${persona.systemPrompt}

You have access to real-time structured tools:
1. 'scoreLead': Scores a B2B sales lead or company (e.g., Stripe, Vercel, Acme Corp). Use this when user asks about lead scoring, deal probability, or enterprise prospect evaluation.
2. 'fetchMetaTags': Scrapes & analyzes website meta tags, Open Graph card preview, and security headers. Use when user provides a URL or asks to inspect meta tags.
3. 'confirmAction': Proposes an external CRM or export action requiring user confirmation.
4. 'simulateSystemDiagnostic': Runs a microservice health check. Use when user asks to test tool error states or system diagnostics.

Always invoke the appropriate tool when user queries fit these capabilities.`;

    // 1. OpenRouter Provider Execution
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
          system: systemPromptWithTools,
          messages: modelMessages,
          tools: ALL_TOOLS,
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
        system: systemPromptWithTools,
        messages: modelMessages,
        tools: ALL_TOOLS,
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
        system: systemPromptWithTools,
        messages: modelMessages,
        tools: ALL_TOOLS,
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
        system: systemPromptWithTools,
        messages: modelMessages,
        tools: ALL_TOOLS,
        temperature,
      });

      return createUIMessageStreamResponse({
        stream: toUIMessageStream({ stream: result.stream }),
      });
    }

    // -------------------------------------------------------------
    // DEMO SSE STREAMER WITH TOOL LIFECYCLE FOR REVIEWER / OFFLINE MODE
    // -------------------------------------------------------------
    const lowerPrompt = lastUserMessage.toLowerCase();
    const isLeadPrompt = lowerPrompt.includes('score') || lowerPrompt.includes('stripe') || lowerPrompt.includes('lead') || lowerPrompt.includes('prospect');
    const isMetaPrompt = lowerPrompt.includes('meta') || lowerPrompt.includes('http') || lowerPrompt.includes('.com') || lowerPrompt.includes('url') || lowerPrompt.includes('vercel');
    const isConfirmPrompt = lowerPrompt.includes('export') || lowerPrompt.includes('confirm') || lowerPrompt.includes('crm');
    const isErrorPrompt = lowerPrompt.includes('error') || lowerPrompt.includes('diagnostic') || lowerPrompt.includes('fail');

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Message Start
        controller.enqueue(
          encoder.encode(
            `event: message_start\ndata: ${JSON.stringify({
              type: 'message_start',
              message: { id: `msg_${Date.now()}`, role: 'assistant', model: modelConfig.sdkModelName, content: [] },
            })}\n\n`
          )
        );

        // Thinking phase
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
              delta: { type: 'thinking_delta', thinking: 'Analyzing query intent & selecting server-side Zod tool...' },
            })}\n\n`
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 400));

        controller.enqueue(
          encoder.encode(
            `event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: 0 })}\n\n`
          )
        );

        // TOOL EXECUTION DEMO FLOW IF TRIGGERED
        if (isLeadPrompt || isMetaPrompt || isConfirmPrompt || isErrorPrompt) {
          const toolCallId = `call_${Math.random().toString(36).substring(2, 9)}`;
          const toolName = isErrorPrompt
            ? 'simulateSystemDiagnostic'
            : isConfirmPrompt
            ? 'confirmAction'
            : isMetaPrompt
            ? 'fetchMetaTags'
            : 'scoreLead';

          const args = isErrorPrompt
            ? { serviceName: 'PaymentGatewayMicroservice', simulateFailure: true }
            : isConfirmPrompt
            ? { actionType: 'export_lead_report', targetName: 'Stripe, Inc.', parameters: { priority: 'high', notes: 'Automated CRM sync requested' } }
            : isMetaPrompt
            ? { url: 'https://vercel.com', checkSecurityHeaders: true }
            : { companyName: 'Stripe, Inc.', industry: 'Fintech & Payments', employeeCount: 8000 };

          // 1. Tool Call Streaming (input-streaming)
          controller.enqueue(
            encoder.encode(
              `event: tool_call_streaming\ndata: ${JSON.stringify({
                type: 'tool_call_streaming',
                toolCallId,
                toolName,
                args,
                state: 'input-streaming',
              })}\n\n`
            )
          );

          await new Promise((res) => setTimeout(res, 500));

          // 2. Tool Input Available (input-available)
          controller.enqueue(
            encoder.encode(
              `event: tool_call_available\ndata: ${JSON.stringify({
                type: 'tool_call_available',
                toolCallId,
                toolName,
                args,
                state: 'input-available',
              })}\n\n`
            )
          );

          await new Promise((res) => setTimeout(res, 600));

          // Execute tool backend function or return result/error
          try {
            let resultData;
            const toolExecOptions = { toolCallId, messages: [] } as any;
            if (toolName === 'scoreLead') {
              resultData = await scoreLeadTool.execute!(args as any, toolExecOptions);
            } else if (toolName === 'fetchMetaTags') {
              resultData = await fetchMetaTagsTool.execute!(args as any, toolExecOptions);
            } else if (toolName === 'confirmAction') {
              resultData = await confirmActionTool.execute!(args as any, toolExecOptions);
            } else {
              resultData = await simulateSystemDiagnosticTool.execute!(args as any, toolExecOptions);
            }

            // 3. Tool Output Available (output-available)
            controller.enqueue(
              encoder.encode(
                `event: tool_result\ndata: ${JSON.stringify({
                  type: 'tool_result',
                  toolCallId,
                  toolName,
                  args,
                  result: resultData,
                  state: 'output-available',
                })}\n\n`
              )
            );
          } catch (err: unknown) {
            const errStr = err instanceof Error ? err.message : 'Tool execution error';

            // 4. Tool Output Error (output-error)
            controller.enqueue(
              encoder.encode(
                `event: tool_error\ndata: ${JSON.stringify({
                  type: 'tool_error',
                  toolCallId,
                  toolName,
                  args,
                  error: errStr,
                  state: 'output-error',
                })}\n\n`
              )
            );
          }
        }

        // Text summary block after tool result
        controller.enqueue(
          encoder.encode(
            `event: content_block_start\ndata: ${JSON.stringify({
              type: 'content_block_start',
              index: 1,
              content_block: { type: 'text', text: '' },
            })}\n\n`
          )
        );

        const summaryText = isErrorPrompt
          ? `I attempted to run the \`simulateSystemDiagnostic\` tool on the backend microservice. As shown in the designed error component above, the microservice returned a 503 error. The system caught this gracefully without crashing.`
          : isConfirmPrompt
          ? `I've prepared the lead export action. Please review the details in the confirmation widget above and click **Approve & Execute** to proceed.`
          : isMetaPrompt
          ? `Here is the comprehensive metadata and Open Graph inspection for **vercel.com**. The page scored 94/100 in SEO readiness with all key security headers active.`
          : `Here is the full AI Lead Intelligence breakdown for **Stripe, Inc.** with an 88% conversion probability forecast.`;

        const tokens = summaryText.match(/(\s+|\S+)/g) || [summaryText];
        for (const token of tokens) {
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
          await new Promise((res) => setTimeout(res, 20));
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
