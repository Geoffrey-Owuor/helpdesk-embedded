"use client";

import { useRouter } from "next/navigation";
import { ShieldOff, ArrowLeft } from "lucide-react";
import ClientPortal from "../Modules/ClientPortal";

export default function UnauthorizedModal() {
  const router = useRouter();

  return (
    <ClientPortal>
      <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/60">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
          {/* Icon */}
          <div className="mb-5 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-100 ring-1 ring-neutral-200 ring-inset dark:bg-neutral-800 dark:ring-neutral-700">
              <ShieldOff
                size={28}
                strokeWidth={1.75}
                className="text-red-500"
              />
            </div>
          </div>

          {/* Text */}
          <h2 className="mb-2 text-center text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Access Restricted
          </h2>
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
      </div>
    </ClientPortal>
  );
}
