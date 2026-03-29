"use client";
import { useSearchStore } from "@/store/useSearchStore";
import { BrushCleaning, RotateCcw } from "lucide-react";

type ClearRefreshProps = {
  handleRefetchIssues: () => void;
};

const ClearRefreshFilters = ({ handleRefetchIssues }: ClearRefreshProps) => {
  const resetFilters = useSearchStore((state) => state.resetFilters);

  const refetchIssues = () => {
    resetFilters();
    handleRefetchIssues();
  };
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={resetFilters}
        title="Clear filters"
        className="flex items-center justify-center rounded-full bg-neutral-200 p-2 text-sm text-neutral-900 transition-colors duration-200 hover:bg-neutral-200/60 dark:bg-neutral-700/50 dark:text-neutral-100 dark:hover:bg-neutral-800/70"
      >
        <BrushCleaning className="h-5 w-5" />
      </button>
      <button
        onClick={refetchIssues}
        title="Refresh"
        className="flex items-center justify-center rounded-full bg-neutral-900 p-2 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
      >
        <RotateCcw className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ClearRefreshFilters;
