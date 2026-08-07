import { Headset } from "lucide-react";
import TimingBreakdownCard from "./TimingBreakdownCard";
import { AgentBreakdownEntry } from "./types";

const AgentTimingCard = ({
  agentBreakdown,
  isLoading,
}: {
  agentBreakdown: AgentBreakdownEntry[];
  isLoading: boolean;
}) => (
  <TimingBreakdownCard
    title="Agents TAT"
    icon={Headset}
    iconColor="text-indigo-600 dark:text-indigo-400"
    iconBgColor="bg-indigo-50 dark:bg-indigo-900/20"
    entries={agentBreakdown.map(
      ({ agentName, avgResolutionSeconds, avgStaleSeconds }) => ({
        label: agentName,
        avgResolutionSeconds,
        avgStaleSeconds,
      }),
    )}
    isLoading={isLoading}
    emptyMessage="No assigned agents match the current filters."
  />
);

export default AgentTimingCard;
