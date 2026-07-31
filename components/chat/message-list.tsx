'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/hooks/use-chat-stream';
import { MessageItem } from './message-item';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { AIPersona } from '@/lib/ai-config';
import { ConfirmActionInput } from '@/lib/tools';
import { ArrowDown, Sparkles, Building2, Globe, FileSpreadsheet, AlertOctagon, Sun, MapPin } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  persona: AIPersona;
  status: string;
  onRegenerate: () => void;
  onSelectPrompt: (prompt: string) => void;
  onConfirmAction?: (input: ConfirmActionInput) => Promise<void>;
  onAddToolOutput?: (params: { tool: string; toolCallId: string; output?: unknown; state?: 'output-error'; errorText?: string }) => void;
  onAddToolApprovalResponse?: (params: { id?: string; approved: boolean }) => void;
  onRetryTool?: (toolName: string, args?: Record<string, unknown>) => void;
}

export function MessageList({
  messages,
  persona,
  status,
  onRegenerate,
  onSelectPrompt,
  onConfirmAction,
  onAddToolOutput,
  onAddToolApprovalResponse,
  onRetryTool,
}: MessageListProps) {
  const lastMessageContent = messages[messages.length - 1]?.content || '';
  const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll<HTMLDivElement>({
    threshold: 60,
    contentDependency: [messages.length, lastMessageContent, status],
  });

  const toolPromptChips = [
    {
      icon: <Building2 className="w-4 h-4 text-emerald-400" />,
      title: 'Score Lead Stripe',
      prompt: 'Score lead for Stripe with employee count 8000 in Fintech',
      desc: 'Lead score card, SVG forecast chart & metrics',
    },
    {
      icon: <Globe className="w-4 h-4 text-indigo-400" />,
      title: 'Inspect Meta Tags Vercel',
      prompt: 'Fetch and analyze meta tags for vercel.com',
      desc: 'Social preview mockup & security headers',
    },
    {
      icon: <Sun className="w-4 h-4 text-amber-400" />,
      title: 'Check Tokyo Weather',
      prompt: 'Get the weather in Tokyo',
      desc: 'Server-side weather tool with live telemetry card',
    },
    {
      icon: <MapPin className="w-4 h-4 text-cyan-400" />,
      title: 'Auto Client Location',
      prompt: 'Where am I? Get my location',
      desc: 'Auto-executed client-side tool (onToolCall)',
    },
    {
      icon: <FileSpreadsheet className="w-4 h-4 text-purple-400" />,
      title: 'Export Lead Report',
      prompt: 'Export lead report for Stripe Inc with high priority',
      desc: 'Interactive confirmation before execution',
    },
    {
      icon: <AlertOctagon className="w-4 h-4 text-rose-400" />,
      title: 'Test Tool Error State',
      prompt: 'Simulate system diagnostic microservice tool error',
      desc: 'Designed output-error UI state test',
    },
  ];

  return (
    <div className="relative flex-1 min-h-0 w-full overflow-hidden">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto px-4 md:px-8 py-6 space-y-5 scroll-smooth custom-scrollbar"
      >
        {messages.length === 0 ? (
          /* Hero Section with Quick Action Tool Chips */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-[55vh] text-center max-w-3xl mx-auto space-y-6"
          >
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 text-xs font-semibold shadow-lg shadow-purple-950/40">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>AI SDK v5 Server Tools, Client Tools & Streaming Custom Data</span>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-purple-100 to-indigo-300 bg-clip-text text-transparent drop-shadow-md tracking-tight">
                Generative AI UI & Server Tools
              </h1>
              <p className="text-sm md:text-base text-purple-200/80 max-w-lg mx-auto leading-relaxed font-normal">
                Real-time Zod schemas, client auto execution (<code className="font-mono text-purple-300">onToolCall</code>), user confirmation dialogs, transient notifications, and data part reconciliation.
              </p>
            </div>

            {/* Quick Demo Action Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full pt-4">
              {toolPromptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(chip.prompt)}
                  className="group flex items-start gap-3 p-3.5 rounded-2xl bg-[#0a0818]/80 hover:bg-purple-950/60 border border-purple-900/40 hover:border-purple-600/60 text-left transition-all shadow-lg hover:shadow-purple-900/30 active:scale-[0.98]"
                >
                  <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/50 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {chip.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-white block group-hover:text-purple-300 transition-colors">
                      {chip.title}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {chip.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Messages Stream Thread */
          <div className="max-w-4xl mx-auto space-y-5 pb-8">
            {messages.map((msg, index) => (
              <MessageItem
                key={msg.id}
                message={msg}
                persona={persona}
                isLastAssistant={
                  index === messages.length - 1 && msg.role === 'assistant'
                }
                onRegenerate={onRegenerate}
                onConfirmAction={onConfirmAction}
                onAddToolOutput={onAddToolOutput}
                onAddToolApprovalResponse={onAddToolApprovalResponse}
                onRetryTool={onRetryTool}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating "Jump to Latest" Affordance Button */}
      <AnimatePresence>
        {!isAtBottom && (
          <motion.button
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-5 right-6 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-xl shadow-purple-950/80 border border-purple-400/40 backdrop-blur-md transition-all hover:scale-105"
          >
            <span>Jump to latest</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
