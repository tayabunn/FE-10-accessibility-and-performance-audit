'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Save,
  ArrowLeft,
  Zap,
  CheckCircle2,
  XCircle,
  Shuffle,
  Info,
  Keyboard,
  Eye,
  Timer,
  Gauge,
} from 'lucide-react';
import Link from 'next/link';
import { AsyncActionButton } from '@/components/ui/async-action-button';
import { fakeAsyncAction, type ForceMode } from '@/lib/fake-async';

export default function ButtonsDemoPage() {
  const [primaryMode, setPrimaryMode] = useState<ForceMode>('random');
  const [secondaryMode, setSecondaryMode] = useState<ForceMode>('random');
  const [actionLog, setActionLog] = useState<
    Array<{ time: string; button: string; result: string }>
  >([]);

  const logRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((button: string, result: string) => {
    const time = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setActionLog((prev) => [{ time, button, result }, ...prev].slice(0, 20));
  }, []);

  const handlePrimaryAction = useCallback(async () => {
    addLog('Generate SEO Content', 'loading…');
    try {
      await fakeAsyncAction(primaryMode);
      addLog('Generate SEO Content', '✓ success');
    } catch (err) {
      addLog('Generate SEO Content', '✗ error');
      throw err; // re-throw so the button catches it
    }
  }, [primaryMode, addLog]);

  const handleSecondaryAction = useCallback(async () => {
    addLog('Save Draft', 'loading…');
    try {
      await fakeAsyncAction(secondaryMode);
      addLog('Save Draft', '✓ success');
    } catch (err) {
      addLog('Save Draft', '✗ error');
      throw err;
    }
  }, [secondaryMode, addLog]);

  return (
    <div className="min-h-dvh bg-[#06050c] text-slate-100 overflow-y-auto custom-scrollbar">
      {/* Background orbs */}
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-purple-600/15 via-indigo-600/8 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[400px] bg-gradient-to-t from-violet-600/10 via-purple-900/5 to-transparent blur-[100px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ─── Header ─── */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Astrine AI
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-300 via-violet-300 to-indigo-300 bg-clip-text text-transparent mb-2">
              Buttons with a Brain
            </h1>
            <p className="text-purple-300/70 text-sm max-w-xl">
              FE-09 — Stateful <code className="text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded text-xs font-mono">AsyncActionButton</code> system.
              Every state change is a transition, not a snap. Keyboard accessible, interruptible, and motion-conscious.
            </p>
          </motion.div>
        </div>

        {/* ─── Main Demo Area ─── */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* ─── Primary Button Card ─── */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border border-purple-800/50 bg-[#0b0818]/80 backdrop-blur-xl p-6 space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-bold text-slate-100">
                  AI Content Generation
                </h2>
              </div>
              <p className="text-xs text-purple-300/60 ml-9">
                Primary variant — gradient background, prominent CTA
              </p>
            </div>

            {/* Context card */}
            <div className="rounded-xl border border-purple-900/40 bg-[#080614]/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-purple-400 font-mono">
                <Zap className="w-3.5 h-3.5" />
                <span>SEO Content Module</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate optimized meta descriptions, title tags, and keyword-rich content for your pages using Astrine AI.
              </p>
              <div className="pt-2">
                <AsyncActionButton
                  id="btn-generate-seo"
                  idleLabel="Generate SEO Content"
                  idleIcon={<Sparkles className="w-4 h-4" />}
                  loadingLabel="Generating…"
                  successLabel="Content Generated"
                  errorLabel="Retry Generation"
                  onAction={handlePrimaryAction}
                  variant="primary"
                />
              </div>
            </div>

            {/* Mode selector */}
            <ModeSelector
              label="Primary button mode"
              mode={primaryMode}
              onChange={setPrimaryMode}
            />
          </motion.section>

          {/* ─── Secondary Button Card ─── */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl border border-purple-800/50 bg-[#0b0818]/80 backdrop-blur-xl p-6 space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-700/50 flex items-center justify-center">
                  <Save className="w-4 h-4 text-purple-400" />
                </div>
                <h2 className="text-base font-bold text-slate-100">
                  Save Draft
                </h2>
              </div>
              <p className="text-xs text-purple-300/60 ml-9">
                Secondary variant — subtle style, same motion language
              </p>
            </div>

            {/* Context card */}
            <div className="rounded-xl border border-purple-900/40 bg-[#080614]/60 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs text-purple-400 font-mono">
                <Save className="w-3.5 h-3.5" />
                <span>Draft Persistence</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Persist your current content draft to the server. Auto-saves happen periodically, but you can force-save at any time.
              </p>
              <div className="pt-2">
                <AsyncActionButton
                  id="btn-save-draft"
                  idleLabel="Save Draft"
                  idleIcon={<Save className="w-4 h-4" />}
                  loadingLabel="Saving…"
                  successLabel="Draft Saved"
                  errorLabel="Retry Save"
                  onAction={handleSecondaryAction}
                  variant="secondary"
                />
              </div>
            </div>

            {/* Mode selector */}
            <ModeSelector
              label="Secondary button mode"
              mode={secondaryMode}
              onChange={setSecondaryMode}
            />
          </motion.section>
        </div>

        {/* ─── Action Log ─── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 rounded-2xl border border-purple-800/50 bg-[#0b0818]/80 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-slate-100">
                Action Log
              </h2>
              <span className="text-[10px] font-mono text-purple-400/60 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
                Last {Math.min(actionLog.length, 20)} events
              </span>
            </div>
            {actionLog.length > 0 && (
              <button
                onClick={() => setActionLog([])}
                className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors font-mono"
              >
                Clear
              </button>
            )}
          </div>

          <div
            ref={logRef}
            className="max-h-40 overflow-y-auto custom-scrollbar space-y-1"
          >
            {actionLog.length === 0 ? (
              <p className="text-xs text-purple-400/40 text-center py-6 font-mono">
                Click a button to see state transitions logged here…
              </p>
            ) : (
              actionLog.map((entry, i) => (
                <div
                  key={`${entry.time}-${i}`}
                  className="flex items-center gap-3 text-[11px] font-mono py-1 px-2 rounded-lg hover:bg-purple-950/30 transition-colors"
                >
                  <span className="text-purple-500/60 w-16 flex-shrink-0">
                    {entry.time}
                  </span>
                  <span className="text-slate-400 flex-shrink-0 w-40 truncate">
                    {entry.button}
                  </span>
                  <span
                    className={
                      entry.result.includes('success')
                        ? 'text-emerald-400'
                        : entry.result.includes('error')
                          ? 'text-rose-400'
                          : 'text-purple-300'
                    }
                  >
                    {entry.result}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.section>

        {/* ─── Feature Checklist ─── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-8 rounded-2xl border border-purple-800/50 bg-[#0b0818]/80 backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Implementation Checklist
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {[
              { label: '6 states: idle, hover, focus, loading, success, error', done: true },
              { label: 'Disabled state (bonus)', done: true },
              { label: 'Every state change is a transition', done: true },
              { label: 'Compositor-friendly (transform + opacity)', done: true },
              { label: 'Interruptible: spam-click safe', done: true },
              { label: 'Keyboard accessible + visible focus ring', done: true },
              { label: 'prefers-reduced-motion honored', done: true },
              { label: 'Screen reader announcements (aria-live)', done: true },
              { label: 'Fake async: random delay + 20% failure', done: true },
              { label: 'Force Success / Force Error triggers', done: true },
              { label: 'Second button proving reusable system', done: true },
              { label: 'Motion rationale documented', done: true },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-2 text-xs py-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ─── Motion Rationale ─── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-8 rounded-2xl border border-purple-800/50 bg-[#0b0818]/80 backdrop-blur-xl p-6 space-y-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <Info className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-slate-100">
              Motion Rationale
            </h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            All durations and easings were chosen deliberately to match the perceived urgency of each interaction:
          </p>

          {/* Timing table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-800/40">
                  <th className="py-2 pr-4 text-purple-300/80 font-semibold">Interaction</th>
                  <th className="py-2 pr-4 text-purple-300/80 font-semibold text-right">Duration</th>
                  <th className="py-2 pr-4 text-purple-300/80 font-semibold">Easing</th>
                  <th className="py-2 text-purple-300/80 font-semibold">Why</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                {[
                  ['Hover / Focus', '150ms', 'ease-out', 'Immediate feedback — below the 200ms perception threshold'],
                  ['Press (scale)', '100ms', 'ease-out', 'Feels snappy and tactile, like a physical button'],
                  ['Label exit', '180ms', 'ease-in', 'Content accelerates out of view quickly, avoiding delay'],
                  ['New content enter', '200ms', 'ease-out', 'Decelerates into place for smooth visual continuity'],
                  ['Success enter', '250ms', 'spring (400/25)', 'Gentle emphasis without excessive bounce'],
                  ['Error shake', '300ms', 'keyframes', 'Single sharp oscillation — noticeable, not distracting'],
                  ['Success hold', '1200ms', '—', 'Long enough to consciously register "it worked"'],
                  ['Reset to idle', '200ms', 'ease-out', 'Quick, unobtrusive return to default state'],
                ].map(([interaction, duration, easing, why]) => (
                  <tr
                    key={interaction}
                    className="border-b border-purple-900/20"
                  >
                    <td className="py-2 pr-4 font-mono text-purple-300/80">{interaction}</td>
                    <td className="py-2 pr-4 text-right font-mono text-slate-300">{duration}</td>
                    <td className="py-2 pr-4 font-mono text-purple-400/60">{easing}</td>
                    <td className="py-2 text-slate-400">{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Design principles */}
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-xl border border-purple-900/40 bg-[#080614]/60 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-slate-200">Compositor-Friendly</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All animations use <code className="text-purple-400 text-[10px]">transform</code> and <code className="text-purple-400 text-[10px]">opacity</code> — properties handled by the GPU compositor. No layout thrashing from width/height animations.
              </p>
            </div>

            <div className="rounded-xl border border-purple-900/40 bg-[#080614]/60 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-slate-200">Fully Accessible</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Native <code className="text-purple-400 text-[10px]">&lt;button&gt;</code> with <code className="text-purple-400 text-[10px]">:focus-visible</code> ring, <code className="text-purple-400 text-[10px]">aria-busy</code>, and <code className="text-purple-400 text-[10px]">aria-live</code> status region. Tab/Enter/Space all work.
              </p>
            </div>

            <div className="rounded-xl border border-purple-900/40 bg-[#080614]/60 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-slate-200">Reduced Motion</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Under <code className="text-purple-400 text-[10px]">prefers-reduced-motion</code>, transforms are removed and opacity fades shortened. Color, icon, and text feedback are always preserved.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <div className="mt-8 pb-8 text-center text-[10px] text-slate-500 font-mono">
          Astrine AI • FE-09 Buttons with a Brain • AsyncActionButton System
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Mode Selector Sub-component ─────────────── */

function ModeSelector({
  label,
  mode,
  onChange,
}: {
  label: string;
  mode: ForceMode;
  onChange: (mode: ForceMode) => void;
}) {
  const modes: Array<{ value: ForceMode; label: string; icon: React.ReactNode; color: string }> = [
    {
      value: 'random',
      label: 'Random (80/20)',
      icon: <Shuffle className="w-3.5 h-3.5" />,
      color: 'text-purple-300 border-purple-700/50 bg-purple-950/40',
    },
    {
      value: 'success',
      label: 'Force Success',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      color: 'text-emerald-300 border-emerald-700/50 bg-emerald-950/40',
    },
    {
      value: 'error',
      label: 'Force Error',
      icon: <XCircle className="w-3.5 h-3.5" />,
      color: 'text-rose-300 border-rose-700/50 bg-rose-950/40',
    },
  ];

  return (
    <fieldset className="space-y-2">
      <legend className="text-[10px] font-mono text-purple-400/60 uppercase tracking-wider">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {modes.map((m) => {
          const isActive = mode === m.value;
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(m.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                isActive
                  ? `${m.color} ring-1 ring-purple-500/30 shadow-sm`
                  : 'text-slate-400 border-purple-900/30 bg-transparent hover:border-purple-700/40 hover:text-slate-300'
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
