"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Calendar,
  GitMerge,
  LucideIcon,
  RotateCcw,
  UndoDot,
} from "lucide-react";
import { IssueDetail } from "@/queries/fetchIssue";
import { dateFormatter, titleHelper } from "@/public/assets";
import RelativeTimeBadge from "../../IssuesData/RelativeTimeBadge";
import { ResolutionTimePill } from "../../IssuesData/ResolutionTimePill";
import EscalationHistoryModal from "../EscalationHistoryModal";
import ReopenHistoryModal from "../ReopenHistoryModal";
import {
  IssueFieldPicker,
  IssueHeaderAction,
  MoreActionsMenu,
  PriorityBadge,
  RefreshButton,
  StatusBadge,
  toMenuItems,
} from "./IssueHeaderParts";

// Title, state and actions for an issue, shared by the issue page and its
// read-only analytics mirror. Grouped top to bottom as identity (reference,
// date, title), state (status, priority, history, timing) and actions.
// Once scrolled past, a compact sticky bar keeps the essentials in view.
export const IssueHeader = ({
  issue,
  onRefresh,
  isRefreshing = false,
  breadcrumb,
  pinButton,
  statusPicker,
  priorityPicker,
  actions = [],
}: {
  issue: IssueDetail;
  onRefresh: () => void;
  isRefreshing?: boolean;
  breadcrumb?: ReactNode;
  pinButton?: ReactNode;
  statusPicker?: IssueFieldPicker;
  priorityPicker?: IssueFieldPicker;
  actions?: IssueHeaderAction[];
}) => {
  const [escalationHistoryOpen, setEscalationHistoryOpen] = useState(false);
  const [reopenHistoryOpen, setReopenHistoryOpen] = useState(false);

  // Show the compact bar once the full header has scrolled out of view
  const headerRef = useRef<HTMLDivElement>(null);
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const observer = new IntersectionObserver(
      ([entry]) =>
        setIsScrolledPast(
          !entry.isIntersecting &&
            entry.boundingClientRect.top < (entry.rootBounds?.top ?? 0),
        ),
      { root: document.getElementById("main-content") },
    );
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const isFinished =
    issue.issue_status === "resolved" || issue.issue_status === "closed";

  const triage = actions.filter((action) => action.group === "triage");
  const collaborate = actions.filter(
    (action) => action.group === "collaborate",
  );
  const lifecycle = actions.filter((action) => action.group === "lifecycle");
  const secondary = actions.filter((action) => action.secondary);

  const refreshItem = {
    key: "refresh",
    label: "Refresh",
    icon: RotateCcw,
    onSelect: onRefresh,
  };

  return (
    <>
      {/* Escalation History Modal */}
      {escalationHistoryOpen && (
        <EscalationHistoryModal
          isOpen={escalationHistoryOpen}
          uuid={issue.issue_uuid}
          closeModal={() => setEscalationHistoryOpen(false)}
        />
      )}

      {/* Reopen History Modal */}
      {reopenHistoryOpen && (
        <ReopenHistoryModal
          isOpen={reopenHistoryOpen}
          uuid={issue.issue_uuid}
          closeModal={() => setReopenHistoryOpen(false)}
        />
      )}

      {/* --- COMPACT STICKY BAR ---
          Zero-height so it never shifts the layout; the bar hangs below it
          keeps its contents on the page column, while a ::before band paints
          the background and bottom border across the whole scroller, which
          clips it to its inner edges. */}
      <div className="sticky top-0 z-30 h-0">
        <div
          inert={!isScrolledPast}
          aria-hidden={!isScrolledPast}
          className={`absolute inset-x-0 isolate -mx-4 flex items-center gap-2 px-4 py-2 transition-[opacity,translate] duration-150 before:absolute before:inset-y-0 before:-inset-x-[100vw] before:-z-10 before:border-b before:border-neutral-200 before:bg-white dark:before:border-neutral-800 dark:before:bg-black ${
            isScrolledPast
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0"
          }`}
        >
          <span className="shrink-0 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
            {issue.issue_reference_id}
          </span>
          <span
            title={titleHelper(issue.issue_title)}
            className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-900 dark:text-white"
          >
            {issue.issue_title}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            {/* Right-aligned menus - these badges sit at the bar's right edge */}
            <StatusBadge issue={issue} picker={statusPicker} align="right" />
            <span className="hidden sm:inline-flex">
              <PriorityBadge
                issue={issue}
                picker={priorityPicker}
                align="right"
              />
            </span>
            <MoreActionsMenu items={[...toMenuItems(actions), refreshItem]} />
          </div>
        </div>
      </div>

      <div ref={headerRef} className="mb-6 flex flex-col gap-3">
        {breadcrumb}

        {/* --- IDENTITY --- */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="font-mono text-[15px] font-semibold text-blue-600 dark:text-blue-400">
              {issue.issue_reference_id}
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {dateFormatter(issue.issue_created_at)}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {pinButton}
            <RefreshButton onRefresh={onRefresh} isRefreshing={isRefreshing} />
          </div>
        </div>

        <h1
          title={titleHelper(issue.issue_title)}
          className="line-clamp-2 text-xl font-semibold wrap-break-word text-neutral-900 sm:text-2xl dark:text-white"
        >
          {issue.issue_title}
        </h1>

        {/* --- STATE --- */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge issue={issue} picker={statusPicker} />
          <PriorityBadge issue={issue} picker={priorityPicker} />

          {Number(issue.reopened_count) > 0 && (
            <HistoryChip
              icon={UndoDot}
              label="Reopened"
              count={Number(issue.reopened_count)}
              onClick={() => setReopenHistoryOpen(true)}
            />
          )}
          {Number(issue.escalated_count) > 0 && (
            <HistoryChip
              icon={GitMerge}
              label="Escalated"
              count={Number(issue.escalated_count)}
              onClick={() => setEscalationHistoryOpen(true)}
            />
          )}

          <RelativeTimeBadge
            createdAt={issue.issue_created_at}
            status={issue.issue_status}
          />
          {isFinished && issue.issue_date_resolved && (
            <ResolutionTimePill
              dateSubmitted={issue.issue_created_at}
              dateResolved={issue.issue_date_resolved}
            />
          )}
        </div>

        {/* --- ACTIONS --- */}
        {actions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
            {triage.map((action) => (
              <ToolbarButton key={action.key} action={action} />
            ))}
            {triage.length > 0 && collaborate.length > 0 && (
              <span
                aria-hidden
                className="mx-1 hidden h-5 w-px bg-neutral-200 sm:block dark:bg-neutral-800"
              />
            )}
            {collaborate.map((action) => (
              <ToolbarButton key={action.key} action={action} />
            ))}

            <div className="ml-auto flex items-center gap-2">
              {lifecycle.map((action) => (
                <ToolbarButton key={action.key} action={action} />
              ))}
              <MoreActionsMenu
                items={toMenuItems(secondary)}
                className="sm:hidden"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const ToolbarButton = ({ action }: { action: IssueHeaderAction }) => {
  const Icon = action.icon;
  const tone =
    action.tone === "primary"
      ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      : action.tone === "danger"
        ? "border-neutral-200 bg-white text-red-700 hover:bg-red-50 dark:border-neutral-800 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-950/40"
        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-transparent dark:text-neutral-200 dark:hover:bg-neutral-900";

  return (
    <button
      type="button"
      onClick={action.onClick}
      className={`h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors sm:h-8 ${tone} ${
        action.secondary ? "hidden sm:inline-flex" : "inline-flex"
      }`}
    >
      <Icon className="h-4 w-4" />
      {action.label}
    </button>
  );
};

const HistoryChip = ({
  icon: Icon,
  label,
  count,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={`View ${label.toLowerCase()} history`}
    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 py-1 pr-1 pl-2.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
  >
    <Icon size={12} />
    {label}
    <span className="rounded-full bg-neutral-900 px-1.5 text-[10px] leading-4 text-white dark:bg-white dark:text-black">
      {count}
    </span>
  </button>
);
