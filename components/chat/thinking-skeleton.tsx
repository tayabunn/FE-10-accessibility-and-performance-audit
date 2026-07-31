'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain } from 'lucide-react';

interface ThinkingSkeletonProps {
  personaName?: string;
  avatar?: string;
}

export function ThinkingSkeleton({ personaName = 'Astrine AI', avatar = '⚡' }: ThinkingSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3 max-w-3xl my-4 font-sans"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-sm shadow-md flex-shrink-0">
        {avatar}
      </div>

      {/* Skeleton Card */}
      <div className="flex-1 p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 backdrop-blur-md space-y-3 shadow-lg">
        {/* Top Header indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">{personaName} is thinking...</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/40 animate-pulse">
            pending-stream
          </span>
        </div>

        {/* Shimmer loading bars */}
        <div className="space-y-2">
          <div className="h-3.5 w-3/4 rounded-md bg-purple-900/40 animate-pulse" />
          <div className="h-3.5 w-1/2 rounded-md bg-purple-900/30 animate-pulse" />
          <div className="h-3.5 w-5/6 rounded-md bg-purple-900/20 animate-pulse" />
        </div>

        {/* Footnote status */}
        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-purple-400/70 font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Synthesizing multi-step reasoning & tool contracts...</span>
        </div>
      </div>
    </motion.div>
  );
}
