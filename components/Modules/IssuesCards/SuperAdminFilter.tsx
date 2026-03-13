"use client";
import { useState } from "react";
import { ShieldPlus } from "lucide-react";

export default function SuperAdminFilter() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-2 transition-colors duration-200 dark:border-neutral-700">
      {/* Icon */}
      <ShieldPlus
        size={18}
        className={`transition-colors duration-200 ${
          enabled
            ? "text-neutral-900 dark:text-neutral-100"
            : "text-neutral-400 dark:text-neutral-500"
        }`}
      />

      {/* Label */}
      <span
        className={`text-sm font-medium tracking-wide transition-colors duration-200 select-none ${
          enabled
            ? "text-neutral-900 dark:text-neutral-100"
            : "text-neutral-400 dark:text-neutral-500"
        }`}
      >
        All Issues
      </span>

      {/* Toggle pill */}
      <button
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle super-admin filter"
        onClick={() => setEnabled((prev) => !prev)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none dark:focus-visible:ring-neutral-400 dark:focus-visible:ring-offset-neutral-900 ${
          enabled
            ? "bg-neutral-800 dark:bg-neutral-100"
            : "bg-neutral-200 dark:bg-neutral-700"
        } `}
      >
        {/* Sliding circle */}
        <span
          className={`absolute left-1 h-4 w-4 rounded-full shadow-md transition-transform duration-200 ease-in-out ${
            enabled
              ? "translate-x-5 bg-white dark:bg-neutral-900"
              : "translate-x-0 bg-neutral-400 dark:bg-neutral-300"
          } `}
        />
      </button>
    </div>
  );
}
