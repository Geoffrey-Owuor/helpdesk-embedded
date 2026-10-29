import {
  Timer,
  Hourglass,
  MessageSquareReply,
  CircleCheckBig,
} from "lucide-react";
import StatTile from "./StatTile";
import { formatSecondsDuration } from "./formatSecondsDuration";

const TimingCards = ({
  avgFirstResponseSeconds,
  avgResolutionSeconds,
  avgStaleSeconds,
  resolutionRate,
  isLoading,
}: {
  avgFirstResponseSeconds: number | null;
  avgResolutionSeconds: number | null;
  avgStaleSeconds: number | null;
  // Share of the filtered issues resolved (0-1), null when nothing matches
  resolutionRate: number | null;
  isLoading: boolean;
}) => {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Avg. First Response"
        value={formatSecondsDuration(avgFirstResponseSeconds)}
        icon={MessageSquareReply}
        color="text-sky-600 dark:text-sky-400"
        bgColor="bg-sky-100 dark:bg-sky-900/30"
        borderColor="border-sky-200 dark:border-sky-800/50"
        isLoading={isLoading}
      />
      <StatTile
        label="Avg. TAT Time"
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
      <StatTile
        label="Resolution Rate"
        value={
          resolutionRate === null
            ? "N/A"
            : `${Math.round(resolutionRate * 100)}%`
        }
        icon={CircleCheckBig}
        color="text-emerald-600 dark:text-emerald-400"
        bgColor="bg-emerald-100 dark:bg-emerald-900/30"
        borderColor="border-emerald-200 dark:border-emerald-800/50"
        isLoading={isLoading}
      />
    </section>
  );
};

export default TimingCards;
