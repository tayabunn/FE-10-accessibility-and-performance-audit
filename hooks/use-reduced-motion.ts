'use client';

import { useState, useEffect } from 'react';

/**
 * Detects if the user has requested reduced motion in their OS/browser settings.
 * Returns true if prefers-reduced-motion is 'reduce', false otherwise.
 * SSR safe: defaults to false during server render.
 */
export function usePrefersReducedMotion(): boolean {
  // Lazy initializer avoids calling setState inside useEffect (React 19 compiler rule).
  // SSR-safe: defaults to false when window is unavailable.
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}
