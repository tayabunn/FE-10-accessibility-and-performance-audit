'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, ToolInvocationPart, MessagePart } from '@/hooks/use-chat-stream';
import dynamic from 'next/dynamic';

const StreamingMarkdownRenderer = dynamic(
  () => import('./markdown-renderer').then((mod) => mod.StreamingMarkdownRenderer)
);
import { ToolPartRenderer } from '../tools/tool-part-renderer';
import { WeatherCard } from '../tools/weather-card';
import { AIPersona } from '@/lib/ai-config';
import { ConfirmActionInput } from '@/lib/tools';
import { User, Sparkles, Copy, Check, RotateCcw, AlertTriangle, ExternalLink, Compass } from 'lucide-react';
import { ChatErrorCard } from './chat-error-card';

interface MessageItemProps {
  message: Message;
  persona: AIPersona;
  isLastAssistant?: boolean;
  onRegenerate?: () => void;
  onConfirmAction?: (input: ConfirmActionInput) => Promise<void>;
  onAddToolOutput?: (params: { tool: string; toolCallId: string; output?: unknown; state?: 'output-error'; errorText?: string }) => void;
  onAddToolApprovalResponse?: (params: { id?: string; approved: boolean }) => void;
  onRetryTool?: (toolName: string, args?: Record<string, unknown>) => void;
}

export function MessageItem({
  message,
  persona,
  isLastAssistant,
  onRegenerate,
  onConfirmAction,
  onAddToolOutput,
  onAddToolApprovalResponse,
  onRetryTool,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isThinking = message.status === 'thinking';
  const isStreaming = message.status === 'streaming';
  const isStopped = message.status === 'stopped';
  const isError = message.status === 'error';

  const parts = message.parts || [];

  const textContent = parts
    .filter((p) => p.type === 'text')
    .map((p) => (p as { type: 'text'; text: string }).text)
    .join('') || message.content;

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative flex gap-3 md:gap-4 p-4 md:p-5 rounded-2xl transition-all ${
        isUser
          ? 'bg-purple-950/40 border border-purple-800/50 ml-auto max-w-[88%] md:max-w-[78%] text-slate-100 shadow-lg shadow-purple-950/30'
          : 'bg-[#0a0818]/80 border border-purple-900/40 w-full text-slate-200 shadow-xl backdrop-blur-md'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
            : 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white shadow-purple-500/20'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <span className="text-base leading-none">{persona.avatar}</span>
        )}
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header line */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">
              {isUser ? 'You' : persona.name}
            </span>
            {!isUser && message.thinkingTimeMs && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 font-mono">
                Thought for {(message.thinkingTimeMs / 1000).toFixed(1)}s
              </span>
            )}
            {isStopped && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-400 font-mono">
                Stopped mid-stream
              </span>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-[11px] text-slate-500 font-mono">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Thinking State */}
        <AnimatePresence mode="wait">
          {isThinking && parts.length === 0 && !textContent && (
            <motion.div
              key="thinking-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
              className="flex items-center gap-3 py-2 px-3 rounded-lg bg-purple-950/50 border border-purple-700/50 text-xs text-purple-300 w-fit shadow-md shadow-purple-950/40"
            >
              <div className="relative flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="absolute w-2 h-2 rounded-full bg-purple-400 animate-ping opacity-75" />
              </div>
              <span className="font-medium tracking-wide">
                Thinking & selecting tool schema...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Render Parts Array (handling step-start, source, data-weather, tool-invocation) */}
        {parts.map((part, index) => {
          switch (part.type) {
            case 'step-start':
              return index > 0 ? (
                <div key={`step_${index}`} className="my-3 flex items-center gap-2 text-slate-500 text-[11px] font-mono">
                  <span className="h-px flex-1 bg-purple-900/40" />
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950 border border-purple-800/40 text-purple-300">
                    <Compass className="w-3 h-3 text-purple-400" /> Multi-Step Iteration #{index}
                  </span>
                  <span className="h-px flex-1 bg-purple-900/40" />
                </div>
              ) : null;

            case 'source':
              return (
                <div key={`src_${index}`} className="my-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-800/50 text-xs text-purple-300 shadow-sm">
                  <span className="font-semibold text-slate-300">Source:</span>
                  <a href={part.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-purple-400 hover:text-purple-200 underline font-mono text-[11px]">
                    <span>{part.title}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );

            case 'data-weather':
              return (
                <div key={`data_weather_${index}`} className="my-3">
                  <WeatherCard
                    city={part.data.city}
                    weather={part.data.weather}
                    status={part.data.status}
                  />
                </div>
              );

            case 'tool-invocation':
            case 'dynamic-tool':
              return (
                <ToolPartRenderer
                  key={(part as ToolInvocationPart).toolCallId || index}
                  toolPart={part as ToolInvocationPart}
                  onConfirmAction={onConfirmAction}
                  onAddToolOutput={onAddToolOutput}
                  onAddToolApprovalResponse={onAddToolApprovalResponse}
                  onRetryTool={onRetryTool}
                />
              );

            default:
              return null;
          }
        })}

        {/* Render Markdown Text Content */}
        {(isStreaming || textContent || isStopped || isError) && (
          <div className="relative" aria-live={isStreaming ? "polite" : "off"}>
            {isError ? (
              <ChatErrorCard
                error={textContent}
                onRetry={onRegenerate || (() => {})}
              />
            ) : textContent ? (
              <StreamingMarkdownRenderer
                content={textContent}
                isStreaming={isStreaming}
              />
            ) : null}

            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-purple-400 rounded-sm animate-pulse align-middle" />
            )}
          </div>
        )}

        {/* Action Bar */}
        {!isThinking && textContent && (
          <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-purple-950/40 hover:bg-purple-900/50 text-slate-400 hover:text-slate-200 transition-colors border border-purple-900/40"
              title="Copy text"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {!isUser && isLastAssistant && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-purple-950/40 hover:bg-purple-900/50 text-slate-400 hover:text-purple-300 transition-colors border border-purple-900/40"
                title="Regenerate response"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
