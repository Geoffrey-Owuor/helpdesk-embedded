"use client";

import type { ReactNode } from "react";
import { useIsStuck } from "@/hooks/useIsStuck";

// Desktop shell for the sticky filter panels. In the flow it is a rounded card;
// once pinned to the top of the scroller it becomes a square full-width bar.
// Only paint changes between the two states - the box keeps its size, so the
// controls never rewrap and the stuck state cannot flicker at the threshold.
// The full-width band is a ::before layer stretched over the main column's
// side padding (px-4). The card outline is an inset ring rather than a border:
// a ring takes no layout space, so the band's offset is exactly px-4 at any
// display scale (a 1px border renders at 0.67px at 150%, which made it overflow).
const StickyFilterPanel = ({ children }: { children: ReactNode }) => {
  const { sentinelRef, isStuck } = useIsStuck();

  return (
    <>
      <div ref={sentinelRef} aria-hidden className="hidden sm:block" />
      <div
        className={`sticky top-0 z-50 mb-4 hidden p-4 ring-1 ring-inset transition-[border-radius,box-shadow,background-color] duration-150 before:absolute before:inset-y-0 before:-inset-x-4 before:-z-10 before:border-b before:border-neutral-200 before:bg-white before:transition-opacity before:duration-150 sm:block motion-reduce:transition-none motion-reduce:before:transition-none dark:before:border-neutral-800 dark:before:bg-black ${
          isStuck
            ? "rounded-none bg-transparent ring-transparent before:opacity-100"
            : "rounded-2xl bg-white ring-neutral-200 before:opacity-0 dark:bg-neutral-950 dark:ring-neutral-800"
        }`}
      >
        {children}
      </div>
    </>
  );
};

export default StickyFilterPanel;
