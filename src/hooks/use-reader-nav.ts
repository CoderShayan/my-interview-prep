import { useEffect, useRef, useState } from "react";

/**
 * Shared swipe + keyboard navigation for reader dialogs.
 * - ← / → keys move prev/next (works on desktop & mobile w/ Bluetooth keyboard)
 * - Horizontal swipe > 55px triggers prev/next
 * - Ignores key events while typing in inputs, textareas, contenteditable,
 *   or while a Radix popover/select/menu/combobox is focused
 * - Coalesces rapid presses (key repeat / double-swipe) using an in-flight lock
 * - Provides slideClass for slide transitions
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
  const inFlight = useRef(false);

  function go(dir: "next" | "prev") {
    if (inFlight.current) return;
    if (dir === "next" && hasNext) {
      inFlight.current = true;
      setSwipeDir("left");
      setTimeout(() => {
        onNext();
        setSwipeDir(null);
        inFlight.current = false;
      }, 160);
    } else if (dir === "prev" && hasPrev) {
      inFlight.current = true;
      setSwipeDir("right");
      setTimeout(() => {
        onPrev();
        setSwipeDir(null);
        inFlight.current = false;
      }, 160);
    }
  }

  useEffect(() => {
    if (!enabled) return;

    function isTypingTarget(t: EventTarget | null) {
      const el = t as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      // Radix Select / Combobox / Menu / Listbox capture arrow keys themselves.
      if (el.closest('[role="listbox"],[role="menu"],[role="combobox"],[role="option"],[role="menuitem"],[cmdk-root]')) {
        return true;
      }
      return false;
    }

    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.repeat) return; // ignore held-down repeat
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      if (e.key === "ArrowRight") go("next");
      else go("prev");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, hasNext, hasPrev, ...deps]);

  const touchHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchStartX.current == null || touchStartY.current == null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      touchStartX.current = null;
      touchStartY.current = null;
      // require dominant horizontal motion, avoid triggering during vertical scroll
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx < 0) go("next"); else go("prev");
      }
    },
    onTouchCancel: () => {
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
