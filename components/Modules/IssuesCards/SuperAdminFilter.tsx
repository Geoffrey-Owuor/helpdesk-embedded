"use client";
import { ShieldPlus } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";

export default function SuperAdminFilter() {
  const enabled = useSearchStore((state) => state.superAdminFilter);
  const setEnabled = useSearchStore((state) => state.setSuperAdminFilter);

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-2 shadow-inner transition-colors duration-200 ${
        enabled
          ? "border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900"
          : "border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
      }`}
      title="View all submitted issues"
    >
      {/* Icon */}
      <ShieldPlus
        size={18}
        className={`transition-all duration-200 ${
          enabled
            ? "scale-110 text-neutral-900 dark:text-neutral-100"
            : "scale-100 text-neutral-400 dark:text-neutral-500"
        }`}
      />

      {/* Label */}
      <span
        className={`text-sm font-medium tracking-tight transition-colors duration-200 select-none ${
          enabled
            ? "text-neutral-900 dark:text-neutral-100"
            : "text-neutral-400 dark:text-neutral-500"
        }`}
      >
        All Issues
      </span>

      {/* Toggle */}
      <button
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle super-admin filter"
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-xl ring-1 transition-colors duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none dark:focus-visible:ring-neutral-400 dark:focus-visible:ring-offset-neutral-900 ${
          enabled
            ? "bg-neutral-800 ring-black/10 dark:bg-neutral-100 dark:ring-white/10"
            : "bg-neutral-200 ring-black/5 dark:bg-neutral-700 dark:ring-white/5"
        }`}
      >
        {/* Knob */}
        <span
          className={`absolute left-1 h-4 w-4 rounded-lg shadow-sm transition-all duration-300 ease-in-out ${
            enabled
              ? "translate-x-5 bg-white dark:bg-neutral-900"
              : "translate-x-0 bg-white dark:bg-neutral-300"
          }`}
        />
      </button>
    </div>
  );
}
