import { useState, useCallback, useRef, useEffect } from 'react';
import { useChat as useVercelChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ConfirmActionInput, ConfirmActionResult } from '@/lib/tools';

export type ToolState = 'input-streaming' | 'input-available' | 'output-available' | 'output-error';

export interface ToolInvocationPart {
  type: 'tool-invocation';
  toolCallId: string;
  toolName: string;
  args?: Record<string, unknown>;
  state: ToolState;
  result?: unknown;
  error?: string;
}

export type MessagePart =
  | { type: 'text'; text: string }
  | ToolInvocationPart;

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts: MessagePart[];
  createdAt: string;
  status?: 'thinking' | 'streaming' | 'completed' | 'stopped' | 'error';
  thinkingTimeMs?: number;
}

export type StreamState = 'idle' | 'thinking' | 'streaming' | 'stopped' | 'error';

interface UseChatStreamOptions {
  personaId?: string;
  modelId?: string;
  temperature?: number;
  initialMessages?: Message[];
}

const STORAGE_KEY = 'fe_07_chat_history_v2';

export function useChatStream({
  personaId = 'mentor',
  modelId = 'claude-3-5-sonnet',
  temperature = 0.7,
  initialMessages = [],
}: UseChatStreamOptions = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [status, setStatus] = useState<StreamState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  const transport = useRef(
    new DefaultChatTransport({
      api: '/api/chat',
    })
  ).current;

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && initialMessages.length === 0) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, [initialMessages.length]);

  // Persist history
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
    } catch {
      // Ignore
    }
  }, [messages]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('stopped');
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === prev.length - 1 && msg.role === 'assistant'
          ? { ...msg, status: 'stopped' }
          : msg
      )
    );
  }, []);

  const sendMessage = useCallback(
    async (inputPayload: string | { text: string }, overridePersonaId?: string, overrideModelId?: string) => {
      const contentText = typeof inputPayload === 'string' ? inputPayload : inputPayload.text;
      if (!contentText.trim() || status === 'thinking' || status === 'streaming') return;

      setErrorMessage(null);
      const userMessageId = `user_${Date.now()}`;
      const assistantMessageId = `asst_${Date.now()}`;
      const timestamp = new Date().toISOString();

      const newUserMessage: Message = {
        id: userMessageId,
        role: 'user',
        content: contentText.trim(),
        parts: [{ type: 'text', text: contentText.trim() }],
        createdAt: timestamp,
      };

      const newAssistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        parts: [],
        createdAt: timestamp,
        status: 'thinking',
      };

      setMessages((prev) => [...prev, newUserMessage, newAssistantMessage]);
      setStatus('thinking');
      startTimeRef.current = Date.now();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            messages: [...messages, newUserMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            personaId: overridePersonaId || personaId,
            modelId: overrideModelId || modelId,
            temperature,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Response body stream is empty.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedText = '';
        const toolPartsMap: Record<string, ToolInvocationPart> = {};
        let hasStartedStreaming = false;

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const dataLine = trimmed.split('\n').find((l) => l.startsWith('data: '));
            if (!dataLine) continue;

            const jsonStr = dataLine.replace(/^data:\s*/, '');
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);

              // 1. Tool Event: tool_call_streaming
              if (data.type === 'tool_call_streaming' || data.type === 'tool-call-streaming') {
                toolPartsMap[data.toolCallId] = {
                  type: 'tool-invocation',
                  toolCallId: data.toolCallId,
                  toolName: data.toolName,
                  args: data.args || {},
                  state: 'input-streaming',
                };
              }
              // 2. Tool Event: tool_call_available
              else if (data.type === 'tool_call_available' || data.type === 'tool-call') {
                toolPartsMap[data.toolCallId] = {
                  type: 'tool-invocation',
                  toolCallId: data.toolCallId,
                  toolName: data.toolName,
                  args: data.args || {},
                  state: 'input-available',
                };
              }
              // 3. Tool Event: tool_result
              else if (data.type === 'tool_result' || data.type === 'tool-result') {
                toolPartsMap[data.toolCallId] = {
                  type: 'tool-invocation',
                  toolCallId: data.toolCallId,
                  toolName: data.toolName,
                  args: data.args || {},
                  state: 'output-available',
                  result: data.result,
                };
              }
              // 4. Tool Event: tool_error
              else if (data.type === 'tool_error' || data.type === 'tool-error') {
                toolPartsMap[data.toolCallId] = {
                  type: 'tool-invocation',
                  toolCallId: data.toolCallId,
                  toolName: data.toolName,
                  args: data.args || {},
                  state: 'output-error',
                  error: data.error || 'Tool execution encountered an error.',
                };
              }

              // Text deltas
              const tokenText = data.delta?.type === 'text_delta' ? data.delta.text : data.content;
              if (tokenText) {
                accumulatedText += tokenText;
              }

              if (!hasStartedStreaming && (tokenText || Object.keys(toolPartsMap).length > 0)) {
                hasStartedStreaming = true;
                const thinkingTime = Date.now() - startTimeRef.current;
                setStatus('streaming');
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, status: 'streaming', thinkingTimeMs: thinkingTime }
                      : msg
                  )
                );
              }

              // Update assistant message parts
              const currentParts: MessagePart[] = [
                ...Object.values(toolPartsMap),
                ...(accumulatedText ? [{ type: 'text' as const, text: accumulatedText }] : []),
              ];

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: accumulatedText,
                        parts: currentParts,
                      }
                    : msg
                )
              );

              if (data.type === 'finish' || data.type === 'message_stop') {
                break;
              }
            } catch {
              // Direct string text chunk fallback
              if (jsonStr) {
                accumulatedText += jsonStr;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          content: accumulatedText,
                          parts: [...Object.values(toolPartsMap), { type: 'text', text: accumulatedText }],
                        }
                      : msg
                  )
                );
              }
            }
          }
        }

        setStatus('idle');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, status: 'completed' }
              : msg
          )
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          setStatus('stopped');
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, status: 'stopped' }
                : msg
            )
          );
        } else {
          console.error('Streaming error:', err);
          const msg = err instanceof Error ? err.message : 'Streaming request failed';
          setErrorMessage(msg);
          setStatus('error');
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    status: 'error',
                    content: `⚠️ Error: ${msg}`,
                    parts: [{ type: 'text', text: `⚠️ Error: ${msg}` }],
                  }
                : msg
            )
          );
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [messages, personaId, modelId, temperature, status]
  );

  // Client-side confirmation handler for user-interaction tool
  const handleConfirmAction = useCallback(async (input: ConfirmActionInput) => {
    // Find latest assistant message with confirmAction tool part
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.role !== 'assistant') return msg;
        const updatedParts = msg.parts.map((p) => {
          if (p.type === 'tool-invocation' && p.toolName === 'confirmAction') {
            const mockResult: ConfirmActionResult = {
              actionType: input.actionType,
              targetName: input.targetName,
              status: 'executed',
              transactionId: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
              executedAt: new Date().toISOString(),
              summary: `Report export executed successfully for ${input.targetName}. Report delivered to workspace analytics dashboard.`,
            };
            return {
              ...p,
              state: 'output-available' as const,
              result: mockResult,
            };
          }
          return p;
        });
        return { ...msg, parts: updatedParts };
      })
    );
  }, []);

  // Client-side retry handler for tool error state
  const handleRetryTool = useCallback((toolName: string, args?: Record<string, unknown>) => {
    sendMessage(`Retry tool execution for ${toolName} with parameters: ${JSON.stringify(args || {})}`);
  }, [sendMessage]);

  const regenerate = useCallback(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.role === 'assistant') {
      const prevUserMsg = [...messages]
        .reverse()
        .find((m) => m.role === 'user');

      if (prevUserMsg) {
        setMessages((prev) => prev.slice(0, -1));
        sendMessage(prevUserMsg.content);
      }
    } else if (lastMsg.role === 'user') {
      sendMessage(lastMsg.content);
    }
  }, [messages, sendMessage]);

  const clearMessages = useCallback(() => {
    stop();
    setMessages([]);
    setStatus('idle');
    setErrorMessage(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, [stop]);

  return {
    messages,
    status,
    errorMessage,
    sendMessage,
    stop,
    regenerate,
    clearMessages,
    handleConfirmAction,
    handleRetryTool,
    setMessages,
    transport,
  };
}
