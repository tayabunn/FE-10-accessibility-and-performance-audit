'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ShieldAlert, WifiOff, Clock, Bug, RefreshCw, X, ChevronRight, CheckSquare, Sparkles } from 'lucide-react';

interface SabotagePanelProps {
  onTriggerSabotage: (sabotageType: string, promptText: string) => void;
  onClearHistory?: () => void;
}

const SABOTAGE_CHECKLIST = [
  {
    step: '1',
    id: 'network_offline',
    title: '1. Kill Network Before Send',
    type: 'network_offline',
    prompt: '[sabotage:offline] Trigger simulated network disconnect before send.',
    icon: WifiOff,
    color: 'text-amber-400',
    badge: 'Pre-Send Disconnect',
    desc: 'Simulates network loss before request dispatch. Triggers OfflineBanner.',
  },
  {
    step: '2',
    id: 'mid_stream',
    title: '2. Kill Mid-Stream',
    type: 'mid_stream',
    prompt: '[sabotage:mid_stream] Abort stream transmission midway after 1 token.',
    icon: Flame,
    color: 'text-rose-400',
    badge: 'Mid-Stream Abort',
    desc: 'Abruptly cuts connection mid-stream. Renders ChatErrorCard with single-message retry.',
  },
  {
    step: '3',
    id: 'rate_limit',
    title: '3. Return a 429 Rate Limit',
    type: 'rate_limit',
    prompt: '[sabotage:429] Simulate an HTTP 429 quota exhaustion rate limit.',
    icon: ShieldAlert,
    color: 'text-violet-400',
    badge: 'HTTP 429',
    desc: 'Returns HTTP 429 response. Renders RateLimitCard with countdown timer backoff.',
  },
  {
    step: '4',
    id: 'malformed_json',
    title: '4. Malformed JSON from Tool',
    type: 'unknown_tool',
    prompt: 'Execute tool unknownCustomTool with arguments {"malformedJson": "{corrupted: true"}.',
    icon: Bug,
    color: 'text-emerald-400',
    badge: 'Malformed Payload',
    desc: 'Emits corrupted/unregistered tool payload. Renders UnknownToolCard JSON raw inspector.',
  },
  {
    step: '5',
    id: 'first_run_empty',
    title: '5. First-Run Empty State',
    type: 'clear_history',
    prompt: '',
    icon: Sparkles,
    color: 'text-cyan-400',
    badge: 'Onboarding State',
    desc: 'Resets history to reveal designed onboarding empty state with click-to-fill prompts.',
  },
];

export function SabotagePanel({ onTriggerSabotage, onClearHistory }: SabotagePanelProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-40 px-3.5 py-2 rounded-xl bg-purple-950/90 border border-purple-600/60 hover:border-purple-400 text-purple-200 hover:text-white shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs font-mono font-bold transition-all group hover:scale-105"
        title="Open Mentor Sabotage Checklist (Reviewer Script)"
      >
        <Flame className="w-4 h-4 text-rose-400 animate-pulse group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Sabotage Script Checklist</span>
        <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] border border-rose-800">
          Dev Script
        </span>
      </button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-4 font-sans">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="w-full max-w-md bg-[#0b0818] border border-purple-800/80 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Mentor Reviewer Script</h3>
                    <span className="text-[10px] text-purple-300/70 font-mono">
                      Sequential 5-Step Failure Checklist
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-purple-400 hover:text-white hover:bg-purple-900/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-purple-300/80 leading-relaxed">
                Reviewers follow this exact script. Click each step below in order to sabotage the app and verify resilience:
              </p>

              {/* Sabotage Test Cards */}
              <div className="space-y-2.5">
                {SABOTAGE_CHECKLIST.map((test) => {
                  const Icon = test.icon;
                  return (
                    <button
                      key={test.id}
                      onClick={() => {
                        if (test.type === 'clear_history') {
                          onClearHistory?.();
                        } else {
                          onTriggerSabotage(test.type, test.prompt);
                        }
                        setIsOpen(false);
                      }}
                      className="w-full p-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 hover:border-purple-600/60 transition-all text-left flex items-start justify-between group shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-purple-900/60 ${test.color} flex-shrink-0 mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                              {test.title}
                            </h4>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-300 border border-purple-700/50">
                              {test.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-purple-300/70 mt-1">{test.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform flex-shrink-0 mt-2" />
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-xs font-semibold text-purple-300 transition-colors border border-purple-700/40"
                >
                  Close Script Checklist
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
