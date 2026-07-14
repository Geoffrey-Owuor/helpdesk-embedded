import { ClockCheck } from "lucide-react";
import { FC } from "react";

interface ResolutionTimePillProps {
  dateSubmitted: Date | string | number;
  dateResolved: Date | string | number;
}

// Helper function to calculate and format the time difference
const getShortDuration = (
  start: Date | string | number,
  end: Date | string | number,
): string => {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();

  if (isNaN(startDate) || isNaN(endDate)) return "--";

  // Calculate the absolute difference in seconds
  const diffInSeconds = Math.abs(endDate - startDate) / 1000;

  // Define thresholds in seconds
  const MINUTE = 60;
  const HOUR = 3600;
  const DAY = 86400;
  const WEEK = 604800;
  const MONTH = 2592000; // Approx 30 days
  const YEAR = 31536000; // 365 days

  if (diffInSeconds >= YEAR) return `${Math.floor(diffInSeconds / YEAR)}y`;
  if (diffInSeconds >= MONTH) return `${Math.floor(diffInSeconds / MONTH)}mon`;
  if (diffInSeconds >= WEEK) return `${Math.floor(diffInSeconds / WEEK)}w`;
  if (diffInSeconds >= DAY) return `${Math.floor(diffInSeconds / DAY)}d`;
  if (diffInSeconds >= HOUR) return `${Math.floor(diffInSeconds / HOUR)}h`;
  if (diffInSeconds >= MINUTE)
    return `${Math.floor(diffInSeconds / MINUTE)}min`;

  return `${Math.floor(diffInSeconds)}sec`;
};

export const ResolutionTimePill: FC<ResolutionTimePillProps> = ({
  dateSubmitted,
  dateResolved,
}) => {
  const durationText = getShortDuration(dateSubmitted, dateResolved);

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border-none bg-linear-to-r from-neutral-200 to-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-800 dark:from-neutral-700 dark:to-neutral-800 dark:text-neutral-200"
      title={`Resolved on ${new Date(dateResolved).toLocaleString()}`}
    >
      <ClockCheck className="h-3.5 w-3.5" />
      <span>{durationText}</span>
    </div>
  );
};
