"use client";

import { useState } from "react";
import Link from "next/link";
import UserManual from "./UserManual";
import BugReport from "./BugReport";
import { ArrowLeft, BookOpen, Bug } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Section = "user-manual" | "bug-report";

// ─────────────────────────────────────────────
// Main Manual Page
// ─────────────────────────────────────────────

const navItems = [
  {
    id: "user-manual",
    label: "User Manual",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    id: "bug-report",
    label: "Report a Bug",
    icon: <Bug className="h-4 w-4" />,
  },
];

const Manual = () => {
  const [activeSection, setActiveSection] = useState<Section>("user-manual");

  const scrollTo = (id: Section) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="layout-scrollbar h-screen overflow-y-auto bg-white dark:bg-neutral-950">
      <div className="custom:px-8 mx-auto max-w-6xl px-6 py-16 2xl:max-w-7xl">
        {/* Page header */}
        <div className="mb-12">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl dark:text-white">
            Documentation
          </h1>
          <p className="mt-3 max-w-2xl text-base text-neutral-500 dark:text-neutral-400">
            Learn how to use IssueDesk and help us improve it by reporting any
            encountered bugs.
          </p>
        </div>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Sticky sidebar nav */}
          <aside className="shrink-0 lg:w-52">
            <div className="sticky top-8">
              <p className="mb-3 text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-600">
                Sections
              </p>
              <nav className="flex flex-row gap-2 lg:flex-col">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id as Section)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      activeSection === item.id
                        ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-20">
            <UserManual />
            <BugReport />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Manual;
