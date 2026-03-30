"use client";

import { Search, X, RotateCcw } from "lucide-react";

type SearchRefetchProps = {
  onSearch: (value: string) => void;
  searchValue: string;
  refetch: () => void;
};

const SearchRefetch = ({
  onSearch,
  refetch,
  searchValue,
}: SearchRefetchProps) => {
  const handleClear = () => {
    onSearch("");
  };

  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      {/* Search Input Container */}
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search..."
          className="h-10 w-full rounded-xl border border-neutral-300 bg-white pr-3 pl-9 text-sm transition-all outline-none placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500"
        />
        {searchValue && (
          <button
            onClick={handleClear}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Refresh Button */}
      <button
        onClick={refetch}
        title="Refresh"
        className="rounded-xl bg-neutral-100 p-2 transition-colors duration-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        <RotateCcw className="h-5 w-5" />
      </button>
    </div>
  );
};

export default SearchRefetch;
