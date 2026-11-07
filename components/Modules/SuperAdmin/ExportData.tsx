"use client";

import { Bug, FileSpreadsheet, RotateCcw, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import { useAlertStore } from "@/store/useAlertStore";
import { downloadExport, exportFileDate } from "@/utils/downloadExport";
import AddUser from "./EditModals/AddUser";
import AddIssue from "./EditModals/AddIssue";
import { DropdownOption } from "./EditModals/CustomDropDown";

export const DefaultAgentsDropDown: DropdownOption[] = [
  { option: "Not Found", value: "Not Found" },
];

type ExportDataProps = {
  refetch: () => void;
  type: string;
  agentsInfo?: DropdownOption[];
  adminsInfo?: DropdownOption[];
};
const ExportData = ({
  refetch,
  type,
  agentsInfo = DefaultAgentsDropDown,
  adminsInfo = DefaultAgentsDropDown,
}: ExportDataProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isUsers = type === "users";

  const apiString = `/export-${isUsers ? "users" : "issuesmapping"}`;

  const handleExport = async () => {
    const documentName = `${isUsers ? "users_data" : "issues_mapping"}_${exportFileDate()}.xlsx`;

    setIsExporting(true);
    try {
      await downloadExport(apiString, {}, documentName);
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
    <>
      {/* Add user modal */}
      {isUsers && isModalOpen && (
        <AddUser
          hideModal={() => setIsModalOpen(false)}
          isModalOpen={isModalOpen}
        />
      )}

      {/* Add issue type modal */}
      {!isUsers && isModalOpen && (
        <AddIssue
          hideModal={() => setIsModalOpen(false)}
          isModalOpen={isModalOpen}
          agentsInfo={agentsInfo}
          adminsInfo={adminsInfo}
        />
      )}

      {/* Add Issue Modal */}
      <div className="ml-auto flex items-center gap-2">
        {/*  The Add Button (Add Issue or User) */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-3 py-2 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {isUsers ? (
            <UserRoundPlus className="h-4 w-4" />
          ) : (
            <Bug className="h-4 w-4" />
          )}
          <span>Add {isUsers ? "user" : "issue"}</span>
        </button>
        <div className="relative inline-flex items-center justify-center p-1.5">
          {/* Spinning border with a visible track */}
          {isExporting && (
            <div className="absolute inset-0 animate-spin rounded-full border border-neutral-200 border-t-black dark:border-neutral-800 dark:border-t-white" />
          )}

          {/* Download button */}
          <button
            title="Export data"
            onClick={handleExport}
            disabled={isExporting}
            className="relative z-10 rounded-xl bg-neutral-100 p-2 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <FileSpreadsheet className="h-4.5 w-4.5" />
          </button>
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
    </>
  );
};

export default ExportData;
