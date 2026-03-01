"use client";

import { X, GitCommitHorizontal, CircleDot } from "lucide-react";
import ClientPortal from "@/components/Modules/ClientPortal";
import { dateFormatter } from "@/public/assets";
import { IssueValueTypes } from "@/contexts/IssuesDataContext";
import { ChangelogItem } from "./Notifications";

type NotificationModalProps = {
  closeModal: () => void;
  changelogs: ChangelogItem[];
  issues: Record<string, IssueValueTypes>[];
};

const NotificationModal = ({
  closeModal,
  changelogs,
  issues,
}: NotificationModalProps) => {
  const hasIssues = issues.length > 0;
  const hasChangelogs = changelogs.length > 0;
  const isEmpty = !hasIssues && !hasChangelogs;

  return (
    <ClientPortal>
      <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 transition-all dark:bg-black/70">
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Notifications
            </h2>
            <button
              onClick={closeModal}
              className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {isEmpty && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-neutral-400 dark:text-neutral-600">
                <p className="text-sm">You&apos;re all caught up!</p>
              </div>
            )}

            {/* Issues Section */}
            {hasIssues && (
              <section>
                <div className="sticky top-0 bg-neutral-50 px-6 py-2.5 dark:bg-neutral-900">
                  <span className="text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
                    New Issues
                  </span>
                </div>
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {issues.map((issue) => (
                    <li
                      key={issue.issue_uuid}
                      className="flex items-start gap-3 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                    >
                      <div className="mt-0.5 shrink-0 text-blue-500 dark:text-blue-400">
                        <CircleDot className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                            {issue.issue_reference_id}
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-600">
                            ·
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            {dateFormatter(issue.issue_created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-neutral-800 dark:text-neutral-200">
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
                <div className="sticky top-0 bg-neutral-50 px-6 py-2.5 dark:bg-neutral-900">
                  <span className="text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-500">
                    Changelogs
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
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 capitalize dark:bg-emerald-900/30 dark:text-emerald-400">
                            {changelog.changelog_type}
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-600">
                            ·
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            {dateFormatter(changelog.changelog_updated_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-neutral-800 dark:text-neutral-200">
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
        </div>
      </div>
    </ClientPortal>
  );
};

export default NotificationModal;
