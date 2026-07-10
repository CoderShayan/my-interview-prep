import { useEffect, useRef, useState } from "react";

/**
 * Shared swipe + keyboard navigation for reader dialogs.
 * - ← / → keys move prev/next
 * - Horizontal swipe > 55px triggers prev/next
 * - Provides a swipeDir state for slide transitions
 */
export function useReaderNav({
  enabled,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  deps = [],
}: {
  enabled: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  deps?: unknown[];
}) {
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  function go(dir: "next" | "prev") {
    if (dir === "next" && hasNext) {
      setSwipeDir("left");
      setTimeout(() => { onNext(); setSwipeDir(null); }, 160);
    } else if (dir === "prev" && hasPrev) {
      setSwipeDir("right");
      setTimeout(() => { onPrev(); setSwipeDir(null); }, 160);
    }
  }

  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") go("next");
      else if (e.key === "ArrowLeft") go("prev");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, hasNext, hasPrev, ...deps]);

  const touchHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchStartX.current == null || touchStartY.current == null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (dx < 0) go("next"); else go("prev");
      }
      touchStartX.current = null;
      touchStartY.current = null;
    },
  };

  const slideClass =
    swipeDir === "left"  ? "-translate-x-6 opacity-0" :
    swipeDir === "right" ? "translate-x-6 opacity-0" :
                           "translate-x-0 opacity-100";

  return { go, swipeDir, touchHandlers, slideClass };
}
