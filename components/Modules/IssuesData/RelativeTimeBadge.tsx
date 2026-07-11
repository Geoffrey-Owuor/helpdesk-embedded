// components/RelativeTimeBadge.tsx
"use client";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

// --- RELATIVE TIME HELPER ---
const getRelativeTimeInfo = (dateString: string | number) => {
  const past = new Date(dateString).getTime();
  const now = Date.now();
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  let label = "";
  if (diffSec < 60) label = "just now";
  else if (diffMin < 60)
    label = `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  else if (diffHour < 24)
    label = `${diffHour} hr${diffHour !== 1 ? "s" : ""} ago`;
  else if (diffDay < 30)
    label = `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  else if (diffMonth < 12)
    label = `${diffMonth} month${diffMonth !== 1 ? "s" : ""} ago`;
  else label = `${diffYear} year${diffYear !== 1 ? "s" : ""} ago`;

  // Flag true if it has been 7 or more days
  const isUrgent = diffDay >= 7;

  return { label, isUrgent };
};

type RelativeTimeBadgeProps = {
  createdAt: string | number;
  status?: string | number; // NEW: Accept the issue status
};

const RelativeTimeBadge = ({
  createdAt,
  status = "open",
}: RelativeTimeBadgeProps) => {
  const [timeInfo, setTimeInfo] = useState({ label: "", isUrgent: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
    Promise.resolve().then(() => setTimeInfo(getRelativeTimeInfo(createdAt)));

    const interval = setInterval(() => {
      setTimeInfo(getRelativeTimeInfo(createdAt));
    }, 60000);

    return () => clearInterval(interval);
  }, [createdAt]);

  if (!mounted) {
    return (
      <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-linear-to-br from-neutral-100 via-zinc-50 to-gray-200 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-neutral-900 transition-colors dark:from-neutral-950/50 dark:via-zinc-900/20 dark:to-gray-900/40 dark:text-neutral-200">
        <Clock size={12} className="text-neutral-900 dark:text-neutral-200" />
        <span>Loading some time...</span>
      </div>
    );
  }

  const { label, isUrgent } = timeInfo;

  // NEW: Determine if the issue is past the open stage
  const isCompleted = status.toString().toLowerCase() !== "open";

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
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors ${colorClasses}`}
    >
      <Clock size={12} className={iconClasses} />
      Submitted {label}
    </div>
  );
};

export default RelativeTimeBadge;
