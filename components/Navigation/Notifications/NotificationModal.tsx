"use client";

import {
  X,
  GitCommitHorizontal,
  CircleDot,
  CheckCheck,
  BellOff,
} from "lucide-react";
import ClientPortal from "@/components/Modules/ClientPortal";
import { dateFormatter } from "@/public/assets";
import { IssueValueTypes } from "@/store/useIssuesStore";
import { ChangelogItem } from "./Notifications";
import { Dispatch, SetStateAction } from "react";

export type RouteChangeProps = {
  uuid: IssueValueTypes;
  title: IssueValueTypes;
  description: IssueValueTypes;
};

type NotificationModalProps = {
  closeModal: () => void;
  isClosing: boolean;
  handleRouteChange: ({ uuid, title, description }: RouteChangeProps) => void;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  changelogs: ChangelogItem[];
  count: number;
  issues: Record<string, IssueValueTypes>[];
};

const NotificationModal = ({
  closeModal,
  isClosing,
  handleRouteChange,
  setIsModalOpen,
  changelogs,
  count,
  issues,
}: NotificationModalProps) => {
  const hasIssues = issues.length > 0;
  const hasChangelogs = changelogs.length > 0;
  const isEmpty = !hasIssues && !hasChangelogs;

  //circledot colors based on the issue status
  const dynamicCircleColor: Record<string | number, string> = {
    pending: "text-amber-700 dark:text-amber-400",
    "in progress": "text-blue-700 dark:text-blue-400",
    resolved: "text-emerald-700 dark:text-emerald-400",
    unfeasible: "text-red-700 dark:text-red-400",
  };

  return (
    <ClientPortal>
      <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-all dark:bg-black/70">
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Notifications
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="layout-scrollbar flex-1 overflow-y-auto">
            {isEmpty && (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-neutral-500">
                <div className="rounded-full bg-blue-500/10 p-4">
                  <BellOff
                    className="h-12 w-12 text-blue-400"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-sm font-semibold">
                  You&apos;re all caught up!
                </p>
                <p className="text-xs">No new notifications at the moment</p>
              </div>
            )}

            {/* Issues Section */}
            {hasIssues && (
              <section>
                <div className="sticky top-0 bg-neutral-100 px-6 py-2.5 dark:bg-neutral-900">
                  <span className="text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
                    New Issues
                  </span>
                </div>
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {issues.map((issue) => (
                    <li
                      key={issue.issue_uuid}
                      onClick={() =>
                        handleRouteChange({
                          uuid: issue.issue_uuid,
                          title: issue.issue_title,
                          description: issue.issue_description,
                        })
                      }
                      className="flex cursor-pointer items-start gap-3 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                    >
                      <div
                        className={`mt-0.5 shrink-0 ${dynamicCircleColor[issue.issue_status]}`}
                      >
                        <CircleDot className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                            {issue.issue_reference_id}
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-600">
                            ·
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            {dateFormatter(issue.issue_created_at)}
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-600">
                            ·
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            {issue.issue_submitter_name}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                          {issue.issue_title}
                        </p>
                        {issue.issue_description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                            {issue.issue_description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Changelogs Section */}
            {hasChangelogs && (
              <section>
                <div className="sticky top-0 bg-neutral-100 px-6 py-2.5 dark:bg-neutral-900">
                  <span className="text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
                    Changelog Updates
                  </span>
                </div>
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {changelogs.map((changelog) => (
                    <li
                      key={changelog.changelog_id}
                      className="flex items-start gap-3 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                    >
                      <div className="mt-0.5 shrink-0 text-emerald-500 dark:text-emerald-400">
                        <GitCommitHorizontal className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 capitalize dark:bg-emerald-900/30 dark:text-emerald-400">
                            {changelog.changelog_type}
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-600">
                            ·
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            {dateFormatter(changelog.changelog_updated_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                          {changelog.changelog_title}
                        </p>
                        {changelog.changelog_description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                            {changelog.changelog_description}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Footer */}
          {count > 0 && (
            <div className="flex items-center justify-end border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
              <button
                onClick={closeModal}
                disabled={isClosing}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark all as read</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </ClientPortal>
  );
};

export default NotificationModal;
