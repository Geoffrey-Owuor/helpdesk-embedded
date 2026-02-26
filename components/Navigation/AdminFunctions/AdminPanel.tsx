"use client";

import { X, Bug, ShieldCheck, UsersRound, RotateCcw } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import AgentsInfo from "./AgentsInfo";
import IssueTypesInfo from "./IssueTypesInfo";
import ClientPortal from "@/components/Modules/ClientPortal";
import { useAgentsInfo } from "@/contexts/AgentsInfoContext";
import { handleRefetchIssueAgentsData } from "@/serverActions/refetchIssueAgentsData";
import { usePromiseOverlay } from "@/contexts/PromiseOverlayContext";

type AdminPanelProps = {
  showAdminPanel: boolean;
  setShowAdminPanel: Dispatch<SetStateAction<boolean>>;
};

type TabId = "agent-info" | "issue-info";

const AdminPanel = ({ showAdminPanel, setShowAdminPanel }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("agent-info");
  const { refetchAgentsInfo } = useAgentsInfo();
  const { setPromiseOverlayInfo } = usePromiseOverlay();

  // Refetch agents and issue types data
  const handleRefetchIssueAgents = async () => {
    // Show our promise overlay
    setPromiseOverlayInfo({
      loading: true,
      overlaytext: "Refreshing",
    });

    // We call our server action here
    await handleRefetchIssueAgentsData();

    // After it's complete - we hide our promise overlay
    setPromiseOverlayInfo({
      loading: false,
      overlaytext: "",
    });

    // refetch data after revalidation
    refetchAgentsInfo();
  };

  if (!showAdminPanel) return null;

  // Shared button styles
  const baseTabStyles =
    "flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-xl";
  const activeTabStyles =
    "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm";
  const inactiveTabStyles =
    "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-700 dark:hover:text-neutral-300";

  // Mobile shared button base styles
  const baseMobileTabStyles =
    "flex items-center gap-2 px-3 py-2 font-semibold text-sm transition-all duration-200 rounded-xl";

  return (
    <ClientPortal>
      {/* The Backdrop */}
      <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        {/* Modal Container */}
        <div className="flex h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          {/* --- LEFT SIDEBAR --- */}
          <aside className="hidden w-60 flex-col border-r border-neutral-200 bg-neutral-50/50 p-4 md:flex dark:border-neutral-800 dark:bg-neutral-900/30">
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
                onClick={() => setActiveTab("issue-info")}
                className={`${baseTabStyles} ${activeTab === "issue-info" ? activeTabStyles : inactiveTabStyles}`}
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
            {/* Header and mobile buttons navigation */}
            <div className="flex flex-col gap-3 border-b border-neutral-100 pb-4 dark:border-neutral-900">
              <header className="flex items-center justify-between px-4 pt-4">
                <h3 className="text-sm font-semibold text-neutral-500 capitalize dark:text-neutral-400">
                  {activeTab.replace("-", " ")}
                </h3>
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleRefetchIssueAgents}
                    title="Refresh"
                    className="rounded-full p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                  >
                    <RotateCcw size={20} />
                  </button>
                  <button
                    onClick={() => setShowAdminPanel(false)}
                    className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              </header>
              {/* Mobile Admin Navigation - Hidden on laptops */}
              <div className="flex items-center justify-center gap-2 md:hidden">
                {/* Agents Info */}
                <button
                  onClick={() => setActiveTab("agent-info")}
                  className={`${baseMobileTabStyles} ${activeTab === "agent-info" ? activeTabStyles : inactiveTabStyles}`}
                >
                  <UsersRound className="h-4 w-4" />
                  Agents Info
                </button>
                {/* Issue Types Info */}
                <button
                  onClick={() => setActiveTab("issue-info")}
                  className={`${baseMobileTabStyles} ${activeTab === "issue-info" ? activeTabStyles : inactiveTabStyles}`}
                >
                  <Bug className="h-4 w-4" />
                  Issue Types Info
                </button>
              </div>
            </div>

            {/* Tab Content Rendering */}
            <main className="flex-1 overflow-y-auto p-6">
              {activeTab === "agent-info" && <AgentsInfo />}

              {activeTab === "issue-info" && <IssueTypesInfo />}
            </main>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

export default AdminPanel;
