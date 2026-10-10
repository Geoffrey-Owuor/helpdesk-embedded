// components/RelativeTimeBadge.tsx
"use client";
import { Clock } from "lucide-react";
import { useMinuteClock } from "@/hooks/useMinuteClock";

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

type RelativeTimeBadgeProps = {
  createdAt: string | number;
  status?: string | number; // NEW: Accept the issue status
};

const RelativeTimeBadge = ({
  createdAt,
  status = "open",
}: RelativeTimeBadgeProps) => {
  // Shared minute clock - null only while server rendering/hydrating
  const now = useMinuteClock();

  if (now === null) {
    return (
      <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-linear-to-br from-neutral-100 via-zinc-50 to-gray-200 px-2.5 py-1 text-xs font-semibold tracking-wide text-neutral-900 transition-colors sm:text-[11px] dark:from-neutral-950/50 dark:via-zinc-900/20 dark:to-gray-900/40 dark:text-neutral-200">
        <Clock size={12} className="text-neutral-900 dark:text-neutral-200" />
        <span>Loading some time...</span>
      </div>
    );
  }

  const { label, isUrgent, exactDate } = getRelativeTimeInfo(createdAt, now);

  // NEW: Determine if the issue is past the open stage
  const statusToString = status.toString().toLowerCase();
  const isCompleted =
    statusToString !== "open" && statusToString !== "in progress";

  // NEW: Theme mapping based on hierarchy (Completed -> Urgent -> Standard)
  let colorClasses = "";
  let iconClasses = "";

  if (isCompleted) {
    colorClasses =
      "bg-linear-to-br from-teal-100 via-emerald-50 to-green-200 text-teal-900 dark:from-teal-950/50 dark:via-emerald-900/20 dark:to-green-900/40 dark:text-teal-200";
    iconClasses = "text-teal-900 dark:text-teal-200";
  } else if (isUrgent) {
    colorClasses =
      "bg-linear-to-br from-amber-100 via-orange-50 to-red-200 text-red-900 dark:from-amber-900/40 dark:via-orange-900/20 dark:to-red-800/40 dark:text-red-300";
    iconClasses = "text-red-900 dark:text-red-300";
  } else {
    colorClasses =
      "bg-linear-to-br from-violet-100 via-purple-50 to-fuchsia-200 text-violet-900 dark:from-violet-950/50 dark:via-purple-900/20 dark:to-pink-900/40 dark:text-violet-200";
    iconClasses = "text-violet-900 dark:text-violet-200";
  }

  return (
    <div
      title={`Submitted ${exactDate}`}
      className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors ${colorClasses}`}
    >
      <Clock size={12} className={iconClasses} />
      Submitted {label}
    </div>
  );
};

export default RelativeTimeBadge;
