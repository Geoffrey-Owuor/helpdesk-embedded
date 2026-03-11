"use client";
import { useSearchStore } from "@/store/useSearchStore";
import { useIssuesStore } from "@/store/useIssuesStore";
import { useAutomationsStore } from "@/store/useAutomationsStore";
import { Search } from "lucide-react";

type FilterProps = {
  recordType: string;
};
const SearchFilters = ({ recordType }: FilterProps) => {
  const fetchIssues = useIssuesStore((state) => state.fetchIssues);
  const fetchAutomations = useAutomationsStore(
    (state) => state.fetchAutomations,
  );

  const fetchData =
    recordType === "automations" ? fetchAutomations : fetchIssues;

  const selectedFilter = useSearchStore((state) => state.selectedFilter);
  const status = useSearchStore((state) => state.status);
  const reference = useSearchStore((state) => state.reference);
  const fromDate = useSearchStore((state) => state.fromDate);
  const toDate = useSearchStore((state) => state.toDate);
  const department = useSearchStore((state) => state.department);
  const agent = useSearchStore((state) => state.agent);
  const issueType = useSearchStore((state) => state.issueType);
  const issuePriority = useSearchStore((state) => state.issuePriority);
  const submitter = useSearchStore((state) => state.submitter);

  // An array of our active filters
  const activeFilters = [
    status,
    reference,
    fromDate,
    toDate,
    department,
    agent,
    issueType,
    issuePriority,
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
    issuePriority,
    submitter,
  };

  // Handling the search logic
  const handleFilterSearch = () => {
    // Do not run if button is disabled
    if (buttonDisabled) return;
    fetchData(filterOptions);
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
