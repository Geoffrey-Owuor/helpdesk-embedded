import { Tags } from "lucide-react";
import TimingBreakdownCard from "./TimingBreakdownCard";
import { IssueTypeBreakdownEntry } from "./types";

const IssueTypeTimingCard = ({
  issueTypeBreakdown,
  isLoading,
}: {
  issueTypeBreakdown: IssueTypeBreakdownEntry[];
  isLoading: boolean;
}) => (
  <TimingBreakdownCard
    title="Issue Type TAT"
    icon={Tags}
    entries={issueTypeBreakdown.map(
      ({ issueType, avgResolutionSeconds, avgStaleSeconds }) => ({
        label: issueType,
        avgResolutionSeconds,
        avgStaleSeconds,
      }),
    )}
    isLoading={isLoading}
    emptyMessage="No issue types match the current filters."
  />
);

export default IssueTypeTimingCard;
