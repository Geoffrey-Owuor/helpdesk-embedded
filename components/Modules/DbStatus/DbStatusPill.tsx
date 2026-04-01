"use client";

import { useDbStore, DbStatus } from "@/store/useDbStore";
import { Activity, AlertCircle, Loader2 } from "lucide-react";
import { DbStatusOverlay } from "./DbStatusOverlay";
import { useState } from "react";

export function DbStatusPill() {
  const status = useDbStore((state) => state.status);
  const [showOverlay, setShowOverlay] = useState(false);

  // Style mapping for different states
  const styles: Record<
    DbStatus,
    { container: string; icon: string; label: string }
  > = {
    ok: {
      container:
        "border-neutral-200 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400",
      icon: "text-emerald-500",
      label: "Systems Operational",
    },
    degraded: {
      container:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-500",
      icon: "text-amber-500",
      label: "Service Degraded",
    },
    checking: {
      container:
        "border-neutral-200 bg-neutral-50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500",
      icon: "text-neutral-400 animate-spin",
      label: "Checking Connectivity...",
    },
  };

  const current = styles[status];

  return (
    <>
      {showOverlay && (
        <DbStatusOverlay
          hideOverlay={() => setShowOverlay(false)}
          isDashboard={false}
        />
      )}
      <button
        onClick={() => setShowOverlay(true)}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-500 ${current.container}`}
      >
        {status === "ok" && <Activity size={14} className={current.icon} />}
        {status === "degraded" && (
          <AlertCircle size={14} className={current.icon} />
        )}
        {status === "checking" && (
          <Loader2 size={14} className={current.icon} />
        )}
        {current.label}
      </button>
    </>
  );
}
