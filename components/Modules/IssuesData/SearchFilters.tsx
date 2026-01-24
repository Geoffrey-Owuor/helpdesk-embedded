"use client";
import { useSearchLogic } from "@/contexts/SearchLogicContext";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import { Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export type FilterProps = {
  setCurrentPage: Dispatch<SetStateAction<number>>;
};
const SearchFilters = ({ setCurrentPage }: FilterProps) => {
  // The the fetch issues function
  const { fetchIssues } = useIssuesData();

  // Get the filter data
  const {
    selectedFilter,
    // Getters
    status,
    reference,
    fromDate,
    toDate,
    department,
    agent,
    issueType,
    submitter,
  } = useSearchLogic();

  // Compile options into one object
  const filterOptions = {
    selectedFilter,
    status,
    reference,
    fromDate,
    toDate,
    department,
    agent,
    issueType,
    submitter,
  };

  // Handling the search logic
  const handleFilterSearch = () => {
    fetchIssues(filterOptions);
    setCurrentPage(1);
  };
  return (
    <button
      onClick={handleFilterSearch}
      className="flex h-9.5 items-center gap-1.5 rounded-xl bg-neutral-900 px-3 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
    >
      <Search className="h-4 w-4" />
      Search
    </button>
  );
};

export default SearchFilters;
