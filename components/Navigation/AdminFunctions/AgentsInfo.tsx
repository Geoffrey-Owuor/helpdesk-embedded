"use client";

import { Mail, Tag, Info, UserRoundPlus, Trash2 } from "lucide-react";
import { arrayReducer } from "@/utils/ArrayReducer";
import { abbreviateUserName } from "@/public/assets";
import AgentsInfoSkeleton from "@/components/Skeletons/AgentsInfoSkeleton";
import { useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import AddAgent from "./AddAgent";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useAlertStore } from "@/store/useAlertStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { IssueAgents } from "@/serverActions/GetIssueAgents";
import SearchInput from "@/components/Modules/SuperAdmin/SearchInput";

export type RefetchFunction = () => Promise<void>;

export type AgentsInfoProps = {
  loading: boolean;
  agentsFlatInfo: IssueAgents[];
  refetchAgentsInfo: RefetchFunction;
};

const AgentsInfo = ({
  loading,
  agentsFlatInfo,
  refetchAgentsInfo,
}: AgentsInfoProps) => {
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // state stores
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const { email: adminEmail } = useUser();
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  // Grouping the flattened array
  const agentsInfo = arrayReducer(agentsFlatInfo);

  // Filtering agents by name or email
  const filteredAgentsInfo = useMemo(() => {
    if (!searchValue) return agentsInfo;
    const lowSearch = searchValue.toLowerCase();
    return agentsInfo.filter(
      (agent) =>
        agent.name.toLowerCase().includes(lowSearch) ||
        agent.email.toLowerCase().includes(lowSearch),
    );
  }, [searchValue, agentsInfo]);

  // Confirm Agent deletion
  const handleConfirmDeletion = (agentEmail: string, agentName: string) => {
    // Show confirmation dialog
    triggerDialog({
      title: "Delete Agent",
      description: `Confirm deletion of agent: ${agentName}`,
      onConfirm: () => handleDeletion(agentEmail),
    });
  };

  // Handle the real deletion
  const handleDeletion = async (agentEmail: string) => {
    // hide confirmation dialog
    hideDialog();

    // Check if we have an agent email provided
    if (!agentEmail) {
      triggerAlert("error", "Selected action has no selected agent email");
    }

    // Show the promise overlay
    showOverlay("Deleting");

    // Api call
    try {
      const response = await apiClient.delete("/delete-agent", {
        data: { agentEmail: agentEmail },
      });

      // Hide the overlay
      hideOverlay();

      // Refetch agents info on success
      await refetchAgentsInfo();

      // Trigger alert on success
      triggerAlert("success", response.data.message);
    } catch (error) {
      hideOverlay();
      const apiError = getApiErrorMessage(error);
      triggerAlert("error", apiError);

      // Log the error
      console.error("Error while deleting an agent:", apiError);
    }
  };

  if (agentsInfo.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 py-12 text-neutral-500 dark:border-neutral-800">
        <Info className="mb-2 opacity-20" size={32} />
        <p className="text-sm">No agents found in the system.</p>
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <AgentsInfoSkeleton />
      ) : (
        <div className="space-y-4">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Current Agents
            </h4>
            <p className="text-xs text-neutral-500">
              A list of all support agents and the issue categories they are
              assigned to.
            </p>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddAgentModal((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              <UserRoundPlus className="h-4 w-4" />
              <span>Add Agent</span>
            </button>

            <SearchInput
              searchValue={searchValue}
              onSearch={(value) => setSearchValue(value)}
            />
          </div>

          {/* Add Agent Modal */}
          <AddAgent
            showAgentModal={showAddAgentModal}
            refetchAgentsInfo={refetchAgentsInfo}
            setShowAgentModal={setShowAddAgentModal}
          />

          {filteredAgentsInfo.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 py-12 text-neutral-500 dark:border-neutral-800">
              <Info className="mb-2 opacity-20" size={32} />
              <p className="text-sm">No agents match your search.</p>
            </div>
          )}

          <div className="grid gap-4">
            {filteredAgentsInfo.map((agent) => (
              <div
                key={agent.email}
                className="group flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:border-neutral-700"
              >
                {/* 1. Header: Avatar & Info */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm text-white dark:bg-white dark:text-black">
                      {abbreviateUserName(agent.name)}
                    </div>
                    <div>
                      <h5 className="mb-1 text-sm leading-none font-bold text-neutral-900 dark:text-neutral-100">
                        {agent.name}
                      </h5>
                      <div className="flex items-center gap-1 text-xs text-blue-500 transition-colors">
                        <Mail size={12} />
                        <span className="max-w-35 truncate sm:max-w-none">
                          {agent.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleConfirmDeletion(agent.email, agent.name)
                    }
                    disabled={agent.email === adminEmail}
                    className="inline-flex rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 md:opacity-0 md:group-hover:opacity-100 md:disabled:opacity-0 md:group-hover:disabled:opacity-50 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                </div>

                {/* 2. Skills Section: Tag Cloud */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                    <Tag size={10} />
                    <span>Skills / Issue Types</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {agent.supported_issues.map((issue, idx) => (
                      <span
                        key={`${agent.email}-${issue}-${idx}`}
                        className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default AgentsInfo;
