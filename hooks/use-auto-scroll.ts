import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoScrollOptions {
  /** Distance in pixels from bottom considered "at bottom" (default 60px) */
  threshold?: number;
  /** Trigger dependency (e.g., streaming message content or list length) */
  contentDependency?: unknown;
}

export function useAutoScroll<T extends HTMLElement>({
  threshold = 60,
  contentDependency,
}: UseAutoScrollOptions = {}) {
  const containerRef = useRef<T | null>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [isPinned, setIsPinned] = useState<boolean>(true);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
    setIsAtBottom(true);
    setIsPinned(true);
  }, []);

  // Handle manual scroll listener
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    const atBottom = distanceFromBottom <= threshold;
    setIsAtBottom(atBottom);

    // If user scrolled up past threshold, release the pin lock
    if (!atBottom) {
      setIsPinned(false);
    } else {
      setIsPinned(true);
    }
  }, [threshold]);

  // Automatically scroll to bottom if pinned whenever content updates
  useEffect(() => {
    if (isPinned && containerRef.current) {
      const container = containerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [contentDependency, isPinned]);

  // Attach scroll event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return {
    containerRef,
    isAtBottom,
    isPinned,
    scrollToBottom,
    handleScroll,
  };
}
