'use client';

import React from 'react';
import { Sparkles, MessageSquare, Search, Inbox, ArrowRight } from 'lucide-react';

interface EmptyStateCardProps {
  type?: 'welcome' | 'no-results' | 'no-history' | 'generic';
  title?: string;
  description?: string;
  onSelectPrompt?: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  {
    icon: '📊',
    label: 'Lead Scoring',
    prompt: 'Evaluate B2B sales lead for Stripe in the Fintech industry with 500 employees.',
    badge: 'Tool Execution',
  },
  {
    icon: '🌐',
    label: 'SEO Inspector',
    prompt: 'Scrape and inspect Open Graph meta tags and security headers for https://stripe.com.',
    badge: 'Web Scraper',
  },
  {
    icon: '⚡',
    label: 'Interactive Action',
    prompt: 'Export a lead report for Acme Corp and request my confirmation first.',
    badge: 'Confirmation Flow',
  },
  {
    icon: '⚠️',
    label: 'Error Testing',
    prompt: 'Score lead for Acme Corp but force a tool execution error to test fallback.',
    badge: 'Error Simulation',
  },
];

export function EmptyStateCard({
  type = 'welcome',
  title,
  description,
  onSelectPrompt,
}: EmptyStateCardProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-purple-950/20 border border-purple-900/40 rounded-2xl">
        <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-400 mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">{title || 'No Matching Results'}</h3>
        <p className="text-xs text-purple-300/70 mt-1 max-w-xs">
          {description || 'Try refining your search terms or filters.'}
        </p>
      </div>
    );
  }

  if (type === 'no-history') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-purple-950/20 border border-purple-900/40 rounded-2xl">
        <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-400 mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">{title || 'No Conversation History'}</h3>
        <p className="text-xs text-purple-300/70 mt-1 max-w-xs">
          {description || 'Your past conversation threads will appear here.'}
        </p>
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
        {title || 'Astrine AI Workspace'}
      </h1>
      <p className="text-sm md:text-base text-purple-300/80 mt-2 max-w-md">
        {description || 'Select a sample action below or type a custom prompt to trigger generative UI tools and streaming responses.'}
      </p>

      {/* Quick Starter Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-8">
        {STARTER_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt?.(item.prompt)}
            className="group relative p-4 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/40 hover:border-purple-600/60 transition-all text-left flex flex-col justify-between backdrop-blur-md shadow-lg"
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
              <p className="text-[11px] text-purple-300/70 mt-1 line-clamp-2 leading-relaxed">
                {item.prompt}
              </p>
            </div>
            <div className="flex items-center justify-end mt-3 text-purple-400 group-hover:text-purple-300 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
