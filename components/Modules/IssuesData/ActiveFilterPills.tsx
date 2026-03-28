"use client";
import { X } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { Options } from "@/public/assets";
import { dateFormatter } from "@/public/assets";

interface ActiveFilterPillsProps {
  committedFilters: Options | null;
  setCommittedFilters: React.Dispatch<React.SetStateAction<Options | null>>;
}

const filterLabels: Record<string, string> = {
  status: "Status",
  reference: "Reference",
  department: "Department",
  agent: "Agent",
  issueType: "Type",
  issuePriority: "Priority",
  submitter: "Submitter",
};

const ActiveFilterPills = ({
  committedFilters,
  setCommittedFilters,
}: ActiveFilterPillsProps) => {
  const setStatus = useSearchStore((state) => state.setStatus);
  const setReference = useSearchStore((state) => state.setReference);
  const setFromDate = useSearchStore((state) => state.setFromDate);
  const setToDate = useSearchStore((state) => state.setToDate);
  const setDepartment = useSearchStore((state) => state.setDepartment);
  const setAgent = useSearchStore((state) => state.setAgent);
  const setIssueType = useSearchStore((state) => state.setIssueType);
  const setIssuePriority = useSearchStore((state) => state.setIssuePriority);
  const setSubmitter = useSearchStore((state) => state.setSubmitter);

  if (!committedFilters) return null;

  // 1. Stricter check: Get keys that are valid, truthy, and NOT selectedFilter
  const activeKeys = Object.keys(committedFilters).filter(
    (key) => key !== "selectedFilter" && committedFilters[key as keyof Options],
  );

  // If no active keys exist, don't render the component
  if (activeKeys.length === 0) return null;

  // 2. Separate Date logic from the rest of the standard keys
  const hasFromDate = !!committedFilters.fromDate;
  const hasToDate = !!committedFilters.toDate;
  const hasDateFilter = hasFromDate || hasToDate;

  // Standard keys to map through (excluding the dates so we don't render them twice)
  const standardKeys = activeKeys.filter(
    (key) => key !== "fromDate" && key !== "toDate",
  );

  // 3. Handle standard filter removal
  const handleRemoveFilter = (key: keyof Options) => {
    switch (key) {
      case "status":
        setStatus("");
        break;
      case "reference":
        setReference("");
        break;
      case "department":
        setDepartment("");
        break;
      case "agent":
        setAgent("");
        break;
      case "issueType":
        setIssueType("");
        break;
      case "issuePriority":
        setIssuePriority("");
        break;
      case "submitter":
        setSubmitter("");
        break;
      default:
        break;
    }

    setCommittedFilters((prevFilters) => {
      if (!prevFilters) return null;
      const updatedFilters = { ...prevFilters };
      delete updatedFilters[key];

      // Re-run the strict check before returning
      const remainingKeys = Object.keys(updatedFilters).filter(
        (k) => k !== "selectedFilter" && updatedFilters[k as keyof Options],
      );
      return remainingKeys.length > 0 ? updatedFilters : null;
    });
  };

  // 4. Handle combined date filter removal
  const handleRemoveDate = () => {
    setFromDate("");
    setToDate("");

    setCommittedFilters((prevFilters) => {
      if (!prevFilters) return null;
      const updatedFilters = { ...prevFilters };
      delete updatedFilters.fromDate;
      delete updatedFilters.toDate;

      const remainingKeys = Object.keys(updatedFilters).filter(
        (k) => k !== "selectedFilter" && updatedFilters[k as keyof Options],
      );
      return remainingKeys.length > 0 ? updatedFilters : null;
    });
  };

  // Helper to format the text inside the Date pill
  const getDateRangeText = () => {
    if (committedFilters.fromDate && committedFilters.toDate) {
      return `${dateFormatter(committedFilters.fromDate)} to ${dateFormatter(committedFilters.toDate)}`;
    }
    return "";
  };

  return (
    <div className="mt-2 mb-6 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-neutral-500 dark:text-neutral-400">
        Active Filters:
      </span>

      {/* Render the Combined Date Pill if it exists */}
      {hasDateFilter && (
        <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          <span>
            Date: <span className="font-semibold">{getDateRangeText()}</span>
          </span>
          <button
            onClick={handleRemoveDate}
            className="ml-1 rounded-full p-0.5 hover:bg-neutral-300 dark:hover:bg-neutral-600"
            aria-label="Remove date filter"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Render the rest of the standard filters */}
      {standardKeys.map((key) => (
        <div
          key={key}
          className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        >
          <span className="capitalize">
            {filterLabels[key]}:{" "}
            <span className="font-semibold">
              {committedFilters[key as keyof Options]}
            </span>
          </span>
          <button
            onClick={() => handleRemoveFilter(key as keyof Options)}
            className="ml-1 rounded-full p-0.5 hover:bg-neutral-300 dark:hover:bg-neutral-600"
            aria-label={`Remove ${key} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ActiveFilterPills;
