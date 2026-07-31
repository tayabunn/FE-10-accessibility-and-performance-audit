'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeadScoreCard } from './lead-score-card';
import { MetaTagsCard } from './meta-tags-card';
import { ConfirmationCard } from './confirmation-card';
import { ToolErrorCard } from './tool-error-card';
import { ScoreLeadInput, LeadScoreResult, MetaTagsResult, ConfirmActionInput, ConfirmActionResult } from '@/lib/tools';
import { 
  Wrench, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Code, 
  AlertTriangle,
  Play
} from 'lucide-react';

export type ToolState = 'input-streaming' | 'input-available' | 'output-available' | 'output-error';

export interface ToolPartData {
  toolCallId: string;
  toolName: string;
  args?: Record<string, unknown>;
  state: ToolState;
  result?: unknown;
  error?: string;
}

interface ToolPartRendererProps {
  toolPart: ToolPartData;
  onConfirmAction?: (input: ConfirmActionInput) => Promise<void>;
  onRetryTool?: (toolName: string, args?: Record<string, unknown>) => void;
}

export function ToolPartRenderer({ toolPart, onConfirmAction, onRetryTool }: ToolPartRendererProps) {
  const { toolName, args, state, result, error } = toolPart;

  return (
    <div className="w-full my-3">
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* STATE 1: INPUT-STREAMING */}
        {/* ========================================================================= */}
        {state === 'input-streaming' && (
          <motion.div
            key="state-input-streaming"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-200 text-xs shadow-lg backdrop-blur-md space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
                  <span className="absolute w-2 h-2 rounded-full bg-purple-400 animate-ping opacity-75" />
                </div>
                <span className="font-bold text-white tracking-wide">
                  Model Invoking Tool: <code className="font-mono text-purple-300">{toolName}</code>
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/80 border border-purple-700/60 font-mono text-purple-300 font-semibold uppercase animate-pulse">
                input-streaming
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-purple-900/40 font-mono text-[11px] text-purple-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 animate-bounce" />
              <span className="truncate">Assembling parameters stream: {JSON.stringify(args || {})}</span>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE 2: INPUT-AVAILABLE */}
        {/* ========================================================================= */}
        {state === 'input-available' && (
          <motion.div
            key="state-input-available"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
            className="w-full"
          >
            {toolName === 'confirmAction' ? (
              <ConfirmationCard
                input={args as unknown as ConfirmActionInput}
                onConfirm={onConfirmAction}
              />
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-800/60 text-slate-200 text-xs shadow-xl backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-900/60 flex items-center justify-center text-purple-300">
                      <Play className="w-3.5 h-3.5 fill-purple-300" />
                    </div>
                    <div>
                      <span className="font-bold text-white">Executing Tool: <code className="font-mono text-purple-300">{toolName}</code></span>
                      <p className="text-[11px] text-slate-400">Parameters validated & sent to backend execute function</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950 border border-purple-700/60 text-purple-300 font-mono text-[10px] font-bold uppercase">
                    <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                    <span>input-available</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-purple-900/40 font-mono text-[11px] text-purple-200 overflow-x-auto">
                  <span className="text-slate-500 block mb-1">Payload Arguments:</span>
                  <pre>{JSON.stringify(args, null, 2)}</pre>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE 3: OUTPUT-AVAILABLE */}
        {/* ========================================================================= */}
        {state === 'output-available' && (
          <motion.div
            key="state-output-available"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            className="w-full"
          >
            {toolName === 'scoreLead' && result ? (
              <LeadScoreCard
                data={result as LeadScoreResult}
                onExecuteAction={(act, target) => {
                  if (onConfirmAction) {
                    onConfirmAction({
                      actionType: act as 'export_lead_report',
                      targetName: target,
                      parameters: { priority: 'high' },
                    });
                  }
                }}
              />
            ) : toolName === 'fetchMetaTags' && result ? (
              <MetaTagsCard data={result as MetaTagsResult} />
            ) : toolName === 'confirmAction' ? (
              <ConfirmationCard
                input={args as unknown as ConfirmActionInput}
                result={result as ConfirmActionResult}
              />
            ) : (
              // Generic fallback component render for other tools
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-900/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-purple-900/30 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-sm text-white">{toolName} Result</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold uppercase border border-emerald-800">
                    output-available
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 font-mono text-xs text-purple-200 overflow-x-auto">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE 4: OUTPUT-ERROR */}
        {/* ========================================================================= */}
        {state === 'output-error' && (
          <motion.div
            key="state-output-error"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="w-full"
          >
            <ToolErrorCard
              toolName={toolName}
              errorMessage={error || 'Unknown execution error occurred during tool call.'}
              args={args}
              onRetry={onRetryTool ? () => onRetryTool(toolName, args) : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
