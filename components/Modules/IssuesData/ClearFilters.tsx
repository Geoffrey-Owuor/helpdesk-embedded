"use client";
import { useSearchLogic } from "@/contexts/SearchLogicContext";
import { XCircle } from "lucide-react";
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
    // reset page
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
