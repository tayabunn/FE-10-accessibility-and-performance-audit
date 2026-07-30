import { useState, useCallback, useRef, useEffect } from 'react';
import { useChat as useVercelChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

export interface MessagePart {
  type: 'text';
  text: string;
}

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

const STORAGE_KEY = 'fe_06_chat_history_v1';

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

  // Vercel AI SDK Transport setup
  const transport = useRef(
    new DefaultChatTransport({
      api: '/api/chat',
    })
  ).current;

  // Load from localStorage on mount if no initial messages
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
      // Ignore localStorage errors
    }
  }, [initialMessages.length]);

  // Persist messages to localStorage
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [messages]);

  // Stop current streaming generation
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

  // Send a message and stream response
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
        parts: [{ type: 'text', text: '' }],
        createdAt: timestamp,
        status: 'thinking',
      };

      setMessages((prev) => [...prev, newUserMessage, newAssistantMessage]);
      setStatus('thinking');
      startTimeRef.current = Date.now();

      // Create new AbortController
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
        let accumulatedContent = '';
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

            // Extract SSE event lines
            const dataLine = trimmed.split('\n').find((l) => l.startsWith('data: '));
            if (!dataLine) continue;

            const jsonStr = dataLine.replace(/^data:\s*/, '');
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);

              // Anthropic Spec: thinking_delta
              if (
                data.type === 'thinking' ||
                data.delta?.type === 'thinking_delta'
              ) {
                continue;
              }

              // Anthropic Spec: text_delta or token event
              const tokenText = data.delta?.type === 'text_delta' ? data.delta.text : data.content;

              if (tokenText) {
                if (!hasStartedStreaming) {
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

                accumulatedContent += tokenText;

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          content: accumulatedContent,
                          parts: [{ type: 'text', text: accumulatedContent }],
                        }
                      : msg
                  )
                );
              }

              // Anthropic Spec: message_stop or finish signal
              if (data.type === 'finish' || data.type === 'message_stop') {
                break;
              }
            } catch {
              // Direct AI SDK text stream chunk fallback
              if (!hasStartedStreaming && jsonStr) {
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
              accumulatedContent += jsonStr;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: accumulatedContent,
                        parts: [{ type: 'text', text: accumulatedContent }],
                      }
                    : msg
                )
              );
            }
          }
        }

        // Completion
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

  // Regenerate last assistant response
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

  // Clear chat thread
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
    setMessages,
    transport,
  };
}
