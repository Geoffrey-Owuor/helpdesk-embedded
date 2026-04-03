"use client";

import { FileSpreadsheet } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { useState } from "react";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAlertStore } from "@/store/useAlertStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useUser } from "@/contexts/UserContext";

const ExportData = ({ fetchAutomations }: { fetchAutomations: string }) => {
  const [isExporting, setIsExporting] = useState(false);
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const { username, isSuper } = useUser();

  // Getting the data needed from the store
  const fromDate = useSearchStore((state) => state.fromDate);
  const toDate = useSearchStore((state) => state.toDate);
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);

  // Dynamically building our url
  let baseUrl = `/excel-export?fetchAutomations=${fetchAutomations || "issues"}`;

  // Adding the super admin filter
  if (isSuper && superAdminFilter) {
    const filterValue = "superAdminFilter";
    baseUrl += `&superAdminFilter=${filterValue}`;
  }
  // Adding the agent admin filter
  if (agentAdminFilter === "agentAdminFilter") {
    baseUrl += `&agentAdminFilter=${agentAdminFilter}`;
  }

  // Adding the dates
  if (fromDate && toDate) {
    baseUrl += `&fromDate=${fromDate}&toDate=${toDate}`;
  }

  // Dynamic excel document name with the date the document was downloaded
  const date = new Date().toLocaleDateString("en-GB");
  const documentName = `${fetchAutomations === "automations" ? "automations_data" : "issues_data"}_${username}_${date}.xlsx`;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await apiClient.get(baseUrl, {
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
  );
};

export default ExportData;
