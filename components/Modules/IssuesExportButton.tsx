"use client";

import { FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { useAlertStore } from "@/store/useAlertStore";
import { useUser } from "@/contexts/UserContext";
import {
  downloadExport,
  exportFileDate,
  fileNamePart,
} from "@/utils/downloadExport";

type IssuesExportButtonProps = {
  // The export route, e.g. /excel-export
  path: string;
  // Read on click, so the export always uses the filters applied right then
  getParams: () => Record<string, string>;
  // File name start; the user's name and today's date are added
  fileNamePrefix: string;
  label: string;
};

// Downloads an issues export (lib/excel/issuesExport.ts) and says so when the
// result was cut to the row limit
const IssuesExportButton = ({
  path,
  getParams,
  fileNamePrefix,
  label,
}: IssuesExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const { username } = useUser();

  const handleExport = async () => {
    const fileName = `${fileNamePrefix}_${fileNamePart(username)}_${exportFileDate()}.xlsx`;

    setIsExporting(true);
    try {
      const headers = await downloadExport(path, getParams(), fileName);

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

      <button
        title={label}
        aria-label={label}
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

export default IssuesExportButton;
