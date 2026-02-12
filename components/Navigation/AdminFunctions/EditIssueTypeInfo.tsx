"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, UserRound, Bug, Save } from "lucide-react";

type EditIssueTypeInfoProps = {
  issueType: string;
  agentNames: { agentName: string; agentEmail: string }[];
  agentEmail: string;
};

const EditIssueTypeInfo = ({
  issueType,
  agentNames,
  agentEmail,
}: EditIssueTypeInfoProps) => {
  const [selectedType, setSelectedType] = useState(issueType || "");
  const [selectedEmail, setSelectedEmail] = useState(agentEmail || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // get agent name from the mapping to display in the button
  const selectedNameObject = agentNames.find(
    (agentInfo) => agentInfo.agentEmail === selectedEmail,
  );

  const selectedName = selectedNameObject?.agentName;

  const handleUpdate = () => {
    // log the agent email and the data we will be passing to our api
    console.log(selectedEmail);
    console.log("Original Issue Type:", issueType);
    console.log("Edited Issue Type:", selectedType);
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="grid gap-5">
        {/* 1. Issue Type Input */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            <Bug size={12} />
            Issue Type Name
          </label>
          <input
            type="text"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-blue-500"
            placeholder="e.g. Technical Support"
          />
        </div>

        {/* 2. Agent Selection Dropdown */}
        <div className="space-y-1.5" ref={dropdownRef}>
          <label className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            <UserRound size={12} />
            Assigned Agent
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
                      setSelectedEmail(agent.agentEmail);
                      setIsDropdownOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
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
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleUpdate}
            disabled={
              agentEmail === selectedEmail && issueType === selectedType
            } //We will also repeat this logic in our handleUpdate function for double security
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
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
