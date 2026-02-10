"use client";

import { useSearchLogic } from "@/contexts/SearchLogicContext";
import { LayoutGrid, Rows3 } from "lucide-react";

const ToggleTableView = () => {
  const { isTableView, setIsTableView } = useSearchLogic();

  // Base styles for the buttons to keep the JSX clean
  const baseBtnStyles =
    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200";
  const activeStyles =
    "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm";
  const inactiveStyles =
    "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300";

  return (
    <div className="ml-0 flex rounded-xl border border-neutral-200 bg-neutral-100 p-1 md:ml-auto dark:border-neutral-700 dark:bg-neutral-800/50">
      {/* Card View Button */}
      <button
        onClick={() => setIsTableView(false)}
        className={`${baseBtnStyles} ${!isTableView ? activeStyles : inactiveStyles}`}
        aria-label="Switch to Card View"
        title="Switch to Card View"
      >
        <LayoutGrid size={16} strokeWidth={2.5} />
        <span>Cards</span>
      </button>

      {/* Table View Button */}
      <button
        onClick={() => setIsTableView(true)}
        className={`${baseBtnStyles} ${isTableView ? activeStyles : inactiveStyles}`}
        aria-label="Switch to Table View"
        title="Switch to Table View"
      >
        <Rows3 size={16} strokeWidth={2.5} />
        <span>Table</span>
      </button>
    </div>
  );
};

export default ToggleTableView;
