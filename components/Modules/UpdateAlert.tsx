"use client";

import { RefreshCw } from "lucide-react";

// Stays until acted on, unlike the toasts in Alert.tsx. Reloading goes through
// the browser's beforeunload prompt on a form with unsaved changes, and when
// embedded in the hub it reloads only this iframe, on the page it's showing.
const UpdateAlert = ({ onLater }: { onLater: () => void }) => {
  return (
    <div role="status" className="animate-slideUp pointer-events-auto">
      <div className="relative flex items-start gap-3 overflow-hidden rounded-2xl bg-black p-4 dark:bg-white">
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-sky-500" />

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 dark:bg-sky-100">
          <RefreshCw className="h-5 w-5 text-sky-400 dark:text-sky-600" />
        </div>

        <div className="flex flex-1 flex-col pt-0.5">
          <h3 className="text-sm font-bold tracking-tight text-white dark:text-neutral-900">
            Update available
          </h3>
          <p className="mt-0.5 text-[13px] text-neutral-200 dark:text-neutral-700">
            A new version of HelpDesk is ready. Reload to start using it.
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onLater}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white dark:text-neutral-600 dark:hover:bg-neutral-200 dark:hover:text-neutral-900"
            >
              Later
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-neutral-200 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-700"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateAlert;
