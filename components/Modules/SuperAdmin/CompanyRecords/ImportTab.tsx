"use client";
import { useRef, useState } from "react";
import { isAxiosError } from "axios";
import {
  CircleAlert,
  CircleCheck,
  Download,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { useAlertStore } from "@/store/useAlertStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { downloadExport } from "@/utils/downloadExport";
import { indicatorChip, indicatorMuted } from "@/lib/indicatorStyles";
import {
  cancelButtonStyles,
  cardStyles,
  plural,
  primaryButtonStyles,
  secondaryButtonStyles,
} from "./shared";

// What app/api/superadmin/company-records/import reports for a file
interface ImportIssue {
  row: number;
  column: string;
  message: string;
}

interface ImportChange {
  row: number;
  name: string;
  email: string;
  department: string;
  action: "new" | "updated" | "reactivated";
  previousName: string | null;
  previousDepartment: string | null;
}

interface ImportReport {
  valid: boolean;
  issues?: ImportIssue[];
  issueCount?: number;
  summary?: {
    total: number;
    new: number;
    updated: number;
    reactivated: number;
    unchanged: number;
  };
  changes?: ImportChange[];
}

const ACTION_LABELS: Record<ImportChange["action"], string> = {
  new: "New",
  updated: "Update",
  reactivated: "Reactivate",
};

const MAX_BYTES = 2 * 1024 * 1024;

const sendFile = (file: File, mode: "validate" | "commit") => {
  const body = new FormData();
  body.append("file", file);
  body.append("mode", mode);
  return apiClient.post("/superadmin/company-records/import", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

type ImportTabProps = {
  // Reloads the records after a successful import
  onImported: () => void;
};

// Bulk import from the Excel template: the file is checked first and its
// effect shown; nothing is saved until the admin confirms, and a file with
// any problem imports nothing.
const ImportTab = ({ onImported }: ImportTabProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  const reset = () => {
    setFile(null);
    setReport(null);
    // So choosing the same file again (after fixing it) fires onChange
    if (inputRef.current) inputRef.current.value = "";
  };

  const downloadTemplate = async () => {
    setIsDownloading(true);
    try {
      await downloadExport(
        "/superadmin/company-records/import-template",
        {},
        "staff_records_template.xlsx",
      );
    } catch (error) {
      triggerAlert(
        "error",
        error instanceof Error ? error.message : "Could not download the template",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const checkFile = async (chosen: File) => {
    setFile(chosen);
    setReport(null);

    if (!chosen.name.toLowerCase().endsWith(".xlsx")) {
      triggerAlert("error", "The file must be an Excel .xlsx file");
      reset();
      return;
    }
    if (chosen.size > MAX_BYTES) {
      triggerAlert("error", "The file is larger than 2 MB");
      reset();
      return;
    }

    setIsChecking(true);
    try {
      const res = await sendFile(chosen, "validate");
      setReport(res.data);
      // The result renders below the fold of the modal
      requestAnimationFrame(() =>
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (error) {
      triggerAlert("error", getApiErrorMessage(error));
      reset();
    } finally {
      setIsChecking(false);
    }
  };

  const importFile = async () => {
    if (!file) return;
    hideDialog();
    showOverlay("Adding");
    try {
      const res = await sendFile(file, "commit");
      triggerAlert("success", res.data.message);
      onImported();
      reset();
    } catch (error) {
      // The file no longer passes (e.g. a department was deactivated since
      // the check): show the new report instead of a bare error
      if (isAxiosError(error) && error.response?.status === 422) {
        setReport(error.response.data);
      }
      triggerAlert("error", getApiErrorMessage(error));
    } finally {
      hideOverlay();
    }
  };

  const summary = report?.summary;
  const changeCount = summary
    ? summary.new + summary.updated + summary.reactivated
    : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Step 1 */}
      <div className={`flex flex-col gap-3 p-4 ${cardStyles}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              1. Fill in the template
            </p>
            <p className={`text-xs ${indicatorMuted}`}>
              One person per row: full name, email and department. The
              template lists the current departments and explains the rules.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadTemplate}
            disabled={isDownloading}
            className={secondaryButtonStyles}
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Preparing…" : "Download template"}
          </button>
        </div>
        <ul
          className={`list-disc space-y-1 pl-5 text-xs ${indicatorMuted}`}
        >
          <li>
            A new email adds a record. An email that already has a record
            updates its name and department, and activates it again if it was
            deactivated.
          </li>
          <li>Records that aren&apos;t in the file are left as they are.</li>
          <li>
            If any row has a problem, nothing is imported - fix the file and
            upload it again.
          </li>
          <li>HelpDesk accounts are never created or changed by an import.</li>
        </ul>
      </div>

      {/* Step 2 */}
      <div className={`flex flex-col gap-3 p-4 ${cardStyles}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              2. Upload it to check
            </p>
            <p className={`flex min-w-0 items-center gap-1.5 text-xs ${indicatorMuted}`}>
              {file ? (
                <>
                  <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </>
              ) : (
                "An .xlsx file of up to 2,000 people and 2 MB. Nothing is saved yet."
              )}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            aria-label="Staff records import file"
            className="sr-only"
            onChange={(e) => {
              const chosen = e.target.files?.[0];
              if (chosen) checkFile(chosen);
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isChecking}
            className={secondaryButtonStyles}
          >
            <Upload className="h-4 w-4" />
            {isChecking ? "Checking…" : file ? "Choose another file" : "Choose file"}
          </button>
        </div>
      </div>

      <div ref={reportRef} className="-mt-4" />

      {/* Problems: nothing can be imported */}
      {report && !report.valid && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400">
            <CircleAlert className="h-4 w-4 shrink-0" />
            {plural(report.issueCount ?? 0, "problem")} found - nothing was
            imported
          </p>
          <div className="small-scrollbar max-h-72 overflow-auto rounded-lg border border-red-200 bg-white dark:border-red-900/60 dark:bg-neutral-950">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Row</th>
                  <th scope="col" className="px-3 py-2 font-medium">Column</th>
                  <th scope="col" className="px-3 py-2 font-medium">Problem</th>
                </tr>
              </thead>
              <tbody className="text-neutral-800 dark:text-neutral-200">
                {report.issues?.map((issue, index) => (
                  <tr
                    key={index}
                    className="border-t border-neutral-200 dark:border-neutral-800"
                  >
                    <td className="px-3 py-2 font-mono whitespace-nowrap">
                      {issue.row || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {issue.column}
                    </td>
                    <td className="px-3 py-2 wrap-break-word">
                      {issue.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(report.issueCount ?? 0) > (report.issues?.length ?? 0) && (
            <p className="text-xs text-red-700 dark:text-red-400">
              Showing the first {report.issues?.length}. Fix these and upload
              again to see the rest.
            </p>
          )}
        </div>
      )}

      {/* Step 3: the file passed */}
      {report?.valid && summary && (
        <div className={`flex flex-col gap-3 p-4 ${cardStyles}`}>
          <p className="flex items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-100">
            <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
            3. No problems in {plural(summary.total, "row")} - review and
            import
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            {(
              [
                ["New", summary.new],
                ["Updated", summary.updated],
                ["Reactivated", summary.reactivated],
                ["Unchanged", summary.unchanged],
              ] as const
            ).map(([label, count]) => (
              <span
                key={label}
                className={`rounded-full px-2.5 py-1 font-medium ${indicatorChip}`}
              >
                {label}: {count}
              </span>
            ))}
          </div>

          {report.changes && report.changes.length > 0 && (
            <div className="small-scrollbar max-h-72 overflow-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                  <tr>
                    <th scope="col" className="px-3 py-2 font-medium">Row</th>
                    <th scope="col" className="px-3 py-2 font-medium">Change</th>
                    <th scope="col" className="px-3 py-2 font-medium">Name</th>
                    <th scope="col" className="px-3 py-2 font-medium">Email</th>
                    <th scope="col" className="px-3 py-2 font-medium">Department</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-800 dark:text-neutral-200">
                  {report.changes.map((change) => (
                    <tr
                      key={change.row}
                      className="border-t border-neutral-200 align-top dark:border-neutral-800"
                    >
                      <td className="px-3 py-2 font-mono">{change.row}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {ACTION_LABELS[change.action]}
                      </td>
                      <td className="px-3 py-2">
                        {change.name}
                        {change.previousName && (
                          <span className={`block ${indicatorMuted}`}>
                            was {change.previousName}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 break-all">{change.email}</td>
                      <td className="px-3 py-2">
                        {change.department}
                        {change.previousDepartment && (
                          <span className={`block ${indicatorMuted}`}>
                            was {change.previousDepartment}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {changeCount > (report.changes?.length ?? 0) && (
            <p className={`text-xs ${indicatorMuted}`}>
              Showing the first {report.changes?.length} of{" "}
              {plural(changeCount, "change")}.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {changeCount === 0 && (
              <p className={`mr-auto text-xs ${indicatorMuted}`}>
                The records already match this file - there is nothing to
                import.
              </p>
            )}
            <button type="button" onClick={reset} className={cancelButtonStyles}>
              Discard
            </button>
            <button
              type="button"
              disabled={changeCount === 0}
              onClick={() =>
                triggerDialog({
                  title: "Import Staff Records",
                  description: `${summary.new} will be added, ${summary.updated} updated and ${summary.reactivated} reactivated. Records that aren't in the file are not changed.`,
                  onConfirm: importFile,
                })
              }
              className={primaryButtonStyles}
            >
              <Upload className="h-4 w-4" />
              Import {plural(changeCount, "change")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportTab;
