'use client';

import React, { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, 
  ArrowUpIcon, 
  Square, 
  Code2, 
  Rocket, 
  Layers, 
  Palette, 
  CircleUserRound, 
  MonitorIcon, 
  FileUp, 
  ImageIcon,
  Loader2,
  Check,
  RefreshCw
} from 'lucide-react';
import { StreamState } from '@/hooks/use-chat-stream';
import { fakeAsyncAction, ForceMode } from '@/lib/fake-async';
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

type SendState = 'idle' | 'loading' | 'success' | 'error';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  status: StreamState;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, status, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [sendState, setSendState] = useState<SendState>('idle');
  const [demoMode, setDemoMode] = useState<ForceMode>('random');
  const prefersReduced = usePrefersReducedMotion();

  const isStreaming = status === 'streaming';
  const isThinking = status === 'thinking';
  const isBusy = isStreaming || isThinking;
  const canSend = message.trim().length > 0 && !isBusy && !disabled;

  // Auto-resize textarea logic
  const adjustHeight = useCallback((reset?: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (reset) {
      textarea.style.height = '48px';
      return;
    }

    textarea.style.height = '48px';
    const newHeight = Math.max(48, Math.min(textarea.scrollHeight, 160));
    textarea.style.height = `${newHeight}px`;
  }, []);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = '48px';
  }, []);

  const handleSend = async () => {
    if (!canSend || (sendState !== 'idle' && sendState !== 'error')) return;
    
    setSendState('loading');
    const messageToSend = message;

    try {
      await fakeAsyncAction(demoMode);
      setSendState('success');
      
      // Wait for user to see success state, then fire actual send
      setTimeout(() => {
        setSendState('idle');
        onSend(messageToSend);
        setMessage('');
        adjustHeight(true);
      }, 1000);
    } catch (err) {
      setSendState('error');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (promptText: string) => {
    onSend(promptText);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2">
      {/* Input Box Section */}
      <div className="relative bg-[#0b0817]/90 backdrop-blur-xl rounded-2xl border border-purple-800/60 shadow-[0_0_30px_rgba(168,85,247,0.15)] focus-within:border-purple-500/80 focus-within:ring-2 focus-within:ring-purple-500/25 transition-all">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isBusy
              ? 'Astrine AI is streaming response...'
              : 'Type your request... (Enter to send, Shift+Enter for new line)'
          }
          readOnly={isBusy}
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full px-4 py-3 resize-none border-none bg-transparent text-white text-sm md:text-base',
            'focus:outline-none focus:ring-0 focus-visible:ring-0',
            'placeholder:text-purple-300/40 min-h-[48px] custom-scrollbar disabled:opacity-60 read-only:opacity-60'
          )}
          style={{ overflow: 'hidden' }}
        />

        {/* Action Controls & Footer Buttons */}
        <div className="flex items-center justify-between p-3 border-t border-purple-900/40">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-2 rounded-lg text-purple-300/70 hover:text-white hover:bg-purple-950/60 transition-colors"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Prompt Character Counter & Overflow Warning Badge */}
            {message.length > 0 && (
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full border transition-colors',
                    message.length > 3800
                      ? 'bg-rose-950/80 text-rose-300 border-rose-700/60 animate-pulse'
                      : message.length > 3000
                      ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                      : 'bg-purple-950/60 text-purple-400 border-purple-800/40'
                  )}
                >
                  {message.length} / 4000 chars
                </span>
                {message.length > 3800 && (
                  <span className="text-rose-400 font-bold">Approaching Limit</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {isBusy ? (
                /* State: Streaming / Thinking -> STOP Button */
                <motion.button
                  key="stop-btn"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onStop}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-950/60 transition-colors"
                  title="Stop Stream (Esc)"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop</span>
                </motion.button>
              ) : (
                /* State: Idle / Disabled -> SEND Button (Stateful) */
                <motion.button
                  key="send-btn"
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ 
                    scale: (canSend && (sendState === 'idle' || sendState === 'error')) ? 1.05 : 1, 
                    y: (prefersReduced || !canSend) ? 0 : -1 
                  }}
                  whileTap={{ scale: (canSend && (sendState === 'idle' || sendState === 'error')) ? 0.95 : 1 }}
                  onClick={handleSend}
                  disabled={!canSend || (sendState === 'loading' || sendState === 'success')}
                  aria-busy={sendState === 'loading'}
                  aria-live="polite"
                  className={cn(
                    'relative flex items-center justify-center overflow-hidden transition-colors rounded-lg',
                    sendState === 'idle' && canSend ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-950/60 text-white cursor-pointer' : '',
                    sendState === 'idle' && !canSend ? 'bg-purple-950/30 text-purple-400/40 border border-purple-900/30 cursor-not-allowed' : '',
                    sendState === 'loading' ? 'bg-purple-600 text-purple-100 cursor-wait' : '',
                    sendState === 'success' ? 'bg-emerald-500 text-white cursor-default' : '',
                    sendState === 'error' ? 'bg-rose-600 text-white cursor-pointer hover:bg-rose-500 shadow-lg shadow-rose-950/60' : '',
                    sendState === 'error' && !prefersReduced ? 'animate-shake-once' : '',
                    sendState === 'idle' ? 'px-3 py-2' : 'px-4 py-2'
                  )}
                  title={canSend && sendState === 'idle' ? 'Send (Enter)' : sendState === 'error' ? 'Retry (Enter)' : 'Enter message'}
                >
                  <AnimatePresence mode="wait">
                    {sendState === 'idle' && (
                      <motion.div
                        key="idle"
                        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                        animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center justify-center"
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                        <span className="sr-only">Send</span>
                      </motion.div>
                    )}

                    {sendState === 'loading' && (
                      <motion.div
                        key="loading"
                        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                        animate={prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1.5"
                      >
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-xs font-semibold">Sending...</span>
                      </motion.div>
                    )}

                    {sendState === 'success' && (
                      <motion.div
                        key="success"
                        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                        animate={prefersReduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                        exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 1.2 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Sent ✓</span>
                      </motion.div>
                    )}

                    {sendState === 'error' && (
                      <motion.div
                        key="error"
                        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -10 }}
                        animate={prefersReduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
                        exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Retry</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="flex items-center justify-center flex-wrap gap-2.5 mt-5">
        <QuickAction
          icon={<Code2 className="w-4 h-4 text-purple-400" />}
          label="Generate Code"
          onClick={() => handleQuickAction('Write a high-performance React component with TypeScript.')}
        />
        <QuickAction
          icon={<Rocket className="w-4 h-4 text-purple-400" />}
          label="Launch App"
          onClick={() => handleQuickAction('Explain how to deploy a Next.js App Router app to production.')}
        />
        <QuickAction
          icon={<Layers className="w-4 h-4 text-purple-400" />}
          label="UI Components"
          onClick={() => handleQuickAction('Design an accessible Tailwind CSS glassmorphic component layout.')}
        />
        <QuickAction
          icon={<Palette className="w-4 h-4 text-purple-400" />}
          label="Theme Ideas"
          onClick={() => handleQuickAction('Suggest modern HSL dark mode neon color palettes for frontend apps.')}
        />
        <QuickAction
          icon={<CircleUserRound className="w-4 h-4 text-purple-400" />}
          label="User Dashboard"
          onClick={() => handleQuickAction('Outline a user settings and profile dashboard architecture.')}
        />
        <QuickAction
          icon={<MonitorIcon className="w-4 h-4 text-purple-400" />}
          label="Landing Page"
          onClick={() => handleQuickAction('Draft a hero section and feature grid for an AI developer product.')}
        />
        <QuickAction
          icon={<FileUp className="w-4 h-4 text-purple-400" />}
          label="Upload Docs"
          onClick={() => handleQuickAction('How do I process PDF documents and markdown docs in a chat interface?')}
        />
        <QuickAction
          icon={<ImageIcon className="w-4 h-4 text-purple-400" />}
          label="Image Assets"
          onClick={() => handleQuickAction('How can I optimize web images and lazy load assets in Next.js?')}
        />
      </div>

      {/* Demo Controls */}
      <div className="flex items-center justify-center gap-3 mt-6 text-[11px] bg-purple-950/20 py-2 rounded-lg border border-purple-900/30 max-w-sm mx-auto backdrop-blur-sm">
        <span className="text-purple-400/60 font-mono font-medium">Demo Mode:</span>
        <button
          onClick={() => setDemoMode('random')}
          className={cn("px-2.5 py-1 rounded-md transition-all font-semibold", demoMode === 'random' ? "bg-purple-600 text-white shadow-sm shadow-purple-900/50" : "text-purple-300/60 hover:text-purple-200 hover:bg-purple-900/40")}
        >
          Normal (80/20)
        </button>
        <button
          onClick={() => setDemoMode('success')}
          className={cn("px-2.5 py-1 rounded-md transition-all font-semibold", demoMode === 'success' ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/50" : "text-purple-300/60 hover:text-emerald-200 hover:bg-emerald-900/40")}
        >
          Force Success
        </button>
        <button
          onClick={() => setDemoMode('error')}
          className={cn("px-2.5 py-1 rounded-md transition-all font-semibold", demoMode === 'error' ? "bg-rose-600 text-white shadow-sm shadow-rose-900/50" : "text-purple-300/60 hover:text-rose-200 hover:bg-rose-900/40")}
        >
          Force Error
        </button>
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-800/60 bg-purple-950/40 backdrop-blur-sm text-purple-200 hover:text-white hover:bg-purple-900/60 hover:border-purple-500/60 transition-all text-xs cursor-pointer shadow-sm"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
