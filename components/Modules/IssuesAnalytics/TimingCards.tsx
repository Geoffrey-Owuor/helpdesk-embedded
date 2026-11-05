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
        isLoading={isLoading}
      />
      <StatTile
        label="Avg. TAT Time"
        value={formatSecondsDuration(avgResolutionSeconds)}
        icon={Timer}
        isLoading={isLoading}
      />
      <StatTile
        label="Avg. Stale Time"
        value={formatSecondsDuration(avgStaleSeconds)}
        icon={Hourglass}
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
        isLoading={isLoading}
      />
    </section>
  );
};

export default TimingCards;
