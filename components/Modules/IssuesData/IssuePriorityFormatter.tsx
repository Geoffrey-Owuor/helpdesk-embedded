import { IssueValueTypes } from "@/public/assets";

import {
  LucideIcon,
  ArrowDown,
  ArrowUp,
  Zap,
  MoveHorizontal,
  CircleQuestionMark,
} from "lucide-react";

interface IssuePriorityProps {
  priority: IssueValueTypes;
  showText?: boolean;
}

const priorityColorFormatting: Record<
  string,
  {
    text: string;
    bg: string;
    border: string;
    icon: LucideIcon;
  }
> = {
  Low: {
    text: "text-slate-700 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-900/30",
    border: "border-slate-100 dark:border-slate-950",
    icon: ArrowDown,
  },
  Medium: {
    text: "text-sky-700 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-900/30",
    border: "border-sky-100 dark:border-sky-950",
    icon: MoveHorizontal,
  },
  High: {
    text: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/30",
    border: "border-violet-100 dark:border-violet-950",
    icon: ArrowUp,
  },
  Critical: {
    text: "text-rose-700 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-900/30",
    border: "border-rose-100 dark:border-rose-950",
    icon: Zap,
  },
};

const defaultPriorityStyle = {
  text: "text-gray-700 dark:text-gray-300",
  bg: "bg-gray-100 dark:bg-gray-800",
  border: "border-gray-100 dark:border-gray-950",
  icon: CircleQuestionMark,
};

const IssuePriorityFormatter = ({
  priority,
  showText = true,
}: IssuePriorityProps) => {
  const config = priorityColorFormatting[priority] || defaultPriorityStyle;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center rounded-full ${!showText ? "justify-center p-1.5" : "w-22 px-2 py-1"} border text-xs ${config.border} font-semibold ${config.bg} ${config.text} `}
    >
      <Icon
        size={12}
        className={`${showText ? "mr-1.5" : ""} shrink-0 ${config.text} animate-pulse`}
      />

      <span className={`truncate ${!showText ? "hidden" : ""}`}>
        {priority}
      </span>
    </div>
  );
};

export default IssuePriorityFormatter;
