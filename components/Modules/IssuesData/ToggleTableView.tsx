"use client";

import { useSearchStore } from "@/store/useSearchStore";
import { LayoutGrid, List } from "lucide-react";

const ToggleTableView = () => {
  const isTableView = useSearchStore((state) => state.isTableView);
  const setIsTableView = useSearchStore((state) => state.setIsTableView);

  return (
    <div className="relative flex rounded-2xl border border-neutral-200 bg-neutral-50 p-1 shadow-inner dark:border-neutral-800 dark:bg-neutral-950">
      {/* Sliding pill */}
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-200 ease-in-out dark:bg-neutral-800 dark:ring-white/10 ${
          isTableView ? "translate-x-[calc(100%-4px)]" : "translate-x-0"
        }`}
      />

      {/* Card View */}
      <button
        onClick={() => setIsTableView(false)}
        className={`relative z-10 rounded-xl p-2 transition-colors duration-200 ${
          !isTableView
            ? "text-neutral-900 dark:text-white"
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

      {/* Table View */}
      <button
        onClick={() => setIsTableView(true)}
        className={`relative z-10 rounded-xl p-2 transition-colors duration-200 ${
          isTableView
            ? "text-neutral-900 dark:text-white"
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
    </div>
  );
};

export default ToggleTableView;
