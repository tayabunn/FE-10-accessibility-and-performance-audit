'use client';

import React, { useState } from 'react';
import { HelpCircle, Code, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface UnknownToolCardProps {
  toolName: string;
  args?: Record<string, unknown>;
  result?: unknown;
  state: string;
}

export function UnknownToolCard({
  toolName,
  args,
  result,
  state,
}: UnknownToolCardProps) {
  const [showRaw, setShowRaw] = useState<boolean>(false);

  return (
    <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 backdrop-blur-xl text-slate-100 font-sans shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Unregistered Tool:</span>
              <code className="font-mono text-purple-300 font-normal">{toolName}</code>
            </h4>
            <span className="text-[10px] text-purple-300/70">
              Generic fallback parser active for unknown tool part payload
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-700/50 text-purple-300 uppercase">
          {state}
        </span>
      </div>

      {/* Action Toggle */}
      <div className="flex items-center justify-between pt-1 border-t border-purple-900/30">
        <button
          onClick={() => setShowRaw((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-white font-mono transition-colors"
        >
          <Code className="w-3.5 h-3.5" />
          <span>{showRaw ? 'Hide Raw Payload' : 'Inspect Raw Tool Payload'}</span>
          {showRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded JSON payload */}
      {showRaw && (
        <div className="p-3 rounded-xl bg-slate-950/90 border border-purple-900/50 font-mono text-[11px] text-purple-200 overflow-x-auto max-h-48 space-y-2">
          {args && (
            <div>
              <span className="text-purple-400 font-bold block mb-1">Arguments:</span>
              <pre>{JSON.stringify(args, null, 2)}</pre>
            </div>
          )}
          {result !== undefined && (
            <div className="pt-2 border-t border-purple-900/40">
              <span className="text-emerald-400 font-bold block mb-1">Result:</span>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
