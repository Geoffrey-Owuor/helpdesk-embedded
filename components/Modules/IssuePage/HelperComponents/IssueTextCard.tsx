import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

// A titled card holding a block of free text (an issue's description or
// remarks), with an optional action such as an edit button in its header
export const IssueTextCard = ({
  title,
  icon: Icon,
  text,
  emptyText,
  action,
}: {
  title: string;
  icon: LucideIcon;
  text: string | null;
  emptyText?: string;
  action?: ReactNode;
}) => (
  <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
          <Icon className="h-4 w-4" />
        </div>
        {title}
      </h2>
      {action}
    </div>
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      {text ? (
        <p
          title={text}
          className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-neutral-600 dark:text-neutral-300"
        >
          {text}
        </p>
      ) : (
        <p className="text-sm text-neutral-400 italic dark:text-neutral-500">
          {emptyText}
        </p>
      )}
    </div>
  </div>
);
