'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertOctagon, 
  RotateCcw, 
  Terminal, 
  ShieldAlert, 
  ChevronRight, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface ToolErrorCardProps {
  toolName: string;
  errorMessage: string;
  args?: Record<string, unknown>;
  onRetry?: () => void;
}

export function ToolErrorCard({ toolName, errorMessage, args, onRetry }: ToolErrorCardProps) {
  const [copied, setCopied] = useState(false);
  const [showStack, setShowStack] = useState(false);

  const handleCopyError = () => {
    navigator.clipboard.writeText(`[${toolName} Error]: ${errorMessage}\nArgs: ${JSON.stringify(args || {})}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full rounded-2xl bg-gradient-to-b from-rose-950/40 via-rose-950/20 to-slate-950/80 border border-rose-800/50 p-5 shadow-2xl backdrop-blur-xl space-y-4 text-slate-100 relative overflow-hidden"
    >
      {/* Red ambient glow background orb */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

      {/* Error Header */}
      <div className="flex items-start justify-between gap-3 border-b border-rose-900/40 pb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-700/60 flex items-center justify-center text-rose-400 shadow-md flex-shrink-0">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm md:text-base text-rose-200">Tool Execution Failed</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 border border-rose-700/60 font-mono text-rose-300">
                {toolName}()
              </span>
            </div>
            <p className="text-xs text-rose-300/80">The system caught a managed execution error without crashing the chat.</p>
          </div>
        </div>

        <button
          onClick={handleCopyError}
          className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 transition-colors border border-rose-800/50 text-xs flex items-center gap-1"
          title="Copy error details"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Formatted Error Details Box */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-rose-900/50 font-mono text-xs text-rose-300 space-y-2 relative z-10">
        <div className="flex items-center justify-between text-[11px] text-rose-400/80 border-b border-rose-900/40 pb-1.5">
          <span className="flex items-center gap-1.5 font-bold">
            <Terminal className="w-3.5 h-3.5" />
            Exception Details
          </span>
          <span className="text-[10px] uppercase tracking-wider bg-rose-950 px-1.5 py-0.5 rounded text-rose-400 border border-rose-800">
            State: output-error
          </span>
        </div>

        <p className="leading-relaxed font-semibold text-rose-200 whitespace-pre-wrap">
          {errorMessage}
        </p>

        {args && Object.keys(args).length > 0 && (
          <div className="pt-2 border-t border-rose-900/30 text-[11px]">
            <span className="text-slate-500 block mb-0.5 font-sans">Target Input Payload:</span>
            <pre className="p-2 rounded bg-slate-900/80 text-purple-200 overflow-x-auto text-[11px]">
              {JSON.stringify(args, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Suggested Fixes / Troubleshooting Tips */}
      <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-xs text-slate-300 space-y-1.5 relative z-10">
        <h4 className="font-bold text-rose-300 text-[11px] uppercase tracking-wider flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
          Troubleshooting Guidance
        </h4>
        <ul className="space-y-1 text-slate-300 pl-1">
          <li className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-rose-400 flex-shrink-0" />
            <span>Verify network connectivity or API key permissions for external providers.</span>
          </li>
          <li className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-rose-400 flex-shrink-0" />
            <span>Ensure parameters passed to <code className="font-mono text-purple-300">{toolName}</code> fulfill the Zod contract constraints.</span>
          </li>
        </ul>
      </div>

      {/* Footer Action Bar */}
      <div className="flex items-center justify-between pt-1 relative z-10">
        <div className="flex items-center gap-1.5 text-xs text-rose-400/80">
          <ShieldAlert className="w-4 h-4" />
          <span>Graceful Failure Recovery Active</span>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800/80 border border-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Tool Execution</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
