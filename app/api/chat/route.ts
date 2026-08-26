import { NextRequest, NextResponse } from 'next/server';
import { 
  streamText, 
  convertToModelMessages, 
  createUIMessageStream,
  createUIMessageStreamResponse, 
  toUIMessageStream, 
  isStepCount,
  UIMessage 
} from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { 
  AI_PERSONAS, 
  AI_MODELS, 
  getAPIKeyStatus, 
  getDemoResponseForPrompt,
} from '@/lib/ai-config';
import { 
  ALL_TOOLS, 
  scoreLeadTool, 
  fetchMetaTagsTool, 
  confirmActionTool, 
  simulateSystemDiagnosticTool,
  getWeatherInformationTool 
} from '@/lib/tools';
import type { MyUIMessage } from '@/ai/types';

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

export function errorHandler(error: unknown): string {
  if (error == null) return 'Unknown error occurred during processing.';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      messages = [], 
      personaId = 'mentor', 
      modelId = 'claude-3-5-sonnet', 
      temperature = 0.7,
      sabotageMode = null
    } = body;

    const urlSabotage = req.nextUrl.searchParams.get('sabotage');
    const activeSabotage = sabotageMode || urlSabotage;

    const lastUserMessage = Array.isArray(messages)
      ? [...messages].reverse().find((m: { role: string }) => m.role === 'user')?.content || ''
      : '';
    const lowerPrompt = lastUserMessage.toLowerCase();

    // Check sabotage triggers from body/query/prompt
    if (activeSabotage === 'route_500' || lowerPrompt.includes('[sabotage:500]') || lowerPrompt.includes('sabotage 500')) {
      return NextResponse.json(
        { error: 'Simulated Route Handler Failure: Internal Server Error (500)' },
        { status: 500 }
      );
    }

    if (activeSabotage === 'rate_limit' || lowerPrompt.includes('[sabotage:429]') || lowerPrompt.includes('sabotage 429')) {
      return NextResponse.json(
        { error: 'Simulated Rate Limit: HTTP 429 Too Many Requests. Quota Exceeded.' },
        { status: 429 }
      );
    }

    if (activeSabotage === 'slow_response' || lowerPrompt.includes('[sabotage:slow]') || lowerPrompt.includes('sabotage slow')) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }

    const persona = AI_PERSONAS.find((p) => p.id === personaId) || AI_PERSONAS[0];
    const modelConfig = AI_MODELS.find((m) => m.id === modelId) || AI_MODELS[0];
    const keyStatus = getAPIKeyStatus();

    let modelMessages: Awaited<ReturnType<typeof convertToModelMessages>> = [];
    try {
      if (Array.isArray(messages) && messages.length > 0) {
        modelMessages = await convertToModelMessages(messages as UIMessage[]);
      }
    } catch {
      modelMessages = messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })) as Awaited<ReturnType<typeof convertToModelMessages>>;
    }

    const systemPromptWithTools = `${persona.systemPrompt}

You have access to real-time structured tools:
1. 'scoreLead': Scores a B2B sales lead or company (e.g., Stripe, Vercel, Acme Corp). Use this when user asks about lead scoring, deal probability, or enterprise prospect evaluation.
2. 'fetchMetaTags': Scrapes & analyzes website meta tags, Open Graph card preview, and security headers. Use when user provides a URL or asks to inspect meta tags.
3. 'confirmAction': Proposes an external CRM or export action requiring user confirmation.
4. 'simulateSystemDiagnostic': Runs a microservice health check. Use when user asks to test tool error states or system diagnostics.
5. 'getWeatherInformation': Shows the weather in a given city to the user.
6. 'askForConfirmation': Ask the user for confirmation on the client side.
7. 'getLocation': Client-side tool that gets the user's location.

Always invoke the appropriate tool when user queries fit these capabilities.`;

    // Function to get active model instance
    const getActiveModel = () => {
      if (openrouter) {
        let openRouterModelName = 'anthropic/claude-3-haiku';
        if (modelConfig.id === 'claude-3-5-sonnet') openRouterModelName = 'anthropic/claude-3-haiku';
        else if (modelConfig.id === 'gpt-4o') openRouterModelName = 'openai/gpt-4o-mini';
        else if (modelConfig.id === 'gemini-1-5-pro') openRouterModelName = 'openai/gpt-4o-mini';
        return openrouter.chat(openRouterModelName);
      }
      if (modelConfig.provider === 'anthropic' && keyStatus.hasAnthropicKey) {
        return anthropic(modelConfig.sdkModelName);
      }
      if (modelConfig.provider === 'openai' && keyStatus.hasOpenAIKey) {
        return openai(modelConfig.sdkModelName);
      }
      if (modelConfig.provider === 'google' && keyStatus.hasGoogleKey) {
        return google(modelConfig.sdkModelName);
      }
      return null;
    };

    const activeModel = getActiveModel();

    if (activeModel) {
      const stream = createUIMessageStream<MyUIMessage>({
        execute: ({ writer }) => {
          // 1. Send initial transient notification
          writer.write({
            type: 'data-notification',
            data: { message: 'Processing your request with AI SDK v5...', level: 'info' },
            transient: true,
          });

          // 2. If weather query detected, demonstrate data part loading & reconciliation
          const lowerPrompt = lastUserMessage.toLowerCase();
          if (lowerPrompt.includes('weather') || lowerPrompt.includes('temperature') || lowerPrompt.includes('forecast')) {
            const extractedCity = lowerPrompt.includes('tokyo') ? 'Tokyo' : lowerPrompt.includes('paris') ? 'Paris' : 'San Francisco';
            writer.write({
              type: 'data-weather',
              id: `weather_${Date.now()}`,
              data: { city: extractedCity, status: 'loading' },
            });
          }

          // 3. Execute streamText with multi-step support
          const result = streamText({
            model: activeModel,
            system: systemPromptWithTools,
            messages: modelMessages,
            tools: ALL_TOOLS,
            stopWhen: isStepCount(5),
            temperature,
            maxTokens: 1500,
            onEnd() {
              // 4. Send transient completion notification
              writer.write({
                type: 'data-notification',
                data: { message: 'Streaming & tool execution finished successfully.', level: 'info' },
                transient: true,
              });
            },
          });

          writer.merge(
            toUIMessageStream({
              stream: result.stream,
              onError: errorHandler,
            })
          );
        },
      });

      return createUIMessageStreamResponse({ stream });
    }

    // -------------------------------------------------------------
    // DEMO / OFFLINE SSE STREAMER WITH TOOL LIFECYCLE FOR PREVIEW MODE
    // -------------------------------------------------------------
    const isLeadPrompt = lowerPrompt.includes('score') || lowerPrompt.includes('stripe') || lowerPrompt.includes('lead') || lowerPrompt.includes('prospect');
    const isMetaPrompt = lowerPrompt.includes('meta') || lowerPrompt.includes('http') || lowerPrompt.includes('.com') || lowerPrompt.includes('url') || lowerPrompt.includes('vercel');
    const isConfirmPrompt = lowerPrompt.includes('export') || lowerPrompt.includes('confirm') || lowerPrompt.includes('crm');
    const isErrorPrompt = lowerPrompt.includes('error') || lowerPrompt.includes('diagnostic') || lowerPrompt.includes('fail');
    const isWeatherPrompt = lowerPrompt.includes('weather') || lowerPrompt.includes('temperature') || lowerPrompt.includes('city');
    const isLocationPrompt = lowerPrompt.includes('location') || lowerPrompt.includes('where am i') || lowerPrompt.includes('where');
    const isAskConfirmPrompt = lowerPrompt.includes('ask') && lowerPrompt.includes('confirm');

    const encoder = new TextEncoder();
    const demoStream = new ReadableStream({
      async start(controller) {
        // Check mid-stream sabotage
        if (activeSabotage === 'mid_stream' || lowerPrompt.includes('mid_stream') || lowerPrompt.includes('sabotage stream')) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'text-delta', delta: { type: 'text_delta', text: 'Streaming started... ' } })}\n\n`
            )
          );
          await new Promise((r) => setTimeout(r, 400));
          controller.error(new Error('Simulated Stream Aborted Mid-Transmission: Network connection killed.'));
          return;
        }

        // Stream message_start
        controller.enqueue(
          encoder.encode(
            `event: message_start\ndata: ${JSON.stringify({
              type: 'message_start',
              message: { id: `msg_${Date.now()}`, role: 'assistant', model: modelConfig.sdkModelName, content: [] },
            })}\n\n`
          )
        );

        // Send transient data-notification chunk (Stream protocol format)
        controller.enqueue(
          encoder.encode(
            `event: data_notification\ndata: ${JSON.stringify({
              type: 'data-notification',
              data: { message: 'Initializing AI SDK v5 stream pipeline...', level: 'info' },
              transient: true,
            })}\n\n`
          )
        );

        // Thinking block
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
              delta: { type: 'thinking_delta', thinking: 'Analyzing request intent & building Zod tool call payload...' },
            })}\n\n`
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 350));

        controller.enqueue(
          encoder.encode(
            `event: content_block_stop\ndata: ${JSON.stringify({ type: 'content_block_stop', index: 0 })}\n\n`
          )
        );

        // TOOL EXECUTION DEMO FLOW
        const toolCallId = `call_${Math.random().toString(36).substring(2, 9)}`;

        if (isAskConfirmPrompt) {
          // Client interaction tool: askForConfirmation
          const args = { message: 'Do you authorize updating the sales territory assignment for Stripe, Inc.?' };
          controller.enqueue(
            encoder.encode(
              `event: tool_call_streaming\ndata: ${JSON.stringify({
                type: 'tool_call_streaming',
                toolCallId,
                toolName: 'askForConfirmation',
                args,
                state: 'input-streaming',
              })}\n\n`
            )
          );
          await new Promise((res) => setTimeout(res, 400));
          controller.enqueue(
            encoder.encode(
              `event: tool_call_available\ndata: ${JSON.stringify({
                type: 'tool_call_available',
                toolCallId,
                toolName: 'askForConfirmation',
                args,
                state: 'input-available',
              })}\n\n`
            )
          );
        } else if (isLocationPrompt) {
          // Client auto tool: getLocation
          const args = {};
          controller.enqueue(
            encoder.encode(
              `event: tool_call_streaming\ndata: ${JSON.stringify({
                type: 'tool_call_streaming',
                toolCallId,
                toolName: 'getLocation',
                args,
                state: 'input-streaming',
              })}\n\n`
            )
          );
          await new Promise((res) => setTimeout(res, 400));
          controller.enqueue(
            encoder.encode(
              `event: tool_call_available\ndata: ${JSON.stringify({
                type: 'tool_call_available',
                toolCallId,
                toolName: 'getLocation',
                args,
                state: 'input-available',
              })}\n\n`
            )
          );
        } else if (isWeatherPrompt) {
          // Server tool: getWeatherInformation
          const city = lowerPrompt.includes('tokyo') ? 'Tokyo' : lowerPrompt.includes('london') ? 'London' : 'San Francisco';
          const args = { city };

          controller.enqueue(
            encoder.encode(
              `event: tool_call_streaming\ndata: ${JSON.stringify({
                type: 'tool_call_streaming',
                toolCallId,
                toolName: 'getWeatherInformation',
                args,
                state: 'input-streaming',
              })}\n\n`
            )
          );
          await new Promise((res) => setTimeout(res, 400));
          controller.enqueue(
            encoder.encode(
              `event: tool_call_available\ndata: ${JSON.stringify({
                type: 'tool_call_available',
                toolCallId,
                toolName: 'getWeatherInformation',
                args,
                state: 'input-available',
              })}\n\n`
            )
          );
          await new Promise((res) => setTimeout(res, 500));
          const weatherResult = await getWeatherInformationTool.execute!(args, { toolCallId, messages: [] } as unknown as Parameters<NonNullable<typeof getWeatherInformationTool.execute>>[1]);
          controller.enqueue(
            encoder.encode(
              `event: tool_result\ndata: ${JSON.stringify({
                type: 'tool_result',
                toolCallId,
                toolName: 'getWeatherInformation',
                args,
                result: weatherResult,
                state: 'output-available',
              })}\n\n`
            )
          );
        } else if (isLeadPrompt || isMetaPrompt || isConfirmPrompt || isErrorPrompt) {
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

          await new Promise((res) => setTimeout(res, 450));

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

          await new Promise((res) => setTimeout(res, 500));

          try {
            let resultData;
            const toolExecOptions = { toolCallId, messages: [] } as unknown as Parameters<NonNullable<typeof scoreLeadTool.execute>>[1];
            if (toolName === 'scoreLead') {
              resultData = await scoreLeadTool.execute!(args as unknown as Parameters<typeof scoreLeadTool.execute>[0], toolExecOptions);
            } else if (toolName === 'fetchMetaTags') {
              resultData = await fetchMetaTagsTool.execute!(args as unknown as Parameters<typeof fetchMetaTagsTool.execute>[0], toolExecOptions);
            } else if (toolName === 'confirmAction') {
              resultData = await confirmActionTool.execute!(args as unknown as Parameters<typeof confirmActionTool.execute>[0], toolExecOptions);
            } else {
              resultData = await simulateSystemDiagnosticTool.execute!(args as unknown as Parameters<typeof simulateSystemDiagnosticTool.execute>[0], toolExecOptions);
            }

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

        // Text summary block
        controller.enqueue(
          encoder.encode(
            `event: content_block_start\ndata: ${JSON.stringify({
              type: 'content_block_start',
              index: 1,
              content_block: { type: 'text', text: '' },
            })}\n\n`
          )
        );

        const summaryText = isAskConfirmPrompt
          ? `I have requested your confirmation above before proceeding with the territory update.`
          : isLocationPrompt
          ? `I've triggered the client-side \`getLocation\` tool. Your browser location will be fetched automatically.`
          : isWeatherPrompt
          ? `Here is the current weather update retrieved via the server-side \`getWeatherInformation\` tool.`
          : isErrorPrompt
          ? `I attempted to run the \`simulateSystemDiagnostic\` tool on the backend microservice. As shown in the designed error component above, the microservice returned a 503 error. The system caught this gracefully without crashing.`
          : isConfirmPrompt
          ? `I've prepared the lead export action. Please review the details in the confirmation widget above and click **Approve & Execute** to proceed.`
          : isMetaPrompt
          ? `Here is the comprehensive metadata and Open Graph inspection for **vercel.com**. The page scored 94/100 in SEO readiness with all key security headers active.`
          : isLeadPrompt
          ? `Here is the full AI Lead Intelligence breakdown for **Stripe, Inc.** with an 88% conversion probability forecast.`
          : getDemoResponseForPrompt(lastUserMessage, persona.systemPrompt);

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

    return new Response(demoStream, {
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
