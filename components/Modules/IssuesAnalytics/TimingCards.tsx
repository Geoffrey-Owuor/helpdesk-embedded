import { Timer, Hourglass } from "lucide-react";
import StatTile from "./StatTile";
import { formatSecondsDuration } from "./formatSecondsDuration";

const TimingCards = ({
  avgResolutionSeconds,
  avgStaleSeconds,
  isLoading,
}: {
  avgResolutionSeconds: number | null;
  avgStaleSeconds: number | null;
  isLoading: boolean;
}) => {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatTile
        label="Avg. Resolution Time"
        value={formatSecondsDuration(avgResolutionSeconds)}
        icon={Timer}
        color="text-teal-600 dark:text-teal-400"
        bgColor="bg-teal-100 dark:bg-teal-900/30"
        borderColor="border-teal-200 dark:border-teal-800/50"
        isLoading={isLoading}
      />
      <StatTile
        label="Avg. Stale Time"
        value={formatSecondsDuration(avgStaleSeconds)}
        icon={Hourglass}
        color="text-orange-600 dark:text-orange-400"
        bgColor="bg-orange-100 dark:bg-orange-900/30"
        borderColor="border-orange-200 dark:border-orange-800/50"
        isLoading={isLoading}
      />
    </section>
  );
};

export default TimingCards;
