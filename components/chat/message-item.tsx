'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, ToolInvocationPart } from '@/hooks/use-chat-stream';
import { StreamingMarkdownRenderer } from './markdown-renderer';
import { ToolPartRenderer } from '../tools/tool-part-renderer';
import { AIPersona } from '@/lib/ai-config';
import { ConfirmActionInput } from '@/lib/tools';
import { User, Sparkles, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';

interface MessageItemProps {
  message: Message;
  persona: AIPersona;
  isLastAssistant?: boolean;
  onRegenerate?: () => void;
  onConfirmAction?: (input: ConfirmActionInput) => Promise<void>;
  onRetryTool?: (toolName: string, args?: Record<string, unknown>) => void;
}

export function MessageItem({
  message,
  persona,
  isLastAssistant,
  onRegenerate,
  onConfirmAction,
  onRetryTool,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isThinking = message.status === 'thinking';
  const isStreaming = message.status === 'streaming';
  const isStopped = message.status === 'stopped';
  const isError = message.status === 'error';

  // Separate tool invocation parts from markdown text content
  const toolParts = (message.parts || []).filter(
    (p): p is ToolInvocationPart => p.type === 'tool-invocation'
  );

  const textContent =
    (message.parts || [])
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
          {isThinking && toolParts.length === 0 && !textContent && (
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

        {/* Render Structured Tool Invocation Parts */}
        {toolParts.length > 0 && (
          <div className="space-y-3 my-2">
            {toolParts.map((part) => (
              <ToolPartRenderer
                key={part.toolCallId}
                toolPart={part}
                onConfirmAction={onConfirmAction}
                onRetryTool={onRetryTool}
              />
            ))}
          </div>
        )}

        {/* Render Markdown Text Content */}
        {(isStreaming || textContent || isStopped || isError) && (
          <div className="relative">
            {isError ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{textContent}</span>
              </div>
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
