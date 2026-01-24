"use client";
import { useSearchLogic } from "@/contexts/SearchLogicContext";
import { XCircle } from "lucide-react";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import { FilterProps } from "./SearchFilters";

const ClearFilters = ({ setCurrentPage }: FilterProps) => {
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

    setCurrentPage(1);
  };
  return (
    <button
      onClick={clearFilters}
      title="Clear filters"
      className="flex h-9.5 items-center gap-1.5 rounded-xl bg-blue-700 px-3 text-sm text-white hover:bg-blue-800"
    >
      <XCircle className="h-4.5 w-4.5" />
      <span>Clear filters</span>
    </button>
  );
};

export default ClearFilters;
