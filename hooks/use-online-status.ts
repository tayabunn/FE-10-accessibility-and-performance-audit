'use client';

import { useState, useEffect } from 'react';

export interface OnlineStatusState {
  isOnline: boolean;
  wasOffline: boolean;
  offlineSince: Date | null;
  lastOnlineAt: Date | null;
}

export function useOnlineStatus(): OnlineStatusState {
  const [status, setStatus] = useState<OnlineStatusState>(() => ({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    offlineSince: null,
    lastOnlineAt: typeof navigator !== 'undefined' && navigator.onLine ? new Date() : null,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

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
