// components/RelativeTimeBadge.tsx
"use client";
import { Clock } from "lucide-react";
import { useMinuteClock } from "@/hooks/useMinuteClock";
import { indicatorAged, indicatorMuted } from "@/lib/indicatorStyles";

// --- RELATIVE TIME HELPER ---
// Built once - Intl formatters are relatively expensive to construct
const relativeTimeFormat = new Intl.RelativeTimeFormat("en", {
  numeric: "always",
});
const exactDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

// Whole calendar months between two dates, so e.g. Jan 31 -> Feb 28 is 0
// months (shown as days) rather than a 30-day approximation
const calendarMonthsBetween = (from: Date, to: Date) => {
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());

  // Not a full month yet if we haven't reached the same day and time of month
  const sameMonthPoint = new Date(from);
  sameMonthPoint.setFullYear(to.getFullYear(), to.getMonth());
  return sameMonthPoint.getTime() > to.getTime() ? months - 1 : months;
};

const getRelativeTimeInfo = (dateString: string | number, now: number) => {
  const pastDate = new Date(dateString);
  const diffMs = now - pastDate.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = calendarMonthsBetween(pastDate, new Date(now));

  let label = "";
  if (diffMin < 1) label = "just now";
  else if (diffHour < 1) label = relativeTimeFormat.format(-diffMin, "minute");
  else if (diffDay < 1) label = relativeTimeFormat.format(-diffHour, "hour");
  else if (diffMonth < 1) label = relativeTimeFormat.format(-diffDay, "day");
  else if (diffMonth < 12)
    label = relativeTimeFormat.format(-diffMonth, "month");
  else label = relativeTimeFormat.format(-Math.floor(diffMonth / 12), "year");

  // Flag true if it has been 7 or more days
  const isUrgent = diffDay >= 7;

  return { label, isUrgent, exactDate: exactDateFormat.format(pastDate) };
};

const timeLabel = "inline-flex w-fit items-center gap-1.5 text-xs font-medium";

type RelativeTimeBadgeProps = {
  createdAt: string | number;
  status?: string | number;
};

const RelativeTimeBadge = ({
  createdAt,
  status = "open",
}: RelativeTimeBadgeProps) => {
  // Shared minute clock - null only while server rendering/hydrating
  const now = useMinuteClock();

  if (now === null) {
    return (
      <div className={`${timeLabel} ${indicatorMuted}`}>
        <Clock size={12} />
        <span>Loading some time...</span>
      </div>
    );
  }

  const { label, isUrgent, exactDate } = getRelativeTimeInfo(createdAt, now);

  // Is the issue past the open stage?
  const statusToString = status.toString().toLowerCase();
  const isCompleted =
    statusToString !== "open" && statusToString !== "in progress";

  // Only an unresolved issue that has aged stands out
  const colorClasses =
    !isCompleted && isUrgent ? indicatorAged : indicatorMuted;

  return (
    <div
      title={`Submitted ${exactDate}`}
      className={`${timeLabel} ${colorClasses}`}
    >
      <Clock size={12} />
      Submitted {label}
    </div>
  );
};

export default RelativeTimeBadge;
