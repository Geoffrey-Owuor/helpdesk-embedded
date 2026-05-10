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
import ClientPortal from "../ClientPortal";

type DbStatusOverlayProps = {
  isDashboard?: boolean;
  hideOverlay?: () => void;
};

// --- PREMIUM STATUS CONFIGURATION ---
const STATUS_CONFIG = {
  checking: {
    icon: (
      <Loader2
        size={24}
        className="animate-spin text-neutral-700 dark:text-neutral-200"
      />
    ),
    iconWrapper:
      "bg-neutral-100 border border-neutral-200 shadow-inner dark:bg-neutral-800 dark:border-neutral-700",
    headerBg:
      "bg-gradient-to-b from-neutral-50/50 to-transparent dark:from-neutral-900/50",
    title: "Checking Connection",
    description:
      "Verifying connectivity to the database cluster. This usually takes just a moment.",
    alert: {
      box: "border-neutral-200/60 bg-neutral-50/50 dark:border-neutral-700/50 dark:bg-neutral-800/30",
      icon: (
        <ShieldAlert
          size={18}
          className="shrink-0 text-neutral-500 dark:text-neutral-400"
        />
      ),
      text: "text-neutral-600 dark:text-neutral-400",
      message:
        "Running diagnostics on the database node. Access will be restored automatically.",
    },
    showReload: false,
    pingColor: "bg-sky-400",
    pingBg: "bg-sky-500",
    statusLabel: "Diagnosing Connection",
  },
  ok: {
    icon: <CheckCircle2 size={24} className="text-white" />,
    iconWrapper:
      "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 border border-emerald-400/50",
    headerBg:
      "bg-gradient-to-b from-emerald-50/30 to-transparent dark:from-emerald-950/20",
    title: "Connection OK",
    description:
      "The database cluster is reachable and operating normally. You're good to go.",
    alert: {
      box: "border-emerald-100/80 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20",
      icon: (
        <CheckCircle2
          size={18}
          className="shrink-0 text-emerald-600 dark:text-emerald-400"
        />
      ),
      text: "text-emerald-800 dark:text-emerald-300",
      message: "All systems are currently operational as expected.",
    },
    showReload: true,
    pingColor: "bg-emerald-400",
    pingBg: "bg-emerald-500",
    statusLabel: "All Systems Operational",
  },
  degraded: {
    icon: <DatabaseZap size={24} className="text-white" />,
    iconWrapper:
      "bg-gradient-to-br from-rose-500 to-rose-700 shadow-lg shadow-rose-500/30 border border-rose-500/50",
    headerBg:
      "bg-gradient-to-b from-rose-50/50 to-transparent dark:from-rose-950/20",
    title: "Connection Interrupted",
    description:
      "Our monitoring system detected a database outage. Sensitive dashboards are locked to protect data.",
    alert: {
      box: "border-rose-100/80 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20",
      icon: (
        <ShieldAlert
          size={18}
          className="shrink-0 text-rose-600 dark:text-rose-400"
        />
      ),
      text: "text-rose-800 dark:text-rose-300",
      message:
        "Auto-reconnect is active. The system will restore access once the cluster is reachable.",
    },
    showReload: true,
    pingColor: "bg-rose-400",
    pingBg: "bg-rose-500",
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
    <ClientPortal>
      {/*  Backdrop blur to match the app's premium feel */}
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-md transition-all">
        {/* Modal Container: Extra rounded, glassmorphism border, soft deep shadow */}
        <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-all duration-500 dark:border-neutral-700/60 dark:bg-neutral-900/80 dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)]">
          {/* Header Section */}
          <div
            className={`relative px-8 pt-10 pb-6 text-center transition-colors duration-500 ${config.headerBg}`}
          >
            {!isDashboard && (
              <button
                onClick={hideOverlay}
                aria-label="Close overlay"
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 transition-all hover:scale-105 hover:bg-neutral-200 hover:text-neutral-700 active:scale-95 dark:bg-neutral-800 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            )}

            {/* Elevated Icon Avatar */}
            <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center">
              {/* Soft background pulse behind the icon for degraded/ok states */}
              {status !== "checking" && (
                <div
                  className={`absolute inset-0 animate-ping rounded-full opacity-20 ${config.iconWrapper.split(" ")[0]}`}
                />
              )}
              <div
                className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 ${config.iconWrapper}`}
              >
                {config.icon}
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {config.title}
            </h2>
            <p className="mx-auto mt-2 max-w-70 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              {config.description}
            </p>
          </div>

          {/* Content Section */}
          <div className="px-8 pt-2 pb-8">
            {/* Information Pill */}
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors duration-500 ${config.alert.box}`}
            >
              <div className="mt-0.5">{config.alert.icon}</div>
              <p
                className={`text-[13px] leading-relaxed font-medium ${config.alert.text}`}
              >
                {config.alert.message}
              </p>
            </div>

            <div className="mt-8 space-y-5">
              {config.showReload && (
                <button
                  onClick={() => window.location.reload()}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-br from-neutral-800 to-neutral-900 py-3.5 text-[14px] font-bold text-white shadow-md transition-all hover:shadow-xl hover:shadow-neutral-900/20 active:scale-[0.98] dark:from-neutral-100 dark:to-neutral-200 dark:text-neutral-900 dark:hover:shadow-white/10"
                >
                  <RefreshCcw
                    size={16}
                    className="transition-transform duration-500 group-hover:rotate-180"
                  />
                  Reload Application
                </button>
              )}

              {/* Status Ping */}
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
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
    </ClientPortal>
  );
}
