"use client";

import { useSearchStore } from "@/store/useSearchStore";
import { useIssuesFilterStore } from "@/store/useIssuesFilterStore";
import { useUser } from "@/contexts/UserContext";
import IssuesExportButton from "../IssuesExportButton";

const ExportData = () => {
  const { isSuper } = useUser();

  // The applied filters and view, exactly what the issues list is showing
  const committedFilters = useIssuesFilterStore(
    (state) => state.committedFilters,
  );
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);

  const getParams = () => {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(committedFilters ?? {})) {
      if (value) params[key] = value;
    }
    if (isSuper && superAdminFilter) {
      params.superAdminFilter = "superAdminFilter";
    }
    if (agentAdminFilter === "agentAdminFilter") {
      params.agentAdminFilter = agentAdminFilter;
    }
    return params;
  };

  return (
    <IssuesExportButton
      path="/excel-export"
      getParams={getParams}
      fileNamePrefix="issues_data"
      label="Export the filtered issues to Excel"
    />
  );
};

export default ExportData;
