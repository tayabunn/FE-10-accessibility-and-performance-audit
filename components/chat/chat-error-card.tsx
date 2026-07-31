'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, XCircle, ShieldAlert, WifiOff } from 'lucide-react';

interface ChatErrorCardProps {
  error: Error | string | null;
  onRetry: () => void;
  onDismiss?: () => void;
}

export function ChatErrorCard({ error, onRetry, onDismiss }: ChatErrorCardProps) {
  const errorMsg = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred.';
  const is429 = errorMsg.includes('429') || errorMsg.includes('Rate Limit') || errorMsg.includes('Quota');
  const isNetwork = errorMsg.includes('offline') || errorMsg.includes('Failed to fetch') || errorMsg.includes('Network');
  const is500 = errorMsg.includes('500') || errorMsg.includes('Internal Server Error');

  return (
    <div className="my-3 p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 backdrop-blur-xl text-slate-100 font-sans shadow-xl space-y-3 max-w-xl">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
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
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700/60 font-bold">
                {is429 ? 'HTTP 429 Rate Limit' : is500 ? 'HTTP 500 Route Failure' : isNetwork ? 'Network Offline' : 'Stream Exception'}
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

      {/* Diagnostic Message */}
      <div className="p-3 rounded-xl bg-black/40 border border-rose-900/40 font-mono text-xs text-rose-200/90 leading-relaxed break-words">
        {errorMsg}
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-rose-300/70">
          Click retry to re-trigger the stream request.
        </span>

        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-xs font-semibold text-white transition-all shadow-md shadow-rose-950/60"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Stream</span>
        </button>
      </div>
    </div>
  );
}
