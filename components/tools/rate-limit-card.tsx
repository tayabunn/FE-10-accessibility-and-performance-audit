'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, Key, RefreshCw, AlertCircle } from 'lucide-react';

interface RateLimitCardProps {
  resetSeconds?: number;
  limit?: number;
  remaining?: number;
  provider?: string;
  onRetry?: () => void;
}

export function RateLimitCard({
  resetSeconds = 45,
  limit = 60,
  remaining = 0,
  provider = 'Anthropic Claude 3.5 Sonnet',
  onRetry,
}: RateLimitCardProps) {
  const [timeLeft, setTimeLeft] = useState<number>(resetSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="my-3 p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 backdrop-blur-xl text-slate-100 font-sans shadow-xl max-w-lg space-y-4">
      {/* Top Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/60">
              HTTP 429 Rate Limit
            </span>
            <span className="text-xs text-amber-400/80 font-mono">{provider}</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">API Quota Threshold Exceeded</h3>
        </div>
      </div>

      <p className="text-xs text-amber-200/80 leading-relaxed">
        The request frequency exceeds the maximum allowed throughput ({limit} requests/min). Automatic backoff is active to prevent provider throttling.
      </p>

      {/* Countdown Visualizer */}
      <div className="p-3 rounded-xl bg-amber-900/20 border border-amber-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-amber-300 font-mono">
          <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Reset Window:</span>
        </div>
        <div className="text-sm font-bold font-mono text-amber-300">
          {timeLeft > 0 ? `${timeLeft}s remaining` : 'Ready to retry'}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
        <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-900/40">
          <span className="text-[10px] text-amber-400/70 block">Quota Capacity</span>
          <span className="text-amber-200 font-bold">{remaining} / {limit} req</span>
        </div>
        <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-900/40">
          <span className="text-[10px] text-amber-400/70 block">Status Code</span>
          <span className="text-amber-200 font-bold">429 Too Many Requests</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/80">
          <Key className="w-3.5 h-3.5" />
          <span>Use custom key in Settings</span>
        </div>

        <button
          onClick={onRetry}
          disabled={timeLeft > 0}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            timeLeft > 0
              ? 'bg-amber-950/40 border-amber-900/40 text-amber-600 cursor-not-allowed'
              : 'bg-amber-600 hover:bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-600/30'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${timeLeft === 0 ? 'animate-spin' : ''}`} />
          <span>{timeLeft > 0 ? 'Backoff Active' : 'Retry Request'}</span>
        </button>
      </div>
    </div>
  );
}
