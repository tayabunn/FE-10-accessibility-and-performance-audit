'use client';

import { useState, useEffect } from 'react';

export interface OnlineStatusState {
  isOnline: boolean;
  wasOffline: boolean;
  offlineSince: Date | null;
  lastOnlineAt: Date | null;
}

export function useOnlineStatus(): OnlineStatusState {
  // SSR-safe default: assume online. The actual browser state is synced
  // in useEffect so server HTML always matches the first client render.
  const [status, setStatus] = useState<OnlineStatusState>({
    isOnline: true,
    wasOffline: false,
    offlineSince: null,
    lastOnlineAt: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Sync to actual browser state on mount
    const actuallyOnline = navigator.onLine;
    setStatus((prev) => ({
      ...prev,
      isOnline: actuallyOnline,
      lastOnlineAt: actuallyOnline ? new Date() : prev.lastOnlineAt,
      offlineSince: actuallyOnline ? null : new Date(),
    }));

    const handleOnline = () => {
      setStatus((prev) => ({
        isOnline: true,
        wasOffline: prev.offlineSince !== null,
        offlineSince: null,
        lastOnlineAt: new Date(),
      }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
        offlineSince: new Date(),
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}
