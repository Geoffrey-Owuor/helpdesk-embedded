"use client";

import {
  ArrowUpDown,
  Bug,
  Check,
  ChevronDown,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAlertStore } from "@/store/useAlertStore";
import FormAsterisk from "@/components/Modules/FormAsterisk";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { priorityOptions } from "@/public/assets";
import { RefetchFunction } from "./AgentsInfo";

type AddIssueTypeProps = {
  showAddIssueModal: boolean;
  refetchAgentsInfo: RefetchFunction;
  setShowAddIssueModal: Dispatch<SetStateAction<boolean>>;
  agentNames: { agentName: string; agentEmail: string }[];
};

const AddIssueType = ({
  showAddIssueModal,
  setShowAddIssueModal,
  refetchAgentsInfo,
  agentNames,
}: AddIssueTypeProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [longName, setLongName] = useState("");
  const [issuePriority, setIssuePriority] = useState("");
  const [agentEmail, setAgentEmail] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropDownRef = useRef<HTMLDivElement>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized filtered agents
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agentNames;

    const query = searchQuery.toLowerCase().trim();

    return agentNames.filter(
      (agent) =>
        agent.agentName.toLowerCase().includes(query) ||
        agent.agentEmail.toLowerCase().includes(query),
    );
  }, [agentNames, searchQuery]);

  // state stores
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  // get agent name from the mapping to display in the button
  const selectedNameObject = agentNames.find(
    (agentInfo) => agentInfo.agentEmail === agentEmail,
  );

  const selectedName = selectedNameObject?.agentName;

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

  //Handle submit function
  const handleSubmit = async () => {
    hideDialog();

    if (!issueType || !agentEmail || !issuePriority) {
      triggerAlert("error", "Missing some required form information");

      return;
    }

    showOverlay("Adding");

    try {
      const response = await apiClient.post("/add-issuetype", {
        issueType,
        longName,
        issuePriority,
        agentEmail,
      });

      // Hide the overlay
      hideOverlay();

      //close the modal
      setShowAddIssueModal(false);

      //refetch agents data
      await refetchAgentsInfo();

      // Trigger alert on success
      triggerAlert("success", response.data.message);
    } catch (error) {
      hideOverlay();
      const errorMessage = getApiErrorMessage(error);

      // Trigger alert on error
      triggerAlert("error", errorMessage);

      console.error("Error while trying to add the issue type:", error);
    }
  };

  const handleConfirmSubmit = () => {
    triggerDialog({
      title: "Add Issue Type",
      description: `Confirm adding of new issue type: ${issueType}`,
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
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-blue-500"
            placeholder="e.g. Technical Support"
          />
        </div>

        {/* 1b. Display Name Input */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            <Bug size={12} />
            <span>Display Name</span>
          </label>
          <input
            type="text"
            value={longName}
            onChange={(e) => setLongName(e.target.value)}
            onBlur={(e) => setLongName(e.target.value.trim())}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-blue-500"
            placeholder="Friendly name shown to users (defaults to Issue Type)"
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
              className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
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
              <div className="absolute left-0 z-20 mt-1 w-full rounded-xl border border-neutral-200 bg-white px-1 py-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                {/* SEARCH INPUT - Search threshold of six*/}
                {agentNames.length >= 6 && (
                  <div className="relative px-1 pb-2">
                    <div className="relative flex items-center">
                      <Search className="absolute left-2.5 h-3.5 w-3.5 text-neutral-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Agents"
                        className="w-full rounded-full border border-neutral-200 bg-neutral-100 py-2 pr-8 pl-8 text-xs text-neutral-900 placeholder-neutral-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-blue-500 dark:focus:bg-neutral-950/50"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2 rounded-full p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="default-scrollbar max-h-48 overflow-y-auto">
                  {filteredAgents.length > 0 ? (
                    filteredAgents.map((agent) => (
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
                    ))
                  ) : (
                    /* Fallback state when no options exist */
                    <div className="px-3 py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
                      {searchQuery
                        ? "No matching results found."
                        : `No agents found`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Priority Selection Dropdown */}
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
              className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm transition-all hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <span
                className={
                  issuePriority
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-400"
                }
              >
                {issuePriority || "Select a priority"}
              </span>
              <ChevronDown
                size={16}
                className={`text-neutral-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isPriorityDropdownOpen && (
              <div className="default-scrollbar absolute left-0 z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                {priorityOptions.map((priority) => (
                  <button
                    key={priority.value}
                    onClick={() => {
                      setIssuePriority(priority.value);
                      setIsPriorityDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <span className="text-neutral-900 dark:text-neutral-100">
                      {priority.label}
                    </span>

                    {issuePriority === priority.value && (
                      <Check size={14} className="text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleConfirmSubmit}
            disabled={!issueType || !agentEmail || !issuePriority} //We will also repeat this logic in our handleSubmit function for double security
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
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
