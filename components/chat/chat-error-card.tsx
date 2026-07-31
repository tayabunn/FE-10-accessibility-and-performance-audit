'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, XCircle, ShieldAlert, WifiOff, Loader2, CheckCircle2 } from 'lucide-react';

interface ChatErrorCardProps {
  error: Error | string | null;
  failedPrompt?: string;
  onRetry: () => void;
  onDismiss?: () => void;
}

export function ChatErrorCard({ error, failedPrompt, onRetry, onDismiss }: ChatErrorCardProps) {
  const [retryState, setRetryState] = useState<'idle' | 'retrying' | 'success'>('idle');

  const errorMsg = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred during streaming.';
  const is429 = errorMsg.includes('429') || errorMsg.includes('Rate Limit') || errorMsg.includes('Quota');
  const isNetwork = errorMsg.includes('offline') || errorMsg.includes('Failed to fetch') || errorMsg.includes('Network');
  const is500 = errorMsg.includes('500') || errorMsg.includes('Internal Server Error');

  const handleRetryClick = () => {
    if (retryState !== 'idle') return;
    setRetryState('retrying');
    onRetry();
    setTimeout(() => {
      setRetryState('success');
      setTimeout(() => setRetryState('idle'), 1500);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="my-3 p-4 rounded-2xl bg-purple-950/30 border border-rose-800/40 backdrop-blur-xl text-slate-100 font-sans shadow-xl space-y-3 max-w-xl relative overflow-hidden"
    >
      {/* Calm Ambient Background Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0 shadow-inner">
            {isNetwork ? (
              <WifiOff className="w-5 h-5 animate-pulse" />
            ) : is429 ? (
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            ) : (
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-700/60 font-bold">
                {is429 ? 'HTTP 429 Rate Limit' : is500 ? 'HTTP 500 Route Failure' : isNetwork ? 'Network Offline' : 'Stream Interrupted'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-1">Stream Execution Interrupted</h4>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-rose-400 hover:text-white p-1 rounded-lg transition-colors"
            title="Dismiss error"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Diagnostic Message Box */}
      <div className="p-3 rounded-xl bg-black/40 border border-rose-900/30 font-mono text-xs text-rose-200/90 leading-relaxed break-words relative z-10">
        {errorMsg}
      </div>

      {/* Retry Button State Choreography */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-rose-900/30 relative z-10">
        <span className="text-[11px] text-rose-300/70 font-mono">
          Scope: Retrying only failed message
        </span>

        <motion.button
          whileHover={{ scale: retryState === 'idle' ? 1.02 : 1 }}
          whileTap={{ scale: retryState === 'idle' ? 0.98 : 1 }}
          onClick={handleRetryClick}
          disabled={retryState !== 'idle'}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            retryState === 'retrying'
              ? 'bg-rose-950/80 border border-rose-700/60 text-rose-300 cursor-wait'
              : retryState === 'success'
              ? 'bg-emerald-600 border border-emerald-500 text-white shadow-emerald-950/60'
              : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-950/60 cursor-pointer'
          }`}
          title={failedPrompt ? `Re-send: "${failedPrompt}"` : 'Re-send failed user message'}
        >
          <AnimatePresence mode="wait">
            {retryState === 'retrying' ? (
              <motion.div
                key="retrying"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-300" />
                <span>Retrying Stream...</span>
              </motion.div>
            ) : retryState === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Re-sent Prompt!</span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Last Message</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
