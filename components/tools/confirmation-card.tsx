'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmActionInput, ConfirmActionResult } from '@/lib/tools';
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Send, 
  FileSpreadsheet, 
  Calendar, 
  Mail, 
  Loader2,
  ShieldAlert
} from 'lucide-react';

interface ConfirmationCardProps {
  input: ConfirmActionInput;
  result?: ConfirmActionResult;
  onConfirm?: (input: ConfirmActionInput) => Promise<void>;
  onCancel?: () => void;
}

export function ConfirmationCard({ input, result, onConfirm, onCancel }: ConfirmationCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localStatus, setLocalStatus] = useState<'pending' | 'executed' | 'cancelled'>(
    result ? 'executed' : 'pending'
  );

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      if (onConfirm) {
        await onConfirm(input);
      }
      setLocalStatus('executed');
    } catch {
      setLocalStatus('pending');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    setLocalStatus('cancelled');
    if (onCancel) onCancel();
  };

  const getActionIcon = () => {
    switch (input.actionType) {
      case 'export_lead_report':
        return <FileSpreadsheet className="w-5 h-5 text-purple-400" />;
      case 'schedule_crm_followup':
        return <Calendar className="w-5 h-5 text-indigo-400" />;
      case 'trigger_outreach_sequence':
        return <Mail className="w-5 h-5 text-emerald-400" />;
      default:
        return <Send className="w-5 h-5 text-purple-400" />;
    }
  };

  const getActionTitle = () => {
    switch (input.actionType) {
      case 'export_lead_report':
        return 'Export Executive Lead Intelligence Report';
      case 'schedule_crm_followup':
        return 'Schedule Priority CRM Sales Follow-Up';
      case 'trigger_outreach_sequence':
        return 'Trigger Automated Outreach Email Sequence';
      default:
        return 'Execute Requested Automated Action';
    }
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-purple-900/50 p-5 shadow-2xl backdrop-blur-xl space-y-4 text-slate-100 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {localStatus === 'pending' && (
          <motion.div
            key="pending-confirmation"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-4"
          >
            {/* Header prompt banner */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
              <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block text-sm">User Confirmation Required</span>
                <span>The AI model proposed executing an external action. Please review parameters and approve or decline.</span>
              </div>
            </div>

            {/* Action Details Card */}
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/40 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center shadow-md">
                  {getActionIcon()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{getActionTitle()}</h4>
                  <p className="text-xs text-slate-400">Target Entity: <span className="text-purple-300 font-semibold">{input.targetName}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-purple-900/30 font-mono">
                <div>
                  <span className="text-slate-500 block">Priority:</span>
                  <span className="text-amber-400 font-bold uppercase">{input.parameters?.priority || 'HIGH'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Notes:</span>
                  <span className="text-slate-300 truncate block">{input.parameters?.notes || 'Automated via AI Assistant'}</span>
                </div>
              </div>
            </div>

            {/* Interactive Decision Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={handleReject}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Action</span>
              </button>

              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-900/50 flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                    <span>Executing Action...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Approve & Execute</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {localStatus === 'executed' && (
          <motion.div
            key="executed-confirmation"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 space-y-2"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Action Successfully Executed</span>
            </div>
            <p className="text-xs text-slate-300">
              {result?.summary || `Action "${input.actionType}" completed for ${input.targetName}.`}
            </p>
            <div className="text-[11px] font-mono text-emerald-400/80 pt-1 flex items-center justify-between">
              <span>TX ID: {result?.transactionId || 'TX-984210'}</span>
              <span>Completed</span>
            </div>
          </motion.div>
        )}

        {localStatus === 'cancelled' && (
          <motion.div
            key="cancelled-confirmation"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-slate-400"
          >
            <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span>Action Declined by User</span>
            </div>
            <p className="text-xs text-slate-400">
              Execution of &quot;{input.actionType}&quot; for {input.targetName} was aborted. No data was mutated.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
