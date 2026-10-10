"use client";

import { ArrowRight, Loader, Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "./Modal/Modal";

// Overlay displayed when performing crud operations or logging out
export const PromiseOverlay = () => {
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const overlaytext = useOverlayStore((state) => state.overlaytext);
  const loading = useOverlayStore((state) => state.loading);
  const pathname = usePathname();

  // reset promise overlay when pathname changes (useful for logging out)
  useEffect(() => {
    hideOverlay();
  }, [pathname, hideOverlay]);

  const isLoggingOut = overlaytext === "Logging out";

  const content = (
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center ${isLoggingOut ? "bg-white dark:bg-neutral-950" : "bg-black/30 dark:bg-black/60"}`}
    >
      {isLoggingOut ? (
        // Vertically stacked, centered layout for the full-page logout state
        <div className="flex flex-col items-center gap-3">
          <Loader
            className="h-12 w-12 animate-spin text-neutral-900 dark:text-white"
            aria-label="overlay text"
          />
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            {overlaytext}...
          </span>
        </div>
      ) : (
        // Container to align the spinner and text horizontally
        <div className="flex flex-col items-center gap-3">
          <Loader2
            className="h-12 w-12 animate-spin text-neutral-900 dark:text-white"
            aria-label="overlay text"
          />
          {/* The text, styled for dark and light modes */}
          <span className="text-neutral-900 dark:text-white">
            {overlaytext}...
          </span>
        </div>
      )}
    </div>
  );

  if (!loading) return null;

  return content;
};

// The Confirmation Dialogue Overlay
export const ConfirmationDialog = () => {
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const onConfirm = useConfirmStore((state) => state.onConfirm);
  const description = useConfirmStore((state) => state.description);
  const title = useConfirmStore((state) => state.title);
  const showDialog = useConfirmStore((state) => state.showDialog);

  return (
    <Modal
      open={showDialog}
      onClose={hideDialog}
      variant="dialog"
      size="md"
      tone="muted"
      dismissible
    >
      <ModalHeader title={title} bordered={false} />
      <ModalBody className="pt-0 sm:pt-0">
        <p className="text-sm text-neutral-700 dark:text-neutral-400">
          {description}
        </p>
      </ModalBody>
      <ModalFooter bordered={false} className="pt-0 pb-4">
        <button
          onClick={hideDialog}
          type="button"
          className="flex items-center gap-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 sm:py-1.5 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={onConfirm}
          type="button"
          className="flex items-center gap-1 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm text-white hover:bg-neutral-700 sm:py-1.5 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          <ArrowRight className="h-4 w-4" />
          Proceed
        </button>
      </ModalFooter>
    </Modal>
  );
};
