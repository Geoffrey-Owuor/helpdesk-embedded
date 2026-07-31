"use client";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAnalyticsFilterStore } from "@/store/useAnalyticsFilterStore";
import { baseDepartments, statusOptions, priorityOptions, dateFormatter } from "@/public/assets";
import { fetchGlobalAgents } from "@/queries/analytics/fetchGlobalAgents";
import { AnalyticsFilterParams } from "./types";

const filterLabels: Record<string, string> = {
  department: "Department",
  agent: "Agent",
  issueType: "Type",
  status: "Status",
  priority: "Priority",
  submitter: "Submitter",
  reference: "Reference",
  reopened: "Reopened",
  escalated: "Escalated",
  collaborated: "Collaborated",
};

const ActiveAnalyticsFilterPills = () => {
  const committedFilters = useAnalyticsFilterStore(
    (state) => state.committedFilters,
  );
  const removeFilter = useAnalyticsFilterStore((state) => state.removeFilter);

  const { data: globalAgents = [] } = useQuery({
    queryKey: ["analyticsGlobalAgents"],
    queryFn: fetchGlobalAgents,
  });

  if (!committedFilters) return null;

  const activeKeys = (
    Object.keys(committedFilters) as (keyof AnalyticsFilterParams)[]
  ).filter((key) => !!committedFilters[key]);

  if (activeKeys.length === 0) return null;

  const hasDateFilter = !!committedFilters.fromDate || !!committedFilters.toDate;

  const standardKeys = activeKeys.filter(
    (key) => key !== "fromDate" && key !== "toDate",
  );

  const getDateRangeText = () => {
    if (committedFilters.fromDate && committedFilters.toDate) {
      return `${dateFormatter(committedFilters.fromDate)} to ${dateFormatter(committedFilters.toDate)}`;
    }
    if (committedFilters.fromDate) {
      return `From ${dateFormatter(committedFilters.fromDate)}`;
    }
    return `Until ${dateFormatter(committedFilters.toDate ?? "")}`;
  };

  const getDisplayValue = (key: keyof AnalyticsFilterParams): string => {
    const value = committedFilters[key];

    switch (key) {
      case "department":
        return (
          baseDepartments.find((dept) => dept.value === value)?.option ||
          String(value)
        );
      case "agent":
        return (
          globalAgents.find((a) => a.agent_email === value)?.agent_name ||
          String(value)
        );
      case "status":
        return (
          statusOptions.find((opt) => opt.value === value)?.label ||
          String(value)
        );
      case "priority":
        return (
          priorityOptions.find((opt) => opt.value === value)?.label ||
          String(value)
        );
      case "reopened":
      case "escalated":
      case "collaborated":
        return "Yes";
      default:
        return String(value);
    }
  };

  const pillClasses =
    "flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-900 transition-colors dark:bg-blue-900/30 dark:text-blue-100";

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-neutral-500 dark:text-neutral-400">
        Active Filters:
      </span>

      {hasDateFilter && (
        <div className={pillClasses}>
          <span>
            Date: <span className="font-normal">{getDateRangeText()}</span>
          </span>
          <button
            onClick={() => {
              removeFilter("fromDate");
              removeFilter("toDate");
            }}
            className="ml-1 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900/70"
            aria-label="Remove date filter"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {standardKeys.map((key) => (
        <div key={key} className={pillClasses}>
          <span>
            {filterLabels[key]}:{" "}
            <span className="font-normal">{getDisplayValue(key)}</span>
          </span>
          <button
            onClick={() => removeFilter(key)}
            className="ml-1 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900/70"
            aria-label={`Remove ${key} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ActiveAnalyticsFilterPills;
