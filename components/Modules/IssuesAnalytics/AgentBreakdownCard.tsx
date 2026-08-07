import { Headset } from "lucide-react";
import BreakdownListCard from "./BreakdownListCard";
import { AgentBreakdownEntry } from "./types";

const AgentBreakdownCard = ({
  agentBreakdown,
  isLoading,
}: {
  agentBreakdown: AgentBreakdownEntry[];
  isLoading: boolean;
}) => (
  <BreakdownListCard
    title="Issues per Agent"
    icon={Headset}
    iconColor="text-indigo-600 dark:text-indigo-400"
    iconBgColor="bg-indigo-50 dark:bg-indigo-900/20"
    entries={agentBreakdown.map(({ agentName, count }) => ({
      label: agentName,
      count,
    }))}
    isLoading={isLoading}
    emptyMessage="No assigned agents match the current filters."
  />
);

export default AgentBreakdownCard;
