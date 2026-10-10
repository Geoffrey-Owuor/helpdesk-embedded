"use client";

import { Bug, ShieldCheck, UsersRound, RotateCcw } from "lucide-react";
import { useState, useCallback } from "react";
import AgentsInfo from "./AgentsInfo";
import IssueTypesInfo from "./IssueTypesInfo";
import { useUser } from "@/contexts/UserContext";
import { useQuery } from "@tanstack/react-query";
import { handleRefetchIssueAgentsData } from "@/serverActions/refetchIssueAgentsData";
import { fetchedIssueAgents } from "@/serverActions/GetIssueAgents";
import { AppVersion } from "@/public/assets";
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalIconButton,
} from "@/components/Modules/Modal/Modal";

type AdminPanelProps = {
  showAdminPanel: boolean;
  setShowAdminPanel: (open: boolean) => void;
};

type TabId = "agent-info" | "issue-info";

const AdminPanel = ({ showAdminPanel, setShowAdminPanel }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabId>("agent-info");

  const { department } = useUser();

  const closeModal = useCallback(
    () => setShowAdminPanel(false),
    [setShowAdminPanel],
  );
  const {
    data: agentsInfo = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["AgentInfo", department],
    queryFn: () => fetchedIssueAgents(department),
    enabled: !!department,
  });

  // Refetch agents and issue types data
  const handleRefetchIssueAgents = async () => {
    // We call our server action here - the below function invalidates next.js unstable_cache
    await handleRefetchIssueAgentsData();
    refetch();
  };

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
    <Modal
      open={showAdminPanel}
      onClose={closeModal}
      size="4xl"
      fixedHeight
      className="md:flex-row"
    >
      {/* --- LEFT SIDEBAR --- */}
      <aside className="hidden w-54 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50/50 p-4 md:flex dark:border-neutral-800 dark:bg-neutral-900/30">
        <div className="mb-8 flex items-center gap-2 px-2">
          <ShieldCheck className="text-blue-600 dark:text-blue-500" size={22} />
          <span className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          <button
            onClick={() => setActiveTab("agent-info")}
            className={`${baseTabStyles} ${activeTab === "agent-info" ? activeTabStyles : inactiveTabStyles}`}
          >
            <UsersRound size={18} />
            Agents
          </button>

          <button
            onClick={() => setActiveTab("issue-info")}
            className={`${baseTabStyles} ${activeTab === "issue-info" ? activeTabStyles : inactiveTabStyles}`}
          >
            <Bug size={18} />
            Issue Types
          </button>
        </nav>

        <div className="mt-auto border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <p className="px-2 text-xs tracking-widest text-neutral-400 uppercase">
            HelpDesk {AppVersion}
          </p>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ModalHeader
          title={activeTab === "agent-info" ? "Agents" : "Issue Types"}
          description={<span className="md:hidden">Admin Panel</span>}
          actions={
            <ModalIconButton
              label="Refresh"
              icon={RotateCcw}
              onClick={handleRefetchIssueAgents}
            />
          }
        />

        {/* Mobile Admin Navigation - Hidden on laptops */}
        <div className="flex shrink-0 items-center gap-2 border-b border-neutral-200 px-4 py-2 md:hidden dark:border-neutral-800">
          <button
            onClick={() => setActiveTab("agent-info")}
            className={`${baseMobileTabStyles} flex-1 justify-center ${activeTab === "agent-info" ? activeTabStyles : inactiveTabStyles}`}
          >
            <UsersRound className="h-4 w-4" />
            Agents Info
          </button>
          <button
            onClick={() => setActiveTab("issue-info")}
            className={`${baseMobileTabStyles} flex-1 justify-center ${activeTab === "issue-info" ? activeTabStyles : inactiveTabStyles}`}
          >
            <Bug className="h-4 w-4" />
            Issue Types Info
          </button>
        </div>

        {/* Tab Content Rendering */}
        <ModalBody>
          {activeTab === "agent-info" && (
            <AgentsInfo
              loading={loading}
              refetchAgentsInfo={handleRefetchIssueAgents}
              agentsFlatInfo={agentsInfo}
            />
          )}

          {activeTab === "issue-info" && (
            <IssueTypesInfo
              loading={loading}
              refetchAgentsInfo={handleRefetchIssueAgents}
              agentsFlatInfo={agentsInfo}
            />
          )}
        </ModalBody>
      </div>
    </Modal>
  );
};

export default AdminPanel;
