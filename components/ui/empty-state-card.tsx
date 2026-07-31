'use client';

import React from 'react';
import { Sparkles, Search, Inbox, ArrowRight, RotateCcw } from 'lucide-react';

interface EmptyStateCardProps {
  type?: 'welcome' | 'no-results' | 'no-history' | 'generic';
  title?: string;
  description?: string;
  onSelectPrompt?: (prompt: string) => void;
  onResetFilter?: () => void;
}

const ONBOARDING_PROMPTS = [
  {
    icon: '📊',
    label: 'Score Sales Lead',
    prompt: 'Score lead for Stripe with employee count 8000 in Fintech industry.',
    badge: 'Try Lead Tool',
  },
  {
    icon: '🌐',
    label: 'Inspect Meta Tags',
    prompt: 'Fetch and analyze Open Graph meta tags and security headers for https://vercel.com.',
    badge: 'Try SEO Inspector',
  },
  {
    icon: '⚡',
    label: 'Interactive Action',
    prompt: 'Export a lead report for Acme Corp and prompt me for explicit confirmation first.',
    badge: 'Try Confirmation',
  },
  {
    icon: '⚠️',
    label: 'Simulate Tool Error',
    prompt: 'Score lead for Acme Corp but force an execution error to inspect output-error state.',
    badge: 'Try Error Flow',
  },
];

export function EmptyStateCard({
  type = 'welcome',
  title,
  description,
  onSelectPrompt,
  onResetFilter,
}: EmptyStateCardProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-purple-950/20 border border-purple-900/40 rounded-2xl font-sans">
        <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-400 mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">{title || 'No Matching History'}</h3>
        <p className="text-xs text-purple-300/70 mt-1 max-w-xs">
          {description || 'No past prompts match your query. Try asking about Stripe lead scoring below!'}
        </p>

        {onResetFilter && (
          <button
            onClick={onResetFilter}
            className="mt-4 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-xs text-purple-200 border border-purple-700/50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search Filter</span>
          </button>
        )}
      </div>
    );
  }

  if (type === 'no-history') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-purple-950/20 border border-purple-900/40 rounded-2xl font-sans space-y-4">
        <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-400">
          <Inbox className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-200">No Past Threads — Start a New Flow!</h3>
          <p className="text-xs text-purple-300/70 mt-1 max-w-xs">
            Your conversation history will appear here. Click any onboarding prompt below to begin:
          </p>
        </div>

        <button
          onClick={() => onSelectPrompt?.('Score lead for Stripe with employee count 8000 in Fintech')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-bold text-white shadow-md hover:scale-105 transition-transform"
        >
          <span>Try asking about Lead Scoring</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-3xl mx-auto px-4 py-8 text-center font-sans">
      {/* Pulse Orb Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 blur-xl opacity-40 animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-700 p-0.5 shadow-2xl">
          <div className="w-full h-full bg-[#0b0818] rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
        {title || 'Astrine AI Workspace — Ready for Stream'}
      </h1>
      <p className="text-sm md:text-base text-purple-300/80 mt-2 max-w-md">
        {description || 'No messages yet — click any click-to-fill onboarding prompt below to trigger generative UI tools and real-time streaming!'}
      </p>

      {/* Quick Onboarding Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-8">
        {ONBOARDING_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt?.(item.prompt)}
            className="group relative p-4 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/40 hover:border-purple-600/60 transition-all text-left flex flex-col justify-between backdrop-blur-md shadow-lg active:scale-[0.98]"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700/40">
                {item.badge}
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                {item.label}
              </h4>
              <p className="text-[11px] text-purple-300/70 mt-1 line-clamp-2 leading-relaxed font-mono">
                "{item.prompt}"
              </p>
            </div>
            <div className="flex items-center justify-end mt-3 text-purple-400 group-hover:text-purple-300 transition-colors text-xs font-semibold">
              <span className="mr-1 text-[11px]">Click to auto-fill</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
