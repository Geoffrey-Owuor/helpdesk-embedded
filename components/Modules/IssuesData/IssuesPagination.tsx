"use client";

import { ChevronLeft, ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useIssuesFilterStore } from "@/store/useIssuesFilterStore";

const pageSizeOptions = [10, 25, 50, 100];

// Server-driven pagination for IssuesData - mirrors AnalyticsPagination.tsx,
// reading page/pageSize from useIssuesFilterStore rather than local state.
const IssuesPagination = ({ total }: { total: number }) => {
  const page = useIssuesFilterStore((state) => state.page);
  const pageSize = useIssuesFilterStore((state) => state.pageSize);
  const setPage = useIssuesFilterStore((state) => state.setPage);
  const setPageSize = useIssuesFilterStore((state) => state.setPageSize);

  const [isPerPageOpen, setIsPerPageOpen] = useState(false);
  const perPageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        perPageRef.current &&
        !perPageRef.current.contains(event.target as Node)
      ) {
        setIsPerPageOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const indexOfFirst = (page - 1) * pageSize;
  const indexOfLast = Math.min(page * pageSize, total);

  return (
    <div className="mt-2 mb-6 flex flex-col items-center justify-between gap-4 py-3 md:flex-row">
      <div className="flex items-center gap-4">
        {total > 0 && (
          <p className="text-sm text-neutral-700 dark:text-neutral-400">
            Showing <span className="font-semibold">{indexOfFirst + 1}</span>{" "}
            to <span className="font-semibold">{indexOfLast}</span> of{" "}
            <span className="font-semibold">{total}</span> results
          </p>
        )}

        <div className="flex items-center gap-2" ref={perPageRef}>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Records:
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPerPageOpen(!isPerPageOpen)}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
            >
              <span className="text-neutral-900 dark:text-neutral-200">
                {pageSize}
              </span>
              <ChevronDown
                className={`h-3 w-3 text-neutral-500 transition-transform ${isPerPageOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isPerPageOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-20 overflow-hidden rounded-xl border border-neutral-300 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
                {pageSizeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setPageSize(option);
                      setPage(1);
                      setIsPerPageOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  >
                    <span
                      className={
                        pageSize === option
                          ? "font-semibold text-neutral-900 dark:text-white"
                          : "text-neutral-600 dark:text-neutral-400"
                      }
                    >
                      {option}
                    </span>
                    {pageSize === option && (
                      <Check className="h-3 w-3 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => setPage(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="inline-flex items-center justify-center rounded-lg p-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="mx-2 flex items-center gap-1">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= page - 1 && pageNumber <= page + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`inline-flex h-7 min-w-7 items-center justify-center rounded-lg text-sm font-semibold ${
                      page === pageNumber
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (pageNumber === page - 2 || pageNumber === page + 2) {
                return (
                  <span
                    key={pageNumber}
                    className="inline-flex items-center justify-center px-2 text-sm font-semibold text-neutral-400 dark:text-neutral-500"
                  >
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            type="button"
            onClick={() => setPage(Math.min(page + 1, totalPages))}
            disabled={page === totalPages}
            className="inline-flex items-center justify-center rounded-lg p-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
        </nav>
      )}
    </div>
  );
};

export default IssuesPagination;
