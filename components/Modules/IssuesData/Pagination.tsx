"use client";

import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronDown,
  Check,
} from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";

type PaginationProps = {
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  issuesPerPage: number;
  setIssuesPerPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  indexOfFirstIssue: number;
  indexOfLastIssue: number;
  issuesLength: number;
};
const Pagination = ({
  currentPage,
  setCurrentPage,
  issuesPerPage,
  setIssuesPerPage,
  totalPages,
  indexOfFirstIssue,
  indexOfLastIssue,
  issuesLength,
}: PaginationProps) => {
  // State for the rows per page dropdown
  const [isPerPageOpen, setIsPerPageOpen] = useState(false);
  const perPageRef = useRef<HTMLDivElement>(null);

  // Options for rows per page
  const perPageOptions = [5, 10, 25, 50, 100];

  // Close dropdown when clicking outside
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
  return (
    <div className="mt-2 mb-6 flex items-center justify-between py-3">
      {totalPages > 1 && (
        <div className="flex flex-1 justify-between md:hidden">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-50 px-6 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="hidden md:flex md:flex-1 md:items-center md:justify-center lg:justify-between">
        {totalPages >= 1 && (
          <div className="flex items-center gap-4">
            <div className="hidden pr-3 lg:flex">
              <p className="text-sm text-neutral-700 dark:text-neutral-400">
                Showing{" "}
                <span className="font-semibold">{indexOfFirstIssue + 1}</span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(indexOfLastIssue, issuesLength)}
                </span>{" "}
                of <span className="font-semibold">{issuesLength}</span>{" "}
                {`result${issuesLength > 1 ? "s" : ""}`}
              </p>
            </div>

            {/* The button to set issues per page */}
            <div className="flex items-center gap-2" ref={perPageRef}>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Rows per page:
              </span>
              <div className="relative">
                <button
                  onClick={() => setIsPerPageOpen(!isPerPageOpen)}
                  className={`flex items-center gap-2 rounded-lg border bg-white px-2 py-1 text-sm font-medium transition-colors hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 ${
                    isPerPageOpen
                      ? "border-neutral-300 dark:border-neutral-700"
                      : "border-neutral-200 dark:border-neutral-800"
                  }`}
                >
                  <span className="text-neutral-900 dark:text-neutral-200">
                    {issuesPerPage}
                  </span>
                  <ChevronDown
                    className={`h-3 w-3 text-neutral-500 transition-transform ${isPerPageOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu - Positioned BOTTOM-FULL to open UPWARDS */}
                {isPerPageOpen && (
                  <div className="absolute bottom-full -left-4 mb-2 w-20 overflow-hidden rounded-xl border border-neutral-300 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
                    {perPageOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setIssuesPerPage(option);
                          setIsPerPageOpen(!isPerPageOpen);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      >
                        <span
                          className={
                            issuesPerPage === option
                              ? "font-semibold text-neutral-900 dark:text-white"
                              : "text-neutral-600 dark:text-neutral-400"
                          }
                        >
                          {option}
                        </span>
                        {issuesPerPage === option && (
                          <Check className="h-3 w-3 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center rounded-lg p-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="mx-2 flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;

                // Show first page, last page, current page, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg text-sm font-semibold ${
                        currentPage === pageNumber
                          ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                          : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return (
                    <span
                      key={pageNumber}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-neutral-400 dark:text-neutral-500"
                    >
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center rounded-lg p-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </button>
          </nav>
        )}
        {/* An invisible div to push pagination to the center */}
        <div className="hidden lg:inline-flex lg:w-40"></div>
      </div>
    </div>
  );
};

export default Pagination;
