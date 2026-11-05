// The one definition of how indicators look (status, priority, time, flags).
// Chips and icon circles stay neutral so they sit quietly on the white and
// neutral-950 surfaces. Strong colour is kept for what needs attention: High
// and Critical priority, escalated issues and aged unresolved issues. Meaning
// never rests on colour alone - it always comes with a label or an icon shape.
import {
  ArrowDown,
  ArrowUp,
  CircleQuestionMark,
  LucideIcon,
  MoveHorizontal,
  Zap,
} from "lucide-react";

// Background and text shared by every indicator chip
export const indicatorChip =
  "bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300";

// The round icon holder on stat cards
export const indicatorCircle =
  "flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400";

// Secondary text and icons: counts, normal time labels, low-key flags
export const indicatorMuted = "text-neutral-500 dark:text-neutral-400";

// Aged unresolved issues
export const indicatorAged = "text-amber-700 dark:text-amber-500";

// Issue status dots. Closed is the finished state, so it is the quietest.
export const statusDotColors: Record<string, string> = {
  open: "bg-amber-500",
  "in progress": "bg-blue-500",
  resolved: "bg-emerald-500",
  closed: "bg-neutral-400 dark:bg-neutral-500",
};

// An unrecognized status gets a hollow dot
export const unknownStatusDot =
  "border border-neutral-400 dark:border-neutral-500";

// Account status dots (super admin users table)
export const accountDotColors = {
  active: "bg-emerald-500",
  inactive: "bg-red-500",
  locked: "bg-amber-500",
  deleted: "bg-neutral-400 dark:bg-neutral-500",
};

const priorityHigh = "text-orange-600 dark:text-orange-400";
const priorityCritical = "text-red-600 dark:text-red-400";

export const priorityIndicators: Record<
  string,
  { icon: LucideIcon; color: string }
> = {
  Low: { icon: ArrowDown, color: indicatorMuted },
  Medium: { icon: MoveHorizontal, color: indicatorMuted },
  High: { icon: ArrowUp, color: priorityHigh },
  Critical: { icon: Zap, color: priorityCritical },
};

export const unknownPriorityIndicator = {
  icon: CircleQuestionMark,
  color: indicatorMuted,
};

// The small flag icons beside an issue's title or footer
export const issueFlagColors = {
  reopened: indicatorMuted,
  escalated: priorityHigh,
  collaborated: indicatorMuted,
};
