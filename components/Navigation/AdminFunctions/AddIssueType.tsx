"use client";

import { Bug, Check, ChevronDown, Plus, UserRound } from "lucide-react";
import { useEffect, useState, useRef, Dispatch, SetStateAction } from "react";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAlert } from "@/contexts/AlertContext";
import { useAgentsInfo } from "@/contexts/AgentsInfoContext";
import FormAsterisk from "@/components/Modules/FormAsterisk";
import { useConfirmationDialog } from "@/contexts/ConfirmationDialogContext";
import { usePromiseOverlay } from "@/contexts/PromiseOverlayContext";

type AddIssueTypeProps = {
  showAddIssueModal: boolean;
  setShowAddIssueModal: Dispatch<SetStateAction<boolean>>;
  agentNames: { agentName: string; agentEmail: string }[];
};
const AddIssueType = ({
  showAddIssueModal,
  setShowAddIssueModal,
  agentNames,
}: AddIssueTypeProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setAlertInfo } = useAlert();
  const { setConfirmationDialogInfo } = useConfirmationDialog();
  const { setPromiseOverlayInfo } = usePromiseOverlay();
  const { refetchAgentsInfo } = useAgentsInfo();

  // get agent name from the mapping to display in the button
  const selectedNameObject = agentNames.find(
    (agentInfo) => agentInfo.agentEmail === agentEmail,
  );

  const selectedName = selectedNameObject?.agentName;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //Handle submit function
  const handleSubmit = async () => {
    setConfirmationDialogInfo((prev) => ({
      ...prev,
      showDialog: false,
    }));

    if (!issueType || !agentEmail) {
      setAlertInfo({
        showAlert: true,
        alertType: "error",
        alertMessage: "Missing some required form information",
      });

      return;
    }

    setPromiseOverlayInfo({
      loading: true,
      overlaytext: "Adding",
    });

    try {
      const response = await apiClient.post("/add-issuetype", {
        issueType,
        agentEmail,
      });

      // show alert on success
      setAlertInfo({
        showAlert: true,
        alertType: "success",
        alertMessage: response.data.message || "Issue type added successfully",
      });

      //refetch agents data
      refetchAgentsInfo();

      //close the modal
      setShowAddIssueModal(false);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      setAlertInfo({
        showAlert: true,
        alertType: "error",
        alertMessage: errorMessage,
      });

      console.error("Error while trying to add the issue type:", error);
    } finally {
      setPromiseOverlayInfo({
        loading: false,
        overlaytext: "",
      });
    }
  };

  const handleConfirmSubmit = () => {
    setConfirmationDialogInfo({
      showDialog: true,
      title: "Add Issue Type",
      description: "Are you sure you want to add this issue type?",
      onConfirm: handleSubmit,
    });
  };

  if (!showAddIssueModal) return null;

  return (
    <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="grid gap-5">
        {/* 1. Issue Type Input */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            <Bug size={12} />
            <div className="inline-flex items-center gap-1">
              <span>Issue Type Name</span>
              <FormAsterisk />
            </div>
          </label>
          <input
            type="text"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            onBlur={(e) => setIssueType(e.target.value.trim())}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-blue-500"
            placeholder="e.g. Technical Support"
          />
        </div>

        {/* 2. Agent Selection Dropdown */}
        <div className="space-y-1.5" ref={dropdownRef}>
          <label className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            <UserRound size={12} />
            <div className="inline-flex items-center gap-1">
              <span>Assigned Agent</span>
              <FormAsterisk />
            </div>
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <span
                className={
                  selectedName
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-400"
                }
              >
                {selectedName || "Select an agent"}
              </span>
              <ChevronDown
                size={16}
                className={`text-neutral-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                {agentNames.map((agent) => (
                  <button
                    key={agent.agentEmail}
                    onClick={() => {
                      setAgentEmail(agent.agentEmail);
                      setIsDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {agent.agentName}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {agent.agentEmail}
                      </span>
                    </div>
                    {selectedName === agent.agentName && (
                      <Check size={14} className="text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={handleConfirmSubmit}
            disabled={!issueType || !agentEmail} //We will also repeat this logic in our handleSubmit function for double security
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddIssueType;
