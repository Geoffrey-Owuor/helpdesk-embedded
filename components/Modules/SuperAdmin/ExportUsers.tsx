"use client";

import { FileSpreadsheet, RotateCcw } from "lucide-react";
import { useState } from "react";
import apiClient from "@/lib/AxiosClient";
import { useAlertStore } from "@/store/useAlertStore";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";

type ExportUsersProps = {
  refetch: () => void;
};
const ExportUsers = ({ refetch }: ExportUsersProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const triggerAlert = useAlertStore((state) => state.triggerAlert);

  const date = new Date().toLocaleDateString("en-GB");
  const documentName = `users_data_${date}.xlsx`;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await apiClient.get("/export-users", {
        responseType: "blob",
      });

      // Converting the response into a blob
      const blob = response.data;

      // Creating a temporary url for the blob
      const url = window.URL.createObjectURL(blob);

      // Creating a temporary link element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = documentName; //file name for the downloaded file
      document.body.appendChild(a);
      a.click(); //click the link programmatically to start the download
      a.remove(); //remove link from the body;
      window.URL.revokeObjectURL(url); //cleanup the temporary url
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      console.error(
        "Error while trying to export issues data to excel:",
        errorMessage,
      );

      triggerAlert("error", "Error exporting data to excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="ml-auto flex items-center gap-2">
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
  );
};

export default ExportUsers;
