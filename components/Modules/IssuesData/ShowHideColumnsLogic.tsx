"use client";
import { Columns2, ChevronDown } from "lucide-react";

const ShowHideColumnsLogic = () => {
  return (
    <button className="flex h-9.5 items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-100 px-3 text-neutral-900 hover:bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-white dark:hover:bg-neutral-700/50">
      <Columns2 strokeWidth={1} className="h-4.5 w-4.5" />
      <span>
        <span className="hidden sm:inline-flex">Show/Hide</span> Columns
      </span>
      <ChevronDown className="h-4 w-4" />
    </button>
  );
};

export default ShowHideColumnsLogic;
