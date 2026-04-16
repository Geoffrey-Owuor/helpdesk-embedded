import {
  Clock,
  CheckCircle2,
  HelpCircle,
  LucideIcon,
  BookmarkCheck,
} from "lucide-react";
import { IssueValueTypes } from "@/public/assets";

interface IssueStatusProps {
  status: IssueValueTypes;
}

// 1. Define the specific styling and icons for each status
const issueColorFormatting: Record<
  string,
  {
    text: string;
    bg: string;
    icon: LucideIcon;
    border: string;
  }
> = {
  open: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/30",
    border: "border-amber-200 dark:border-amber-800",
    icon: Clock,
  },
  resolved: {
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: BookmarkCheck,
  },
  closed: {
    text: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: CheckCircle2,
  },
};

// 2. Default fallback for unknown statuses
const defaultStyle = {
  text: "text-gray-700 dark:text-gray-300",
  bg: "bg-gray-100 dark:bg-gray-800",
  border: "border-gray-200 dark:border-gray-700",
  icon: HelpCircle,
};

const IssueStatusFormatter = ({ status }: IssueStatusProps) => {
  const config = issueColorFormatting[status] || defaultStyle;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex w-22 items-center rounded-lg border px-2 py-1 text-xs font-semibold ${config.bg} ${config.text} ${config.border} `}
    >
      <Icon size={14} className="mr-1.5" />
      <span className="truncate">{status}</span>
    </div>
  );
};

export default IssueStatusFormatter;
