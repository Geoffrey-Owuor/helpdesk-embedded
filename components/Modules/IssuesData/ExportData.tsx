import { Download } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { useState } from "react";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAlert } from "@/contexts/AlertContext";
import { useSearchLogic } from "@/contexts/SearchLogicContext";

const ExportData = ({ fetchAutomations }: { fetchAutomations: string }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { fromDate, toDate, agentAdminFilter } = useSearchLogic();
  const { setAlertInfo } = useAlert();

  // Dynamically building our url
  let baseUrl = `/excel-export?fetchAutomations=${fetchAutomations || "issues"}`;

  // Adding the agent admin filter
  if (agentAdminFilter === "agentAdminFilter") {
    baseUrl += `&agentAdminFilter=${agentAdminFilter}`;
  }

  // Adding the dates
  if (fromDate && toDate) {
    baseUrl += `&fromDate=${fromDate}&toDate=${toDate}`;
  }

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
      a.download = "issues_data.xlsx"; //file name for the downloaded file
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
      setAlertInfo({
        showAlert: true,
        alertType: "error",
        alertMessage: "Error exporting data to excel",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center p-1">
      {/* Spinning border with a visible track */}
      {isExporting && (
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-neutral-200 border-t-black dark:border-neutral-800 dark:border-t-white" />
      )}

      {/* Download button */}
      <button
        title="Export data"
        onClick={handleExport}
        disabled={isExporting}
        className="relative z-10 rounded-full bg-black p-2 text-white transition-all duration-200 hover:scale-105 hover:bg-neutral-800 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        <Download className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ExportData;
