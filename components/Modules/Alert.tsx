"use client";

import { XIcon, AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useCallback, useState } from "react";
import ClientPortal from "./ClientPortal";
import { useAlert } from "@/contexts/AlertContext";

const Alert = () => {
  const { alertInfo, setAlertInfo } = useAlert();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(
      () => setAlertInfo({ showAlert: false, alertType: "", alertMessage: "" }),
      200,
    ); // Match this with animation duration
  }, [setAlertInfo]);

  useEffect(() => {
    // FIX 1: Reset 'isClosing' whenever the alert becomes active again
    if (alertInfo.showAlert) {
      Promise.resolve().then(() => setIsClosing(false));
    }

    // FIX 2: Reset timer whenever alertInfo changes (e.g., new message comes in)
    let timer: NodeJS.Timeout;
    if (alertInfo.showAlert) {
      timer = setTimeout(handleClose, 6000);
    }

    return () => clearTimeout(timer);
  }, [alertInfo.showAlert, handleClose]);

  // Determine which icon to display based on type
  const IconComponent =
    alertInfo.alertType === "success" ? CheckCircle : AlertCircle;

  // Determine icon color
  const iconColorClass =
    alertInfo.alertType === "success"
      ? "text-green-500 dark:text-green-700"
      : "text-red-500 dark:text-red-700";

  return (
    <ClientPortal>
      {alertInfo.showAlert && (
        <div
          className={`fixed top-0 left-1/2 z-9999 max-w-sm -translate-x-1/2 ${
            isClosing ? "animate-slideUp" : "animate-slideDown"
          }`}
        >
          <div
            className={`mt-4 flex items-center justify-between rounded-full bg-black px-4 py-4.5 text-white shadow-md dark:bg-white dark:text-black`}
          >
            <div className="flex items-center gap-2">
              {/* Render the appropriate icon */}
              <IconComponent className={`h-5 w-5 shrink-0 ${iconColorClass}`} />
              <p className="max-w-70 truncate text-sm text-nowrap">
                {alertInfo.alertMessage}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="ml-4 cursor-pointer text-gray-200 hover:text-gray-300 dark:text-gray-600 dark:hover:text-gray-700"
              aria-label="Close alert"
            >
              <XIcon className="h-5 w-5 shrink-0" />
            </button>
          </div>
        </div>
      )}
    </ClientPortal>
  );
};

export default Alert;
