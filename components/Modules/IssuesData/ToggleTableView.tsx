"use client";

import { useEffect } from "react";
import { useSearchStore } from "@/store/useSearchStore";
import { LayoutGrid, List, Keyboard } from "lucide-react";

const ToggleTableView = () => {
  const isTableView = useSearchStore((state) => state.isTableView);
  const setIsTableView = useSearchStore((state) => state.setIsTableView);

  // ── KEYBOARD SHORTCUT LOGIC ──
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Alt + V is pressed
      if (event.altKey && event.key.toLowerCase() === "v") {
        event.preventDefault(); // Prevent default browser behavior
        setIsTableView(!isTableView);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTableView, setIsTableView]);

  return (
    // Added `group` to trigger the tooltip on hover over the entire toggle area
    <div className="group relative flex rounded-2xl border border-neutral-200 bg-neutral-50 p-1 shadow-inner dark:border-neutral-800 dark:bg-neutral-950">
      {/* Card View Button */}
      <button
        onClick={() => setIsTableView(false)}
        className={`relative z-10 flex flex-1 items-center justify-center rounded-xl p-2 transition-all duration-200 ${
          !isTableView
            ? "bg-white text-neutral-900 shadow-sm ring-1 ring-black/5 dark:bg-neutral-800 dark:text-white dark:ring-white/10"
            : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
        }`}
        aria-label="Switch to Card View"
        title="Switch to Card View"
      >
        <LayoutGrid
          size={16}
          strokeWidth={2.5}
          className={`transition-transform duration-200 ${!isTableView ? "scale-110" : "scale-100"}`}
        />
      </button>

      {/* Table View Button */}
      <button
        onClick={() => setIsTableView(true)}
        className={`relative z-10 flex flex-1 items-center justify-center rounded-xl p-2 transition-all duration-200 ${
          isTableView
            ? "bg-white text-neutral-900 shadow-sm ring-1 ring-black/5 dark:bg-neutral-800 dark:text-white dark:ring-white/10"
            : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
        }`}
        aria-label="Switch to Table View"
        title="Switch to Table View"
      >
        <List
          size={16}
          strokeWidth={2.5}
          className={`transition-transform duration-200 ${isTableView ? "scale-110" : "scale-100"}`}
        />
      </button>

      {/* ── TOOLTIP ── */}
      <div className="pointer-events-none absolute -top-9 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100 dark:bg-white dark:text-neutral-900">
        <Keyboard
          size={14}
          className="shrink-0 text-neutral-400 dark:text-neutral-500"
        />
        <span>Alt + V</span>
        {/* Tooltip Tail/Arrow */}
        <div className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-sm bg-neutral-900 dark:bg-white" />
      </div>
    </div>
  );
};

export default ToggleTableView;
