"use client";

import { useState } from "react";
import Link from "next/link";
import UserManual from "./UserManual";
import IssuesDocs from "./IssuesDocs";
import BugReport from "./BugReport";
import { ArrowLeft, BookOpen, Bug, Files, FileText } from "lucide-react";
import HomeNavBar from "../Navigation/HomeNavBar";
import Footer from "./Footer";

type Section = "user-manual" | "issues-docs" | "bug-report";

const navItems = [
  {
    id: "user-manual",
    link: "#user-manual",
    label: "User Manual",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    id: "issues-docs",
    link: "#issues-docs",
    label: "Issues Docs",
    icon: <Files className="h-4 w-4" />,
  },
  {
    id: "bug-report",
    link: "#bug-report",
    label: "Report a Bug",
    icon: <Bug className="h-4 w-4" />,
  },
];

const Manual = () => {
  const [activeSection, setActiveSection] = useState<Section>("user-manual");

  return (
    <main className="layout-scrollbar home-container h-screen overflow-y-auto scroll-smooth bg-white dark:bg-neutral-950">
      <HomeNavBar />
      <div className="custom:px-8 mx-auto mb-8 max-w-6xl px-4 py-6 2xl:max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Sticky sidebar nav */}
          <aside className="shrink-0 lg:w-56">
            <div className="sticky top-20">
              {/* Identity card */}
              <div className="mb-5 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div className="p-4">
                  {/* Back link */}
                  <Link
                    href="/"
                    className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to home
                  </Link>

                  {/* Title */}
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-blue-400 dark:text-blue-500" />
                    <span className="font-mono font-semibold tracking-tight text-neutral-900 dark:text-white">
                      Docs
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Learn how to use <strong>IssueDesk</strong> and help us
                    improve it by reporting any bugs you encounter.
                  </p>
                </div>
              </div>

              {/* Section nav */}
              <p className="mb-2 px-1 text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-600">
                Sections
              </p>
              <nav className="scrollbar-hide flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    onClick={() => setActiveSection(item.id as Section)}
                    className={`flex w-auto shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all lg:w-full ${
                      activeSection === item.id
                        ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-white"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-20">
            <UserManual />
            <IssuesDocs />
            <BugReport />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default Manual;
