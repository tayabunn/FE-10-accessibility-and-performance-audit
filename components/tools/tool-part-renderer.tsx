'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeadScoreCard } from './lead-score-card';
import { MetaTagsCard } from './meta-tags-card';
import { ConfirmationCard } from './confirmation-card';
import { ToolErrorCard } from './tool-error-card';
import { WeatherCard } from './weather-card';
import { ScoreLeadInput, LeadScoreResult, MetaTagsResult, ConfirmActionInput, ConfirmActionResult } from '@/lib/tools';
import { 
  Wrench, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  ShieldAlert,
  XCircle,
  MapPin,
  HelpCircle,
  Check
} from 'lucide-react';

export type ToolState = 
  | 'input-streaming' 
  | 'input-available' 
  | 'approval-requested' 
  | 'approval-responded' 
  | 'output-available' 
  | 'output-error' 
  | 'output-denied';

export interface ToolPartData {
  toolCallId: string;
  toolName: string;
  args?: Record<string, unknown>;
  state: ToolState;
  result?: unknown;
  output?: unknown;
  error?: string;
  errorText?: string;
  approval?: {
    id?: string;
    approved?: boolean;
    isAutomatic?: boolean;
    reason?: string;
  };
}

interface ToolPartRendererProps {
  toolPart: ToolPartData;
  onConfirmAction?: (input: ConfirmActionInput) => Promise<void>;
  onAddToolOutput?: (params: { tool: string; toolCallId: string; output?: unknown; state?: 'output-error'; errorText?: string }) => void;
  onAddToolApprovalResponse?: (params: { id?: string; approved: boolean }) => void;
  onRetryTool?: (toolName: string, args?: Record<string, unknown>) => void;
}

