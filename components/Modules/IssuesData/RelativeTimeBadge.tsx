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

// --- NEOMORPHIC TIME BADGE COMPONENT ---
const RelativeTimeBadge = ({ createdAt }: { createdAt: string | number }) => {
  const [timeInfo, setTimeInfo] = useState({ label: "", isUrgent: false });
  const [mounted, setMounted] = useState(false);

  // useEffect guarantees we calculate Date.now() on the client, preventing Next.js hydration mismatch errors
  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));

    Promise.resolve().then(() => setTimeInfo(getRelativeTimeInfo(createdAt)));

    // Optional: Keeps the "minutes ago" counter ticking in real-time
    const interval = setInterval(() => {
      setTimeInfo(getRelativeTimeInfo(createdAt));
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [createdAt]);

  if (!mounted) {
    return (
      <div className="my-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-linear-to-br from-violet-100 via-purple-50 to-fuchsia-200 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-violet-900 transition-colors dark:from-violet-950/50 dark:via-purple-900/20 dark:to-pink-900/40 dark:text-violet-200">
        <Clock size={12} className="text-violet-900 dark:text-violet-200" />
        <span>Loading some time...</span>
      </div>
    );
  }

  const { label, isUrgent } = timeInfo;

  return (
    <div
      className={`my-2 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors ${
        isUrgent
          ? "bg-linear-to-br from-amber-100 via-orange-50 to-red-200 text-red-900 dark:from-amber-900/40 dark:via-orange-900/20 dark:to-red-800/40 dark:text-red-300"
          : "bg-linear-to-br from-violet-100 via-purple-50 to-fuchsia-200 text-violet-900 dark:from-violet-950/50 dark:via-purple-900/20 dark:to-pink-900/40 dark:text-violet-200"
      } `}
    >
      <Clock
        size={12}
        className={
          isUrgent
            ? "text-red-900 dark:text-red-300"
            : "text-violet-900 dark:text-violet-200"
        }
      />
      Submitted {label}
    </div>
  );
};

export default RelativeTimeBadge;
