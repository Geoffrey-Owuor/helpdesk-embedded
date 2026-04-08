"use client";

import { XIcon, AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useCallback, useState } from "react";
import { useAlertStore } from "@/store/useAlertStore";

const Alert = () => {
  // Alert store states
  const hideAlert = useAlertStore((state) => state.hideAlert);
  const showAlert = useAlertStore((state) => state.showAlert);
  const alertType = useAlertStore((state) => state.alertType);
  const alertMessage = useAlertStore((state) => state.alertMessage);

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      hideAlert();
      setIsClosing(false); //reset isClosing after it animates out so that it animates in on next render
    }, 200); // Match this with animation duration
  }, [hideAlert]);

  // The auto close after 6 seconds
  useEffect(() => {
    // FIX 2: Reset timer whenever alertInfo changes (e.g., new message comes in)
    let timer: NodeJS.Timeout;
    if (showAlert) {
      timer = setTimeout(handleClose, 6000);
    }

    return () => clearTimeout(timer);
  }, [showAlert, handleClose]);

  // Don't render anything if there's no alert and we aren't currently animating out
  if (!showAlert && !isClosing) return null;

  // Determine which icon to display based on type
  const IconComponent = alertType === "success" ? CheckCircle : AlertCircle;

  // Determine icon color
  const iconColorClass =
    alertType === "success"
      ? "text-green-500 dark:text-green-700"
      : "text-red-500 dark:text-red-700";

  return (
    <div
      className={`fixed top-0 left-1/2 z-9999 max-w-2xl -translate-x-1/2 ${
        isClosing ? "animate-slideUp" : "animate-slideDown"
      }`}
    >
      <div
        className={`mt-4 flex items-center justify-between rounded-full bg-black px-4 py-4.5 text-white shadow-md dark:bg-white dark:text-black`}
      >
        <div className="flex items-center gap-2">
          {/* Render the appropriate icon */}
          <IconComponent className={`h-5 w-5 shrink-0 ${iconColorClass}`} />
          <p
            className="max-w-70 truncate text-sm md:max-w-2xl"
            title={alertMessage}
          >
            {alertMessage}
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
  );
};

export default Alert;
