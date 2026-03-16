"use client";

import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import {
  Check,
  ChevronDown,
  UserRound,
  Bug,
  Save,
  ArrowUpDown,
} from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAlertStore } from "@/store/useAlertStore";
import FormAsterisk from "@/components/Modules/FormAsterisk";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { priorityOptions } from "@/components/Modules/IssuePage/IssuePage";

type EditIssueTypeInfoProps = {
  issueType: string;
  issuePriority: string;
  agentNames: { agentName: string; agentEmail: string }[];
  agentEmail: string;
  refetchAgentsInfo: () => Promise<void>;
  setActiveEditId: Dispatch<SetStateAction<string | null>>;
};

const EditIssueTypeInfo = ({
  issueType,
  issuePriority,
  agentNames,
  agentEmail,
  refetchAgentsInfo,
  setActiveEditId,
}: EditIssueTypeInfoProps) => {
  const [selectedType, setSelectedType] = useState(issueType || "");
  const [selectedPriority, setSelectedPriority] = useState(issuePriority || "");
  const [selectedEmail, setSelectedEmail] = useState(agentEmail || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);

  // State stores
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropDownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Agents dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      // Priority dropdown
      if (
        priorityDropDownRef.current &&
        !priorityDropDownRef.current.contains(event.target as Node)
      ) {
        setIsPriorityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // get agent name from the mapping to display in the button
  const selectedNameObject = agentNames.find(
    (agentInfo) => agentInfo.agentEmail === selectedEmail,
  );

  const selectedName = selectedNameObject?.agentName;

  const handleUpdate = async () => {
    hideDialog();

    // Do nothing if no data has changed
    if (
      (agentEmail === selectedEmail &&
        issueType === selectedType &&
        issuePriority === selectedPriority) ||
      !selectedEmail ||
      !selectedType ||
      !selectedPriority
    ) {
      triggerAlert("error", "Missing required info or same information passed");
      return;
    }

    showOverlay("Updating");

    try {
      const response = await apiClient.put("/update-issuetype", {
        selectedEmail,
        selectedType,
        issueType,
        selectedPriority,
      });

      // Trigger alert on success
      triggerAlert("success", response.data.message);

      // Close the EditIssueTypeInfo Modal
      setActiveEditId(null);
      // refetch info data
      refetchAgentsInfo();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);

      console.error(
        "Erro while trying to update the issue info:",
        errorMessage,
      );

      // Trigger alert on error
      triggerAlert("error", errorMessage);
    } finally {
      hideOverlay();
    }
  };

  const handleConfirmationDialog = () => {
    triggerDialog({
      title: "Edit Issue Type Info",
      description: "Confirm editing of issue info.",
      onConfirm: handleUpdate,
    });
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/60">
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            onBlur={(e) => setSelectedType(e.target.value.trim())}
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
              <div className="default-scrollbar absolute left-0 z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                {agentNames.map((agent) => (
                  <button
                    key={agent.agentEmail}
                    onClick={() => {
                      setSelectedEmail(agent.agentEmail);
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

        {/* Priority selection Dropdown */}
        <div className="space-y-1.5" ref={priorityDropDownRef}>
          <label className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            <ArrowUpDown size={12} />
            <div className="inline-flex items-center gap-1">
              <span>Issue Priority</span>
              <FormAsterisk />
            </div>
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <span
                className={
                  selectedName
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-400"
                }
              >
                {selectedPriority || "Select a priority"}
              </span>
              <ChevronDown
                size={16}
                className={`text-neutral-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isPriorityDropdownOpen && (
              <div className="default-scrollbar absolute left-0 z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                {priorityOptions.map((priority) => (
                  <button
                    key={priority.value}
                    onClick={() => {
                      setSelectedPriority(priority.value);
                      setIsPriorityDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <span className="text-neutral-900 dark:text-neutral-100">
                      {priority.label}
                    </span>
                    {selectedPriority === priority.value && (
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
            onClick={handleConfirmationDialog}
            disabled={
              (agentEmail === selectedEmail &&
                issueType === selectedType &&
                issuePriority === selectedPriority) ||
              !selectedEmail ||
              !selectedType ||
              !selectedPriority
            } //We will also repeat this logic in our handleUpdate function for double security
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
          >
            <Save size={16} />
            Update Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditIssueTypeInfo;
