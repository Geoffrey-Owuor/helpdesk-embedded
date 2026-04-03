"use client";

import {
  DatabaseZap,
  RefreshCcw,
  ShieldAlert,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useDbStore } from "@/store/useDbStore";

type DbStatusOverlayProps = {
  isDashboard?: boolean;
  hideOverlay?: () => void;
};

const STATUS_CONFIG = {
  checking: {
    icon: (
      <Loader2 className="h-8 w-8 animate-spin text-neutral-500 dark:text-neutral-400" />
    ),
    iconBg:
      "bg-neutral-100 ring-neutral-200 dark:bg-neutral-700/60 dark:ring-neutral-600/50",
    headerBg: "bg-neutral-50 dark:bg-neutral-800/80",
    title: "Checking Connection",
    description:
      "Verifying connectivity to the database cluster. This usually takes just a moment.",
    alert: {
      border: "border-neutral-200 dark:border-neutral-700/50",
      bg: "bg-neutral-50 dark:bg-neutral-800/60",
      icon: (
        <ShieldAlert className="h-5 w-5 shrink-0 text-neutral-500 dark:text-neutral-400" />
      ),
      text: "text-neutral-700 dark:text-neutral-400",
      message:
        "Running diagnostics on the database node. Access will be restored automatically.",
    },
    showReload: false,
    pingColor: "bg-sky-400",
    pingBg: "bg-sky-500",
    statusLabel: "Diagnosing Connection",
  },
  ok: {
    icon: (
      <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
    ),
    iconBg:
      "bg-emerald-50 ring-emerald-200 dark:bg-emerald-950/40 dark:ring-emerald-700/40",
    headerBg: "bg-emerald-50/60 dark:bg-emerald-950/20",
    title: "Connection Ok",
    description:
      "The database cluster is reachable and operating normally. You're good to go.",
    alert: {
      border: "border-emerald-200/80 dark:border-emerald-700/40",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      icon: (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ),
      text: "text-emerald-800 dark:text-emerald-300",
      message: "All systems are currently operational as expected",
    },
    showReload: true,
    pingColor: "bg-emerald-400",
    pingBg: "bg-emerald-500",
    statusLabel: "All Systems Operational",
  },
  degraded: {
    icon: (
      <DatabaseZap className="h-8 w-8 text-neutral-900 dark:text-neutral-100" />
    ),
    iconBg:
      "bg-neutral-100 ring-neutral-200 dark:bg-neutral-700/60 dark:ring-neutral-600/50",
    headerBg: "bg-neutral-50 dark:bg-neutral-800/80",
    title: "Connection Interrupted",
    description:
      "Our monitoring system detected a database outage. We've temporarily locked sensitive dashboards to protect user data.",
    alert: {
      border: "border-amber-200/80 dark:border-amber-700/40",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      icon: (
        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
      ),
      text: "text-amber-800 dark:text-amber-300",
      message:
        "Auto-reconnect is active. The system will restore access once the database cluster is reachable.",
    },
    showReload: true,
    pingColor: "bg-amber-400",
    pingBg: "bg-amber-500",
    statusLabel: "Monitoring Node: Active",
  },
};

export function DbStatusOverlay({
  isDashboard = true,
  hideOverlay,
}: DbStatusOverlayProps) {
  const status = useDbStore((state) => state.status);
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.checking;

  return (
    <div className="custom-blur fixed inset-0 z-9999 flex items-center justify-center bg-white/60 dark:bg-neutral-950/80">
      <div className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700/60 dark:bg-neutral-900 dark:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.8)]">
        {/* Header Section */}
        <div
          className={`relative p-8 text-center transition-colors duration-500 ${config.headerBg}`}
        >
          {!isDashboard && (
            <button
              onClick={hideOverlay}
              aria-label="Close overlay"
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}

          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ring-1 transition-colors duration-500 ${config.iconBg}`}
          >
            {config.icon}
          </div>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
            {config.title}
          </h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            {config.description}
          </p>
        </div>

        {/* Content Section */}
        <div className="p-8 dark:bg-neutral-900">
          <div
            className={`flex items-center gap-3 rounded-lg border p-4 transition-colors duration-500 ${config.alert.border} ${config.alert.bg}`}
          >
            {config.alert.icon}
            <p className={`text-xs leading-tight ${config.alert.text}`}>
              {config.alert.message}
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {config.showReload && (
              <button
                onClick={() => window.location.reload()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
              >
                <RefreshCcw size={16} />
                Reload Application
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-tighter text-neutral-400 uppercase dark:text-neutral-500">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.pingColor}`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${config.pingBg}`}
                />
              </span>
              {config.statusLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
