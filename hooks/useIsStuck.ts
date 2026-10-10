"use client";
import { useEffect, useRef, useState } from "react";

// Reports whether a `sticky top-0` element is currently stuck to the top of the
// dashboard scroller. Place the returned ref on a zero-height sentinel rendered
// directly above the sticky element: once the sentinel scrolls above the
// scroller's top edge, the element below it is pinned.
export const useIsStuck = (containerId: string = "main-content") => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) =>
        setIsStuck(
          !entry.isIntersecting &&
            entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0),
        ),
      { root: document.getElementById(containerId) },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [containerId]);

  return { sentinelRef, isStuck };
};
