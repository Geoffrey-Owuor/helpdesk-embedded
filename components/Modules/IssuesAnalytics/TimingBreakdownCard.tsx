import { LucideIcon } from "lucide-react";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { formatSecondsDuration } from "./formatSecondsDuration";

export interface TimingBreakdownEntry {
  label: string;
  avgResolutionSeconds: number | null;
  avgStaleSeconds: number | null;
}

const RESOLUTION_BAR_COLOR = "bg-teal-600";
const STALE_BAR_COLOR = "bg-orange-600";

const TimingBreakdownCard = ({
  title,
  icon: Icon,
  iconColor,
  iconBgColor,
  entries,
  isLoading,
  emptyMessage,
}: {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  entries: TimingBreakdownEntry[];
  isLoading: boolean;
  emptyMessage: string;
}) => {
  const maxHours = Math.max(
    ...entries.flatMap(({ avgResolutionSeconds, avgStaleSeconds }) => [
      (avgResolutionSeconds ?? 0) / 3600,
      (avgStaleSeconds ?? 0) / 3600,
    ]),
    1,
  );

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between gap-2 px-6 py-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBgColor} ${iconColor}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          {title}
        </h2>

        {!isLoading && entries.length > 0 && (
          <div className="flex shrink-0 items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${RESOLUTION_BAR_COLOR}`}
              />
              Resolution
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${STALE_BAR_COLOR}`} />
              Stale
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4 px-6 pb-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonBox key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-neutral-400 italic dark:text-neutral-500">
          {emptyMessage}
        </p>
      ) : (
        <div className="default-scrollbar flex max-h-72 flex-col gap-4 overflow-y-auto px-6 pb-6">
          {entries.map(({ label, avgResolutionSeconds, avgStaleSeconds }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <span
                className="max-w-60 truncate text-sm font-medium text-neutral-700 dark:text-neutral-300"
                title={label}
              >
                {label}
              </span>

              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={`h-full rounded-full ${RESOLUTION_BAR_COLOR}`}
                    style={{
                      width: `${((avgResolutionSeconds ?? 0) / 3600 / maxHours) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatSecondsDuration(avgResolutionSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className={`h-full rounded-full ${STALE_BAR_COLOR}`}
                    style={{
                      width: `${((avgStaleSeconds ?? 0) / 3600 / maxHours) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatSecondsDuration(avgStaleSeconds)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimingBreakdownCard;
