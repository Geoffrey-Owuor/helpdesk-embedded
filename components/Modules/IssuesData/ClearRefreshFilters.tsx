"use client";
import { useSearchLogic } from "@/contexts/SearchLogicContext";
import { RotateCcw, XCircle } from "lucide-react";

type ClearRefreshProps = {
  handleRefetchIssues: () => void;
};

const ClearRefreshFilters = ({ handleRefetchIssues }: ClearRefreshProps) => {
  // Get search setters from userSearch
  const {
    setSelectedFilter,
    setStatus,
    setReference,
    setFromDate,
    setToDate,
    setDepartment,
    setAgent,
    setIssueType,
    setSubmitter,
  } = useSearchLogic();

  const clearFilters = () => {
    // clear the values in each setter - we clear filters without refetching the data
    setSelectedFilter("");
    setStatus("");
    setReference("");
    setFromDate("");
    setToDate("");
    setDepartment("");
    setAgent("");
    setIssueType("");
    setSubmitter("");
  };

  const refetchIssues = () => {
    clearFilters();
    handleRefetchIssues();
  };
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={clearFilters}
        title="Clear filters"
        className="flex h-9.5 items-center gap-1.5 rounded-xl bg-blue-700 px-3 text-sm text-white hover:bg-blue-800"
      >
        <XCircle className="h-4.5 w-4.5" />
        <span className="max-w-20 truncate">Clear filters</span>
      </button>
      <button
        onClick={refetchIssues}
        className="flex h-9.5 items-center gap-2 rounded-xl bg-neutral-900 px-3 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
      >
        <RotateCcw className="h-4.5 w-4.5" />
        <span>Refresh</span>
      </button>
    </div>
  );
};

export default ClearRefreshFilters;
