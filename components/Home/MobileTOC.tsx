"use client";
import { ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { toId, ChangelogData } from "./ChangeLog";

// ─────────────────────────────────────────────
// Mobile Table of Contents
// ─────────────────────────────────────────────

const MobileTOC = ({ items }: { items: ChangelogData[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="sticky top-16 my-4 block lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="custom-blur flex w-full items-center justify-between bg-white/70 py-3 text-sm font-semibold text-neutral-900 transition-colors dark:bg-neutral-950/70 dark:text-white"
      >
        <div className="flex items-center gap-2">
          <Menu className="h-4 w-4 text-neutral-500" />
          <span>Table of Contents</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="layout-scrollbar bg-white-70 custom-blur absolute top-full right-0 left-0 z-30 -mx-3 flex max-h-60 flex-col overflow-y-auto px-1 shadow-lg dark:bg-neutral-950/70">
          {items.map((entry) => (
            <a
              key={entry.changelog_id}
              href={`#${toId(entry.changelog_title)}`}
              onClick={() => setIsOpen(false)} // Close menu when a link is clicked
              className="group flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300 transition-colors group-hover:bg-neutral-500 dark:bg-neutral-700 dark:group-hover:bg-neutral-400" />
              <span className="line-clamp-2 leading-snug">
                {entry.changelog_title}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileTOC;
