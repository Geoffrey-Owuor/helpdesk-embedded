"use client";
import { useSearchLogic } from "@/contexts/SearchLogicContext";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import { useAutomationsData } from "@/contexts/AutomationsDataContext";
import { Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

type FilterProps = {
  setCurrentPage: Dispatch<SetStateAction<number>>;
  recordType: string;
};
const SearchFilters = ({ setCurrentPage, recordType }: FilterProps) => {
  // The the fetch issues function
  const { fetchIssues } = useIssuesData();
  const { fetchAutomations } = useAutomationsData();

  let fetchData;

  switch (recordType) {
    case "automations":
      fetchData = fetchAutomations;
      break;
    default:
      fetchData = fetchIssues;
      break;
  }

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

  // An array of our active filters
  const activeFilters = [
    status,
    reference,
    fromDate,
    toDate,
    department,
    agent,
    issueType,
    submitter,
  ];
  // Check if any of them has a value
  const hasActiveFilters = activeFilters.some((filter) => !!filter);

  // disable if there are no active filters
  const buttonDisabled = !hasActiveFilters;

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
    // Do not run if button is disabled
    if (buttonDisabled) return;
    fetchData(filterOptions);
    setCurrentPage(1);
  };
  return (
    <button
      onClick={handleFilterSearch}
      disabled={buttonDisabled}
      className="flex h-9.5 items-center gap-1.5 rounded-xl bg-neutral-900 px-3 text-sm text-white hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
    >
      <Search className="h-4 w-4" />
      Search
    </button>
  );
};

export default SearchFilters;
