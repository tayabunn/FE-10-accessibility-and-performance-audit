'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, RefreshCw } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

/* ─────────────────────────── Types ─────────────────────────── */

/** The single source-of-truth state. No conflicting booleans. */
export type ButtonStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncActionButtonProps {
  /** Label shown in idle state */
  idleLabel: string;
  /** Optional icon rendered before the idle label */
  idleIcon?: React.ReactNode;
  /** Label shown during loading */
  loadingLabel: string;
  /** Label shown on success */
  successLabel: string;
  /** Label shown on error (also serves as retry prompt) */
  errorLabel: string;
  /** The async work to perform on click. Resolve = success, reject = error. */
  onAction: () => Promise<void>;
  /** Visual variant — shares the same motion language */
  variant?: 'primary' | 'secondary';
  /** Externally disable the button */
  disabled?: boolean;
  /** Additional className for the outer button */
  className?: string;
  /** Duration to display success state before returning to idle (ms) */
  successDisplayMs?: number;
  /** Duration to display error state before returning to idle (ms). Set 0 to require manual retry. */
  errorDisplayMs?: number;
  /** Unique id for testing */
  id?: string;
}

/* ─────────────── Motion constants (documented choices) ─────────────── */

/**
 * Duration/easing rationale:
 * - 150ms hover  → immediate feedback, below 200ms perception threshold
 * - 100ms press  → snappy tactile scale
 * - 180ms exit   → content leaves quickly via accelerating ease-in
 * - 200ms enter  → new content settles via decelerating ease-out
 * - 250ms success → celebratory emphasis with gentle spring
 * - 300ms shake  → single sharp oscillation, readable not annoying
 * - 1200ms hold  → long enough to register "it worked"
 * - 200ms reset  → quick, unobtrusive return
 */

const CONTENT_EXIT = { opacity: 0, y: 8, scale: 0.96 };
const CONTENT_ENTER_FROM = { opacity: 0, y: -8, scale: 0.96 };
const CONTENT_VISIBLE = { opacity: 1, y: 0, scale: 1 };

const exitTransition = { duration: 0.18, ease: [0.4, 0, 1, 1] as [number, number, number, number] };
const enterTransition = { duration: 0.2, ease: [0, 0, 0.2, 1] as [number, number, number, number] };
const successEnter = { type: 'spring' as const, stiffness: 400, damping: 25 };

/* ─── Reduced-motion variants: crossfade only, no movement ─── */
const REDUCED_EXIT = { opacity: 0 };
const REDUCED_ENTER_FROM = { opacity: 0 };
const REDUCED_VISIBLE = { opacity: 1 };
const reducedTransition = { duration: 0.1, ease: 'easeOut' as const };

/* ─────────────────────────── Component ─────────────────────────── */

