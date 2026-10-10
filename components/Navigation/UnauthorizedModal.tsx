"use client";

import { useRouter } from "next/navigation";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { Modal, ModalTitle } from "../Modules/Modal/Modal";

export default function UnauthorizedModal() {
  const router = useRouter();

  return (
    // Blocking: no close button or backdrop tap; Escape goes back like the button
    <Modal open onClose={() => router.back()} variant="dialog" size="sm">
      <div className="p-6 sm:p-8">
        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-100 ring-1 ring-neutral-200 ring-inset dark:bg-neutral-800 dark:ring-neutral-700">
            <ShieldOff size={28} strokeWidth={1.75} className="text-red-500" />
          </div>
        </div>

        {/* Text */}
        <ModalTitle className="mb-2 text-center text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Access Restricted
        </ModalTitle>
        <p className="text-center text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          You are not authorized to view this page. If you believe this is an
          error, please contact your system administrator.
        </p>

        {/* Divider */}
        <div className="my-6 h-px bg-neutral-100 dark:bg-neutral-800" />

        {/* Action */}
        <button
          onClick={() => router.back()}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Go Back
        </button>
      </div>
    </Modal>
  );
}
