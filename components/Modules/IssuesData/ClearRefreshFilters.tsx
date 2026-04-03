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
        className="rounded-xl bg-neutral-100 p-2 transition-colors duration-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        <BrushCleaning className="h-4.5 w-4.5" />
      </button>

      <button
        onClick={refetchIssues}
        title="Refresh"
        className="rounded-xl bg-neutral-100 p-2 transition-colors duration-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        <RotateCcw className="h-4.5 w-4.5" />
      </button>
    </div>
  );
};

export default ClearRefreshFilters;
