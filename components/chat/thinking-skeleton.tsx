'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain } from 'lucide-react';

interface ThinkingSkeletonProps {
  personaName?: string;
  avatar?: string;
}

export function ThinkingSkeleton({ personaName = 'FE Capstone Mentor', avatar = '⚡' }: ThinkingSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="group relative flex gap-3 md:gap-4 p-4 md:p-5 rounded-2xl bg-[#0a0818]/80 border border-purple-900/40 w-full text-slate-200 shadow-xl backdrop-blur-md font-sans my-4"
    >
      {/* Avatar matching MessageItem dimensions */}
      <div className="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-500/20">
        <span className="text-base leading-none">{avatar}</span>
      </div>

      {/* Skeleton Content Container matching MessageItem layout & line heights */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header line matching MessageItem */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">{personaName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 font-mono animate-pulse">
              thinking...
            </span>
          </div>
          <span className="text-[11px] text-purple-400/60 font-mono animate-pulse">
            0.4s elapsed
          </span>
        </div>

        {/* Status indicator bar */}
        <div className="flex items-center gap-2.5 py-1 px-3 rounded-lg bg-purple-950/50 border border-purple-800/40 text-xs text-purple-300 w-fit">
          <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span className="font-medium tracking-wide">Synthesizing response & tools...</span>
        </div>

        {/* Text lines matching paragraphs within 2px precision to eliminate Cumulative Layout Shift (CLS) */}
        <div className="space-y-2 pt-1">
          <div className="h-4 w-5/6 rounded-md bg-purple-900/40 animate-pulse" />
          <div className="h-4 w-3/4 rounded-md bg-purple-900/30 animate-pulse" />
          <div className="h-4 w-1/2 rounded-md bg-purple-900/20 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
