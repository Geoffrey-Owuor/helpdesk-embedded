"use client";

import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { useAlertStore } from "@/store/useAlertStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useIssuesFilterStore } from "@/store/useIssuesFilterStore";
import { useUser } from "@/contexts/UserContext";
import {
  downloadExport,
  exportFileDate,
  fileNamePart,
} from "@/utils/downloadExport";

const ExportData = () => {
  const [isExporting, setIsExporting] = useState(false);
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const { username, isSuper } = useUser();

  // The applied filters and view, exactly what the issues list is showing
  const committedFilters = useIssuesFilterStore(
    (state) => state.committedFilters,
  );
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);

  const handleExport = async () => {
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

    const fileName = `issues_data_${fileNamePart(username)}_${exportFileDate()}.xlsx`;

    setIsExporting(true);
    try {
      const headers = await downloadExport("/excel-export", params, fileName);

      // A result over the row limit is cut to the newest issues
      const exported = Number(headers["x-export-rows"]);
      const total = Number(headers["x-export-total"]);
      if (exported && total > exported) {
        triggerAlert(
          "success",
          `Exported the newest ${exported.toLocaleString()} of ${total.toLocaleString()} issues. Narrow your filters to export the rest.`,
        );
      }
    } catch (error) {
      triggerAlert(
        "error",
        error instanceof Error ? error.message : "Error exporting data to excel",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center p-1.5">
      {/* Spinning border with a visible track */}
      {isExporting && (
        <div className="absolute inset-0 animate-spin rounded-full border border-neutral-200 border-t-black dark:border-neutral-800 dark:border-t-white" />
      )}

      {/* Download button */}
      <button
        title="Export the filtered issues to Excel"
        aria-label="Export the filtered issues to Excel"
        aria-busy={isExporting}
        onClick={handleExport}
        disabled={isExporting}
        className="relative z-10 rounded-xl bg-neutral-100 p-2 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        <FileSpreadsheet className="h-4.5 w-4.5" />
      </button>
    </div>
  );
};

export default ExportData;
