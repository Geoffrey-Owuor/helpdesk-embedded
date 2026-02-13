"use client";

import { X, Bug, ShieldCheck, UsersRound } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import AgentsInfo from "./AgentsInfo";
import IssueTypesInfo from "./IssueTypesInfo";

type AdminPanelProps = {
  showAdminPanel: boolean;
  setShowAdminPanel: Dispatch<SetStateAction<boolean>>;
};

type TabId = "agent-info" | "issue-type-info";

const AdminPanel = ({ showAdminPanel, setShowAdminPanel }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("agent-info");

  if (!showAdminPanel) return null;

  // Shared button styles
  const baseTabStyles =
    "flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-xl";
  const activeTabStyles =
    "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm";
  const inactiveTabStyles =
    "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-700 dark:hover:text-neutral-300";

  return (
    //  Backdrop
    <div className="custom-blur fixed inset-0 z-70 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="flex h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
        {/* --- LEFT SIDEBAR --- */}
        <aside className="hidden w-64 flex-col border-r border-neutral-200 bg-neutral-50/50 p-4 md:flex dark:border-neutral-800 dark:bg-neutral-900/30">
          <div className="mb-8 flex items-center gap-2 px-2">
            <ShieldCheck
              className="text-blue-600 dark:text-blue-500"
              size={22}
            />
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Admin Panel
            </h2>
          </div>

          <nav className="flex-1 space-y-1">
            <button
              onClick={() => setActiveTab("agent-info")}
              className={`${baseTabStyles} ${activeTab === "agent-info" ? activeTabStyles : inactiveTabStyles}`}
            >
              <UsersRound size={18} />
              Agents Info
            </button>

            <button
              onClick={() => setActiveTab("issue-type-info")}
              className={`${baseTabStyles} ${activeTab === "issue-type-info" ? activeTabStyles : inactiveTabStyles}`}
            >
              <Bug size={18} />
              Issue Types Info
            </button>
          </nav>

          <div className="mt-auto border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <p className="px-2 text-[10px] tracking-widest text-neutral-400 uppercase">
              IssueDesk v1.0
            </p>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-950">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-500 capitalize dark:text-neutral-400">
              {activeTab.replace("-", " ")}
            </h3>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              <X size={20} />
            </button>
          </header>

          {/* Tab Content Rendering */}
          <main className="flex-1 overflow-y-auto p-6">
            {activeTab === "agent-info" && <AgentsInfo />}

            {activeTab === "issue-type-info" && <IssueTypesInfo />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
