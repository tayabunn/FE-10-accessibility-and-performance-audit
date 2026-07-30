'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/hooks/use-chat-stream';
import { MessageItem } from './message-item';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { AIPersona } from '@/lib/ai-config';
import { ArrowDown, Sparkles } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  persona: AIPersona;
  status: string;
  onRegenerate: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export function MessageList({
  messages,
  persona,
  status,
  onRegenerate,
  onSelectPrompt,
}: MessageListProps) {
  const lastMessageContent = messages[messages.length - 1]?.content || '';
  const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll<HTMLDivElement>({
    threshold: 60,
    contentDependency: [messages.length, lastMessageContent, status],
  });

  return (
    <div className="relative flex-1 min-h-0 w-full overflow-hidden">
      {/* Scrollable Container */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto px-4 md:px-8 py-6 space-y-5 scroll-smooth custom-scrollbar"
      >
        {messages.length === 0 ? (
          /* Centered Astrine AI Neon-Purple Hero Section */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-[48vh] text-center max-w-2xl mx-auto space-y-5"
          >
            {/* Top Pill Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-700/50 text-purple-300 text-xs font-semibold shadow-lg shadow-purple-950/40">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Next-Gen Streaming Intelligence</span>
            </div>

            <div className="text-center space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-100 to-indigo-300 bg-clip-text text-transparent drop-shadow-md tracking-tight">
                Astrine AI
              </h1>
              <p className="text-sm md:text-base text-purple-200/80 max-w-md mx-auto leading-relaxed font-normal">
                Simplify your AI interactions with streaming precision — select a prompt or type below to begin.
              </p>
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
