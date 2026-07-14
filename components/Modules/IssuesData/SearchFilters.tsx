"use client";
import { useSearchStore } from "@/store/useSearchStore";
import { Search } from "lucide-react";
import { Options } from "@/public/assets";

type FilterProps = {
  onSearch: (filters: Options) => void;
};
const SearchFilters = ({ onSearch }: FilterProps) => {
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
    onSearch(filterOptions);
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