export function ToolPartRenderer({
  toolPart,
  onConfirmAction,
  onAddToolOutput,
  onAddToolApprovalResponse,
  onRetryTool,
}: ToolPartRendererProps) {
  const { toolCallId, toolName, args, state, result, output, error, errorText, approval } = toolPart;
  const toolResult = result !== undefined ? result : output;
  const errMessage = error || errorText || 'Tool execution encountered an error.';

  return (
    <div className="w-full my-3">
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* STATE: INPUT-STREAMING */}
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
                  Invoking Tool: <code className="font-mono text-purple-300">{toolName}</code>
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/80 border border-purple-700/60 font-mono text-purple-300 font-semibold uppercase animate-pulse">
                input-streaming
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-purple-900/40 font-mono text-[11px] text-purple-300 flex items-center gap-2 overflow-x-auto">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 animate-bounce" />
              <span className="truncate">Assembling parameters stream: {JSON.stringify(args || {})}</span>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE: APPROVAL-REQUESTED */}
        {/* ========================================================================= */}
        {state === 'approval-requested' && (
          <motion.div
            key="state-approval-requested"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs shadow-xl backdrop-blur-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Tool Approval Requested: <code className="font-mono text-white">{toolName}</code></span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900 text-amber-300 font-mono font-bold uppercase border border-amber-700">
                approval-requested
              </span>
            </div>

            {approval?.isAutomatic ? (
              <p className="text-slate-300 font-mono">Automated security policy evaluating approval for parameters...</p>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-300">
                  The model requested permission to execute <code className="font-mono text-purple-300">{toolName}</code> with the following inputs:
                </p>
                <pre className="p-2 rounded bg-slate-950 border border-amber-900/40 font-mono text-[11px] text-amber-200 overflow-x-auto">
                  {JSON.stringify(args, null, 2)}
                </pre>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (onAddToolApprovalResponse) {
                        onAddToolApprovalResponse({ id: approval?.id, approved: true });
                      }
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Execution</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onAddToolApprovalResponse) {
                        onAddToolApprovalResponse({ id: approval?.id, approved: false });
                      }
                    }}
                    className="px-4 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Deny Execution</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE: APPROVAL-RESPONDED */}
        {/* ========================================================================= */}
        {state === 'approval-responded' && (
          <motion.div
            key="state-approval-responded"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 text-xs text-purple-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Tool request for <code className="font-mono font-bold text-white">{toolName}</code> was {approval?.isAutomatic ? 'automatically' : ''} {approval?.approved ? 'approved' : 'denied'}.
                {approval?.reason ? ` Reason: ${approval.reason}` : ''}
              </span>
            </div>
            <span className="text-[10px] font-mono text-purple-400 uppercase">approval-responded</span>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE: INPUT-AVAILABLE */}
        {/* ========================================================================= */}
        {state === 'input-available' && (
          <motion.div
            key="state-input-available"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
            className="w-full"
          >
            {toolName === 'askForConfirmation' ? (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-800/60 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    Confirmation Required
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono font-bold uppercase border border-purple-800">
                    input-available
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium">
                  {typeof args?.message === 'string' ? args.message : 'Please confirm execution of client action.'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (onAddToolOutput) {
                        onAddToolOutput({
                          tool: 'askForConfirmation',
                          toolCallId,
                          output: 'Yes, confirmed by user.',
                        });
                      }
                    }}
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Yes, Confirm</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onAddToolOutput) {
                        onAddToolOutput({
                          tool: 'askForConfirmation',
                          toolCallId,
                          output: 'No, action denied by user.',
                        });
                      }
                    }}
                    className="px-4 py-1.5 rounded-lg bg-rose-900/70 hover:bg-rose-800 text-rose-200 font-bold text-xs transition-all flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>No, Decline</span>
                  </button>
                </div>
              </div>
            ) : toolName === 'getLocation' ? (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-800/60 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-indigo-400 animate-bounce" />
                  <div>
                    <span className="font-bold text-xs text-white">Client Tool: getLocation</span>
                    <p className="text-[11px] text-slate-400">Fetching geolocation via browser client callback...</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-purple-300 font-mono text-[10px] uppercase font-bold">
                  <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                  <span>input-available</span>
                </div>
              </div>
            ) : toolName === 'confirmAction' ? (
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
        {/* STATE: OUTPUT-AVAILABLE */}
        {/* ========================================================================= */}
        {state === 'output-available' && (
          <motion.div
            key="state-output-available"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
            className="w-full"
          >
            {toolName === 'scoreLead' && toolResult ? (
              <LeadScoreCard
                data={toolResult as LeadScoreResult}
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
            ) : toolName === 'fetchMetaTags' && toolResult ? (
              <MetaTagsCard data={toolResult as MetaTagsResult} />
            ) : toolName === 'getWeatherInformation' && toolResult ? (
              <WeatherCard
                city={((toolResult as Record<string, unknown>).city as string) || (args?.city as string) || 'San Francisco'}
                weather={((toolResult as Record<string, unknown>).weather as string) || 'sunny'}
                temperature={String((toolResult as Record<string, unknown>).temperature ?? '72°F')}
                humidity={String((toolResult as Record<string, unknown>).humidity ?? '48%')}
                windSpeed={String((toolResult as Record<string, unknown>).windSpeed ?? '10 mph')}
                status="success"
              />
            ) : toolName === 'confirmAction' ? (
              <ConfirmationCard
                input={args as unknown as ConfirmActionInput}
                result={toolResult as ConfirmActionResult}
              />
            ) : toolName === 'getLocation' ? (
              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 flex items-center justify-between text-xs text-purple-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Location Result: <strong className="text-white">{String(toolResult)}</strong></span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase">output-available</span>
              </div>
            ) : (
              // Generic card render for other tools or dynamic tools
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
                  <pre>{JSON.stringify(toolResult, null, 2)}</pre>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE: OUTPUT-ERROR */}
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
              errorMessage={errMessage}
              args={args}
              onRetry={onRetryTool ? () => onRetryTool(toolName, args) : undefined}
            />
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE: OUTPUT-DENIED */}
        {/* ========================================================================= */}
        {state === 'output-denied' && (
          <motion.div
            key="state-output-denied"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-900/50 text-xs text-rose-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Tool execution for <code className="font-mono text-white font-bold">{toolName}</code> was denied by user or security policy.</span>
            </div>
            <span className="text-[10px] font-mono text-rose-400 uppercase">output-denied</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
