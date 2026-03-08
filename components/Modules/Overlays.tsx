"use client";

import { ArrowRight, Loader, Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useConfirmationDialog } from "@/contexts/ConfirmationDialogContext";
import { usePromiseOverlay } from "@/contexts/PromiseOverlayContext";

// Overlay displayed when performing crud operations or logging out
export const PromiseOverlay = () => {
  const { promiseOverlayInfo, setPromiseOverlayInfo } = usePromiseOverlay();
  const pathname = usePathname();

  // reset promise overlay when pathname changes
  useEffect(() => {
    setPromiseOverlayInfo({
      loading: false,
      overlaytext: "",
    });
  }, [pathname, setPromiseOverlayInfo]);

  const content = (
    <div
      className={`fixed inset-0 z-9999 flex h-screen items-center justify-center ${promiseOverlayInfo.overlaytext === "Logging out" ? "bg-white dark:bg-black" : "bg-black/30 dark:bg-black/60"}`}
    >
      {/* Container to align the spinner and text horizontally */}
      <div className="flex items-center space-x-2">
        {/* The Lucide Loader spinner */}
        {promiseOverlayInfo.overlaytext === "Logging out" ? (
          <Loader
            className="h-9 w-9 animate-spin text-neutral-900 dark:text-white"
            aria-label="overlay text"
          />
        ) : (
          <Loader2
            className="h-9 w-9 animate-spin text-neutral-900 dark:text-white"
            aria-label="overlay text"
          />
        )}
        {/* The text, styled for dark and light modes */}
        <span className="text-base text-neutral-900 dark:text-white">
          {promiseOverlayInfo.overlaytext}...
        </span>
      </div>
    </div>
  );

  if (!promiseOverlayInfo.loading) return null;

  return content;
};

// The Confirmation Dialogue Overlay
export const ConfirmationDialog = () => {
  const { confirmationDialogInfo, setConfirmationDialogInfo } =
    useConfirmationDialog();

  const onCancel = () => {
    setConfirmationDialogInfo({
      title: "",
      description: "",
      showDialog: false,
      onConfirm: undefined,
    });
  };

  const content = (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-black/50 dark:bg-black/60`}
    >
      <div className="mx-auto max-w-90 min-w-80 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-2xl md:max-w-md dark:border-neutral-700 dark:bg-neutral-950">
        <div className="relative mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            {confirmationDialogInfo.title}
          </h3>
          <button
            onClick={onCancel}
            type="button"
            className="absolute -top-0.5 right-0 cursor-pointer rounded-full p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-start text-sm text-neutral-700 dark:text-neutral-400">
          {confirmationDialogInfo.description}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            type="button"
            className="flex items-center gap-0.5 rounded-xl border border-neutral-300 bg-white px-4 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            onClick={confirmationDialogInfo.onConfirm}
            className="flex items-center gap-0.5 rounded-xl bg-neutral-900 px-4 py-1.5 text-sm text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            <ArrowRight className="h-4 w-4" />
            Proceed
          </button>
        </div>
      </div>
    </div>
  );

  if (!confirmationDialogInfo.showDialog) return null;

  return content;
};