export function AsyncActionButton({
  idleLabel,
  idleIcon,
  loadingLabel,
  successLabel,
  errorLabel,
  onAction,
  variant = 'primary',
  disabled = false,
  className,
  successDisplayMs = 1200,
  errorDisplayMs = 2500,
  id,
}: AsyncActionButtonProps) {
  const [status, setStatus] = useState<ButtonStatus>('idle');
  const isMountedRef = useRef(true);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const scheduleReset = useCallback(
    (delayMs: number) => {
      clearResetTimer();
      resetTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) setStatus('idle');
      }, delayMs);
    },
    [clearResetTimer]
  );

  const handleClick = useCallback(async () => {
    // Guard: only fire from idle or error (retry)
    if (status !== 'idle' && status !== 'error') return;
    if (disabled) return;

    clearResetTimer();
    setStatus('loading');

    try {
      await onAction();
      if (!isMountedRef.current) return;
      setStatus('success');
      scheduleReset(successDisplayMs);
    } catch {
      if (!isMountedRef.current) return;
      setStatus('error');
      if (errorDisplayMs > 0) {
        scheduleReset(errorDisplayMs);
      }
    }
  }, [status, disabled, onAction, clearResetTimer, scheduleReset, successDisplayMs, errorDisplayMs]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  /* ─── Pick motion values based on reduced-motion preference ─── */
  const motionExit = prefersReducedMotion ? REDUCED_EXIT : CONTENT_EXIT;
  const motionInitial = prefersReducedMotion ? REDUCED_ENTER_FROM : CONTENT_ENTER_FROM;
  const motionAnimate = prefersReducedMotion ? REDUCED_VISIBLE : CONTENT_VISIBLE;
  const motionEnterTx = prefersReducedMotion ? reducedTransition : enterTransition;
  const motionExitTx = prefersReducedMotion ? reducedTransition : exitTransition;
  const motionSuccessTx = prefersReducedMotion ? reducedTransition : successEnter;

  /* ─── Style variants ─── */
  const isPrimary = variant === 'primary';
  const isClickable = (status === 'idle' || status === 'error') && !disabled;

  const baseClasses = cn(
    // Layout
    'relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl',
    'font-semibold text-sm min-w-[180px] min-h-[48px]',
    'select-none outline-none',
    // Focus ring (always visible for keyboard users)
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06050c]',
    // Transitions for color/shadow (compositor-friendly)
    'transition-[background-color,box-shadow,border-color] duration-150 ease-out',
    // Variant-specific
    isPrimary
      ? cn(
          'border border-purple-600/60',
          'focus-visible:ring-purple-400',
          status === 'idle' && !disabled && 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40 hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-800/60 hover:shadow-xl cursor-pointer',
          status === 'loading' && 'bg-gradient-to-r from-purple-700 to-indigo-700 text-purple-200 cursor-wait border-purple-500/40',
          status === 'success' && 'bg-emerald-600/90 text-white border-emerald-500/60 shadow-lg shadow-emerald-900/40 cursor-default',
          status === 'error' && 'bg-rose-600/90 text-white border-rose-500/60 shadow-lg shadow-rose-900/40 cursor-pointer',
          disabled && status === 'idle' && 'bg-purple-950/30 text-purple-400/40 border-purple-900/30 cursor-not-allowed shadow-none',
        )
      : cn(
          'border border-purple-800/50',
          'focus-visible:ring-purple-500',
          status === 'idle' && !disabled && 'bg-purple-950/50 text-purple-200 hover:bg-purple-900/60 hover:text-white hover:border-purple-600/60 cursor-pointer',
          status === 'loading' && 'bg-purple-950/40 text-purple-300 cursor-wait border-purple-700/40',
          status === 'success' && 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50 cursor-default',
          status === 'error' && 'bg-rose-950/60 text-rose-300 border-rose-700/50 cursor-pointer',
          disabled && status === 'idle' && 'bg-purple-950/20 text-purple-500/30 border-purple-900/20 cursor-not-allowed',
        ),
    // Error shake (CSS animation, removed under reduced motion)
    status === 'error' && !prefersReducedMotion && 'animate-shake-once',
    className,
  );

  /* ─── Render content per state ─── */
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <motion.span
            key="loading"
            className="inline-flex items-center gap-2"
            initial={motionInitial}
            animate={motionAnimate}
            exit={motionExit}
            transition={motionEnterTx}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{loadingLabel}</span>
          </motion.span>
        );
      case 'success':
        return (
          <motion.span
            key="success"
            className="inline-flex items-center gap-2"
            initial={motionInitial}
            animate={motionAnimate}
            exit={motionExit}
            transition={motionSuccessTx}
          >
            <Check className="w-4 h-4" strokeWidth={3} />
            <span>{successLabel}</span>
          </motion.span>
        );
      case 'error':
        return (
          <motion.span
            key="error"
            className="inline-flex items-center gap-2"
            initial={motionInitial}
            animate={motionAnimate}
            exit={motionExit}
            transition={motionEnterTx}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{errorLabel}</span>
          </motion.span>
        );
      default:
        return (
          <motion.span
            key="idle"
            className="inline-flex items-center gap-2"
            initial={motionInitial}
            animate={motionAnimate}
            exit={motionExit}
            transition={motionExitTx}
          >
            {idleIcon}
            <span>{idleLabel}</span>
          </motion.span>
        );
    }
  };

  return (
    <div className="relative inline-flex flex-col items-start">
      <motion.button
        id={id}
        type="button"
        className={baseClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled && status === 'idle'}
        aria-busy={status === 'loading'}
        aria-disabled={disabled || status === 'loading'}
        aria-label={
          status === 'loading'
            ? loadingLabel
            : status === 'success'
              ? successLabel
              : status === 'error'
                ? errorLabel
                : idleLabel
        }
        // Hover/press transforms — compositor-friendly, skipped under reduced motion
        whileHover={
          isClickable && !prefersReducedMotion
            ? { y: -1, scale: 1.01 }
            : undefined
        }
        whileTap={
          isClickable && !prefersReducedMotion
            ? { scale: 0.97 }
            : undefined
        }
        transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {renderContent()}
        </AnimatePresence>
      </motion.button>

      {/* Screen-reader live region for state announcements */}
      <span
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {status === 'loading' && loadingLabel}
        {status === 'success' && successLabel}
        {status === 'error' && `Error: ${errorLabel}`}
      </span>
    </div>
  );
}


