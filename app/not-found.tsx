'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#06050c] flex items-center justify-center p-4 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-purple-950/40 border border-purple-800/60 rounded-2xl p-8 text-center backdrop-blur-xl shadow-2xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-400 mx-auto">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
        </div>
        <span className="text-4xl font-extrabold text-purple-400 font-mono block">404</span>
        <h1 className="text-xl font-bold text-white">Route or Resource Not Found</h1>
        <p className="text-xs text-purple-300/80 leading-relaxed">
          The requested page URL or conversation thread ID does not exist or has been removed.
        </p>

        <div className="pt-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-purple-600/30"
          >
            <Home className="w-4 h-4" />
            <span>Back to Astrine AI Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
