"use client";

import { useState, type ReactNode } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "./Modal/Modal";

// Counts committed filters for the "Filters (n)" badge; a from/to date pair
// counts once, matching how the filter pills display it
export const countActiveFilters = <T extends object>(committed: T | null) => {
  if (!committed) return 0;
  const keys = Object.entries(committed)
    .filter(([, value]) => !!value)
    .map(([key]) => key);
  const hasDate = keys.includes("fromDate") || keys.includes("toDate");
  return (
    keys.filter((key) => key !== "fromDate" && key !== "toDate").length +
    (hasDate ? 1 : 0)
  );
};

type MobileFilterBarProps = {
  title: string;
  activeCount: number;
  // Every field is shown at once in the sheet (desktop shows one at a time)
  fields: { key: string; label: string; control: ReactNode }[];
  // Extra controls rendered under the fields, e.g. toggle chips
  extra?: ReactNode;
  pills?: ReactNode;
  onApply: () => void;
  onReset: () => void;
};

// Phone replacement for the sticky desktop filter panels: a single compact row
// that opens all filters in a full-screen sheet
const MobileFilterBar = ({
  title,
  activeCount,
  fields,
  extra,
  pills,
  onApply,
  onReset,
}: MobileFilterBarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 sm:hidden">
      <div className="sticky top-0 z-50 flex items-center gap-2 bg-white py-2 dark:bg-black">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white text-sm font-medium text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            aria-label="Reset filters"
            className="flex h-11 items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>

      {pills}

      <Modal open={isOpen} onClose={() => setIsOpen(false)} size="md">
        <ModalHeader title={title} />

        <ModalBody className="flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                {field.label}
              </span>
              {field.control}
            </div>
          ))}
          {extra}
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={onReset}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              onApply();
              setIsOpen(false);
            }}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-neutral-900 px-4 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Search className="h-4 w-4" />
            Apply Filters
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default MobileFilterBar;
