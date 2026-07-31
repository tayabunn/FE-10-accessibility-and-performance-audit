'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Route Error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full bg-[#06050c] flex items-center justify-center p-4 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-purple-950/40 border border-purple-800/60 rounded-2xl p-6 text-center backdrop-blur-xl shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <AlertOctagon className="w-6 h-6 animate-bounce" />
        </div>
        <h2 className="text-xl font-bold text-white">Route Execution Failed</h2>
        <p className="text-xs text-purple-300/80 leading-relaxed">
          {error.message || 'An unhandled exception interrupted route rendering.'}
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-semibold text-white transition-all shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Segment</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-xs font-semibold text-purple-200 transition-colors border border-purple-700/50"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
