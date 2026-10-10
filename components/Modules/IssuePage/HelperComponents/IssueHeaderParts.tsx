"use client";
import { ChevronDown, LucideIcon, MoreHorizontal, RotateCcw } from "lucide-react";
import { IssueDetail } from "@/queries/fetchIssue";
import IssueStatusFormatter from "../../IssuesData/IssueStatusFormatter";
import IssuePriorityFormatter from "../../IssuesData/IssuePriorityFormatter";
import { ActionMenu, ActionMenuItem } from "./ActionMenu";

// An action button in the issue header's toolbar. The same list also fills
// the "more actions" menus, so actions are described as data, not JSX.
export type IssueHeaderAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  // Triage and collaborate sit on the left; lifecycle (Reopen) on the right
  group: "triage" | "collaborate" | "lifecycle";
  tone?: "danger" | "primary";
  // Folded into the toolbar's "more" menu on phones
  secondary?: boolean;
};

// Turns the status or priority badge into a picker when the viewer can edit it
export type IssueFieldPicker = {
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  disabled?: boolean;
};

export const toMenuItems = (actions: IssueHeaderAction[]): ActionMenuItem[] =>
  actions.map((action) => ({
    key: action.key,
    label: action.label,
    icon: action.icon,
    onSelect: action.onClick,
    tone: action.tone === "danger" ? "danger" : undefined,
  }));

const pickerItems = (
  picker: IssueFieldPicker,
  currentValue: string,
): ActionMenuItem[] =>
  picker.options.map((option) => ({
    key: option.value,
    label: option.label,
    onSelect: () => picker.onSelect(option.value),
    disabled: option.value === currentValue || picker.disabled,
    checked: option.value === currentValue,
  }));

const badgeTriggerClass = (isOpen: boolean) =>
  `inline-flex items-center gap-0.5 rounded-xl p-0.5 pr-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900 ${
    isOpen ? "bg-neutral-100 ring-2 ring-blue-500/20 dark:bg-neutral-900" : ""
  }`;

// The issue's status badge - a picker for those who can change it
export const StatusBadge = ({
  issue,
  picker,
  align = "left",
}: {
  issue: IssueDetail;
  picker?: IssueFieldPicker;
  // Which edge the menu lines up with - "right" when the badge sits near
  // the right edge, so the menu doesn't spill off the page
  align?: "left" | "right";
}) => {
  const badge = <IssueStatusFormatter status={issue.issue_status} />;
  if (!picker) return badge;

  return (
    <ActionMenu
      ariaLabel="Change status"
      heading="Change status"
      trigger={
        <>
          {badge}
          <ChevronDown className="h-3.5 w-3.5" />
        </>
      }
      triggerClassName={badgeTriggerClass}
      items={pickerItems(picker, issue.issue_status)}
      align={align}
    />
  );
};

// The issue's priority badge - a picker for those who can change it
export const PriorityBadge = ({
  issue,
  picker,
  align = "left",
}: {
  issue: IssueDetail;
  picker?: IssueFieldPicker;
  // Which edge the menu lines up with - "right" when the badge sits near
  // the right edge, so the menu doesn't spill off the page
  align?: "left" | "right";
}) => {
  const badge = <IssuePriorityFormatter priority={issue.issue_priority} />;
  if (!picker) return badge;

  return (
    <ActionMenu
      ariaLabel="Change priority"
      heading="Change priority"
      trigger={
        <>
          {badge}
          <ChevronDown className="h-3.5 w-3.5" />
        </>
      }
      triggerClassName={badgeTriggerClass}
      items={pickerItems(picker, issue.issue_priority)}
      align={align}
    />
  );
};

export const iconButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:h-8 sm:w-8 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white";

export const RefreshButton = ({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}) => (
  <button
    type="button"
    onClick={onRefresh}
    disabled={isRefreshing}
    aria-label="Refresh issue"
    title="Refresh issue"
    className={iconButtonClass}
  >
    <RotateCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
  </button>
);

// A "more actions" menu behind a ⋯ button
export const MoreActionsMenu = ({
  items,
  className = "",
}: {
  items: ActionMenuItem[];
  className?: string;
}) => {
  if (items.length === 0) return null;

  return (
    <div className={className}>
      <ActionMenu
        ariaLabel="More actions"
        align="right"
        trigger={<MoreHorizontal className="h-4 w-4" />}
        triggerClassName={(isOpen) =>
          `${iconButtonClass} border border-neutral-200 dark:border-neutral-800 ${
            isOpen ? "bg-neutral-100 dark:bg-neutral-900" : ""
          }`
        }
        items={items}
      />
    </div>
  );
};
