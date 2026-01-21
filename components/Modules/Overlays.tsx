"use client";

import ClientPortal from "./ClientPortal";
import { Loader2, X } from "lucide-react";

// Confirmation dialogue props
type ConfirmationDialogProps = {
  message: string;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
};

// Overlay displayed when performing crud operations or logging out
export const PromiseOverlay = ({ overlaytext }: { overlaytext: string }) => {
  const content = (
    <div
      className={`fixed inset-0 z-9999 flex h-screen items-center justify-center ${overlaytext === "Logging out" ? "bg-white dark:bg-neutral-950" : "bg-black/30 dark:bg-black/60"}`}
    >
      {/* Container to align the spinner and text horizontally */}
      <div className="flex items-center space-x-2">
        {/* The Lucide Loader spinner */}
        <Loader2
          className="h-9 w-9 animate-spin text-neutral-900 dark:text-white"
          aria-label="overlay text"
        />
        {/* The text, styled for dark and light modes */}
        <span className="text-xl text-neutral-900 dark:text-white">
          {overlaytext}...
        </span>
      </div>
    </div>
  );

  return <ClientPortal>{content}</ClientPortal>;
};

// The Confirmation Dialogue
const ConfirmationDialog = ({
  message,
  onConfirm,
  onCancel,
  title,
}: ConfirmationDialogProps) => {
  const content = (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center bg-black/50 dark:bg-black/60`}
    >
      <div className="mx-auto max-w-90 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-2xl md:max-w-md dark:border-gray-700 dark:bg-gray-950">
        <div className="relative mb-4 flex items-start justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onCancel}
            type="button"
            className="absolute -top-0.5 right-0 cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label="Close dialog"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="mb-4 text-center text-gray-700 dark:text-gray-400">
          {message}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onCancel}
            type="button"
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-gray-900 px-4 py-2 text-white hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
  return <ClientPortal>{content}</ClientPortal>;
};

export default ConfirmationDialog;
