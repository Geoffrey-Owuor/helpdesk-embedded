import { Tags } from "lucide-react";
import BreakdownListCard from "./BreakdownListCard";
import { IssueTypeBreakdownEntry } from "./types";

const IssueTypeBreakdownCard = ({
  issueTypeBreakdown,
  isLoading,
}: {
  issueTypeBreakdown: IssueTypeBreakdownEntry[];
  isLoading: boolean;
}) => (
  <BreakdownListCard
    title="Issue Types Breakdown"
    icon={Tags}
    iconColor="text-blue-600 dark:text-blue-400"
    iconBgColor="bg-blue-50 dark:bg-blue-900/20"
    entries={issueTypeBreakdown.map(({ issueType, count }) => ({
      label: issueType,
      count,
    }))}
    isLoading={isLoading}
    emptyMessage="No issue types match the current filters."
  />
);

export default IssueTypeBreakdownCard;
