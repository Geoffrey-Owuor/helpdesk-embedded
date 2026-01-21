"use client";
import { ChevronDown, Asterisk } from "lucide-react";
import { ChangeEvent } from "react";

// Example of issue mapping
const iTIssues = [
  { value: "Orion", label: "Orion" },
  { value: "POS", label: "POS" },
  { value: "Tech Support", label: "Tech Support" },
  { value: "Wi-Fi", label: "Wi-Fi" },
  { value: "Automation", label: "Automation" },
  { value: "Accessories", label: "Accessories" },
];

const financeIssues = [
  { value: "Invoicing", label: "Invoicing" },
  { value: "Petty Cash", label: "Petty Cash" },
  { value: "Reports", label: "Reports" },
  { value: "Analysis", label: "Analysis" },
  { value: "Documents", label: "Documents" },
];

type DynamicTypeProps = {
  value: string;
  handleChange: (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  department: string;
};

const DynamicIssueTypes = ({
  value,
  handleChange,
  department,
}: DynamicTypeProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="issue_type"
        className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
      >
        Issue Type
        <Asterisk className="h-3 w-3 text-red-500" />
      </label>
      <div className="relative">
        <select
          id="issue_type"
          value={value}
          onChange={handleChange}
          required
          name="issue_type"
          className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        >
          <option value="" disabled>
            Select a type...
          </option>
          {department === "IT & Projects" && (
            <>
              {iTIssues.map((issue, index) => (
                <option key={index} value={issue.value}>
                  {issue.label}
                </option>
              ))}
            </>
          )}
          {department === "Finance" && (
            <>
              {financeIssues.map((issue, index) => (
                <option key={index} value={issue.value}>
                  {issue.label}
                </option>
              ))}
            </>
          )}
        </select>
        {/* Lucide Chevron Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
};

export default DynamicIssueTypes;
