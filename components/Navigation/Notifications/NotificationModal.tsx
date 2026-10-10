"use client";

import { CircleDot, CheckCheck, BellOff, RotateCcw } from "lucide-react";
import { dateFormatter } from "@/public/assets";
import { IssueValueTypes } from "@/public/assets";
import { ChangelogItem } from "./Notifications";
import { Dispatch, SetStateAction } from "react";
import { ChangelogTypePill } from "@/components/Home/ChangeLog";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalIconButton,
} from "../../Modules/Modal/Modal";

export type RouteChangeProps = {
  uuid: IssueValueTypes;
  title: IssueValueTypes;
  description: IssueValueTypes;
};

type NotificationModalProps = {
  closeModal: () => void;
  isModalOpen: boolean;
  isClosing: boolean;
  handleRouteChange: ({ uuid, title, description }: RouteChangeProps) => void;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  changelogs: ChangelogItem[];
  count: number;
  issues: Record<string, IssueValueTypes>[];
  refetch: () => void;
};

//circledot colors based on the issue status
export const dynamicCircleColor: Record<string | number, string> = {
  open: "text-amber-700 dark:text-amber-400",
  "in progress": "text-indigo-700 dark:text-indigo-400",
  resolved: "text-emerald-700 dark:text-emerald-400",
  closed: "text-blue-700 dark:text-blue-400",
};

const NotificationModal = ({
  closeModal,
  isModalOpen,
  isClosing,
  handleRouteChange,
  setIsModalOpen,
  changelogs,
  count,
  issues,
  refetch,
}: NotificationModalProps) => {
  const hasIssues = issues.length > 0;
  const hasChangelogs = changelogs.length > 0;
  const isEmpty = !hasIssues && !hasChangelogs;
  return (
    <Modal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      size="2xl"
      dismissible
    >
      <ModalHeader
        title="Notifications"
        actions={
          <ModalIconButton label="Refresh" icon={RotateCcw} onClick={refetch} />
        }
      />

      {/* Body */}
      <ModalBody padded={false}>
        {isEmpty && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-neutral-500">
            <div className="rounded-full bg-blue-500/10 p-4">
              <BellOff className="h-12 w-12 text-blue-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold">You&apos;re all caught up!</p>
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
                    <p className="line-clamp-1 text-sm font-semibold wrap-break-word text-neutral-800 dark:text-neutral-200">
                      {issue.issue_title}
                    </p>
                    {issue.issue_description && (
                      <p className="mt-0.5 line-clamp-2 text-xs wrap-break-word text-neutral-500 dark:text-neutral-400">
                        {issue.issue_description}
                      </p>
                    )}
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
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
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <ChangelogTypePill type={changelog.changelog_type} />
                      <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">
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
      </ModalBody>

      {/* Footer */}
      {count > 0 && (
        <ModalFooter>
          <button
            onClick={closeModal}
            disabled={isClosing}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-3 py-2.5 text-sm text-white transition-colors duration-200 hover:bg-neutral-800 disabled:opacity-50 sm:py-2 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all as read</span>
          </button>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default NotificationModal;
