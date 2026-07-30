'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AI_PERSONAS, 
  AI_MODELS, 
  AIPersona, 
  AIModelConfig 
} from '@/lib/ai-config';
import { 
  Bot, 
  Trash2, 
  Cpu, 
  ShieldCheck, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  selectedPersona: AIPersona;
  onSelectPersona: (persona: AIPersona) => void;
  selectedModel: AIModelConfig;
  onSelectModel: (model: AIModelConfig) => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  selectedPersona,
  onSelectPersona,
  selectedModel,
  onSelectModel,
  onClearHistory,
  isOpen,
  onClose,
}: SidebarProps) {
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [keyStatus, setKeyStatus] = useState({
    hasAnthropicKey: false,
    hasOpenAIKey: false,
    hasOpenRouterKey: false,
    hasGoogleKey: false,
  });

  useEffect(() => {
    fetch('/api/key-status')
      .then((res) => res.json())
      .then((data) => setKeyStatus(data))
      .catch(() => {});
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          />

          {/* Sidebar Drawer Container */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed lg:static top-0 left-0 z-50 h-full w-80 bg-[#080614] border-r border-purple-900/30 flex flex-col justify-between p-5 text-slate-200 overflow-y-auto custom-scrollbar shadow-2xl"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="font-bold text-slate-100 text-base leading-tight">
                      Astrine AI
                    </h1>
                    <p className="text-[11px] text-purple-400 font-mono">Streaming Precision</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-purple-950/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Persona Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300/80 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Personas & System Prompt</span>
                </div>

                <div className="space-y-2">
                  {AI_PERSONAS.map((p) => {
                    const isSelected = p.id === selectedPersona.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => onSelectPersona(p)}
                        className={`w-full p-3 rounded-xl text-left border transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-purple-950/50 border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.2)] text-white'
                            : 'bg-[#0b0818]/60 border-purple-900/30 hover:border-purple-800/50 text-slate-300'
                        }`}
                      >
                        <span className="text-xl p-1 bg-purple-950/80 rounded-lg border border-purple-800/40">
                          {p.avatar}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{p.name}</span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {p.role}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* System Prompt Inspector */}
              <div className="rounded-xl border border-purple-900/30 bg-[#0a0818]/80 p-3 space-y-2 text-xs">
                <button
                  onClick={() => setShowPromptDetails(!showPromptDetails)}
                  className="flex items-center justify-between w-full text-slate-300 hover:text-purple-300 font-medium"
                >
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                    <span>System Prompt Module</span>
                  </span>
                  {showPromptDetails ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {showPromptDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 border-t border-purple-900/30 text-[11px] text-slate-400 font-mono space-y-2 leading-relaxed"
                  >
                    <p className="whitespace-pre-wrap rounded p-2 bg-[#060410] text-slate-300 border border-purple-900/40">
                      {selectedPersona.systemPrompt}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Model Switcher */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300/80 uppercase tracking-wider">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Model Engine Config</span>
                </div>

                <div className="space-y-2">
                  {AI_MODELS.map((m) => {
                    const isSelected = m.id === selectedModel.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => onSelectModel(m)}
                        className={`w-full p-2.5 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-950/50 border-indigo-500/70 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                            : 'bg-[#0b0818]/60 border-purple-900/30 hover:border-purple-800/50 text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="font-semibold block">{m.name}</span>
                          <span className="text-[10px] text-slate-400">{m.description}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/50 font-mono">
                          {m.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Server Key Status */}
              <div className="rounded-xl border border-purple-900/30 bg-[#0a0818]/80 p-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Server API Key Protection</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center justify-between">
                    <span>Anthropic Key:</span>
                    <span className={keyStatus.hasAnthropicKey ? 'text-emerald-400' : 'text-slate-500'}>
                      {keyStatus.hasAnthropicKey ? 'Active' : 'Offline (Simulated)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>OpenAI Key:</span>
                    <span className={keyStatus.hasOpenAIKey ? 'text-emerald-400' : 'text-slate-500'}>
                      {keyStatus.hasOpenAIKey ? 'Active' : 'Offline (Simulated)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear History & Footer */}
            <div className="pt-4 border-t border-purple-900/30 space-y-3">
              <button
                onClick={onClearHistory}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-950/30 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-purple-900/40 hover:border-rose-800/60 text-xs font-semibold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Conversation</span>
              </button>

              <div className="text-center text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
                <span>Astrine AI</span>
                <span>•</span>
                <a
                  href="https://sdk.vercel.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline flex items-center gap-0.5"
                >
                  Vercel AI SDK <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
