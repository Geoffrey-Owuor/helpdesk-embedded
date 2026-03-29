"use client";

import { useSearchStore } from "@/store/useSearchStore";
import { LayoutGrid, List } from "lucide-react";

const ToggleTableView = () => {
  const isTableView = useSearchStore((state) => state.isTableView);
  const setIsTableView = useSearchStore((state) => state.setIsTableView);

  // Base styles for the buttons to keep the JSX clean
  const baseBtnStyles =
    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200";
  const activeStyles =
    "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm";
  const inactiveStyles =
    "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300";

  return (
    <div className="flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-950">
      {/* Card View Button */}
      <button
        onClick={() => setIsTableView(false)}
        className={`${baseBtnStyles} ${!isTableView ? activeStyles : inactiveStyles}`}
        aria-label="Switch to Card View"
        title="Switch to Card View"
      >
        <LayoutGrid size={16} strokeWidth={2.5} />
      </button>

      {/* Table View Button */}
      <button
        onClick={() => setIsTableView(true)}
        className={`${baseBtnStyles} ${isTableView ? activeStyles : inactiveStyles}`}
        aria-label="Switch to Table View"
        title="Switch to Table View"
      >
        <List size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default ToggleTableView;
