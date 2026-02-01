import { IssueValueTypes } from "@/contexts/IssuesDataContext";
import { UserRoundCheck, UserRoundX } from "lucide-react";

interface AssignedAgentFormatterProps {
  agentName: IssueValueTypes;
}

export const AssignedAgentFormatter = ({
  agentName,
}: AssignedAgentFormatterProps) => {
  const isUnassigned = agentName === "Not Assigned";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2 py-1 text-xs font-semibold transition-colors dark:bg-neutral-800 ${
        isUnassigned
          ? "text-neutral-400 dark:text-neutral-500" // Muted for empty state
          : "text-neutral-700 dark:text-neutral-200" // Solid for assigned
      } `}
    >
      {isUnassigned ? (
        <UserRoundX className="h-3.5 w-3.5" />
      ) : (
        <UserRoundCheck className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
      )}

      <span className="max-w-30 truncate">{agentName}</span>
    </div>
  );
};
