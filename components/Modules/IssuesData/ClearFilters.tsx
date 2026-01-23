"use client";
import { useSearchLogic } from "@/contexts/SearchLogicContext";
import { XCircle } from "lucide-react";
import { useIssuesData } from "@/contexts/IssuesDataContext";

const ClearFilters = () => {
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

  //    Get the refetch issues logic
  const { refetchIssues } = useIssuesData();

  const clearFilters = () => {
    // clear the values in each setter
    setSelectedFilter("");
    setStatus("");
    setReference("");
    setFromDate("");
    setToDate("");
    setDepartment("");
    setAgent("");
    setIssueType("");
    setSubmitter("");

    // refetch issues with not filters
    refetchIssues();
  };
  return (
    <button
      onClick={clearFilters}
      title="Clear filters"
      className="flex h-9.5 items-center gap-1.5 rounded-xl bg-blue-900 px-4 text-white hover:bg-blue-800"
    >
      <XCircle className="h-4.5 w-4.5" />
      <span>Clear</span>
      <span className="hidden md:flex"> filters</span>
    </button>
  );
};

export default ClearFilters;
