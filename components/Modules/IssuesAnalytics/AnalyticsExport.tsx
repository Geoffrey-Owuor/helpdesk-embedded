"use client";

import { useAnalyticsFilterStore } from "@/store/useAnalyticsFilterStore";
import IssuesExportButton from "../IssuesExportButton";

// Exports every issue the analytics filters match, not just the table's page
const AnalyticsExport = () => {
  const committedFilters = useAnalyticsFilterStore(
    (state) => state.committedFilters,
  );

  const getParams = () => {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(committedFilters ?? {})) {
      if (value) params[key] = String(value);
    }
    return params;
  };

  return (
    <IssuesExportButton
      path="/analytics/export"
      getParams={getParams}
      fileNamePrefix="analytics_issues"
      label="Export the filtered issues to Excel"
    />
  );
};

export default AnalyticsExport;
