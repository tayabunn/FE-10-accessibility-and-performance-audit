'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/use-online-status';

export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-amber-950/90 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs flex items-center justify-between shadow-lg backdrop-blur-md z-30 font-sans"
        >
          <div className="flex items-center gap-2 max-w-3xl mx-auto w-full justify-center">
            <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-100">You are currently offline.</span>
            <span className="hidden md:inline text-amber-300/80">
              Message streaming and tool executions are paused until connection is restored.
            </span>
          </div>
        </motion.div>
      )}

      {isOnline && wasOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 px-4 py-2 text-xs flex items-center justify-between shadow-lg backdrop-blur-md z-30 font-sans"
        >
          <div className="flex items-center gap-2 max-w-3xl mx-auto w-full justify-center">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-emerald-100">Connection restored!</span>
            <span className="hidden md:inline text-emerald-300/80">
              You are back online and ready to stream.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
