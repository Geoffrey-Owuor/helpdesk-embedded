"use client";

import { useRef } from "react";
import ClientPortal from "../ClientPortal";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { useQuery } from "@tanstack/react-query";
import { getReopenHistory, ReopenRow } from "@/serverActions/GetReopenHistory"; // TODO: Adjust import path
import { dateFormatter } from "@/public/assets";
import { X, UndoDot, Clock, AlertCircle, UserRound } from "lucide-react";

type ReopenHistoryProps = {
  uuid: string;
  isOpen: boolean;
  closeModal: () => void;
};

const ReopenHistoryModal = ({
  uuid,
  isOpen,
  closeModal,
}: ReopenHistoryProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrapping(modalRef, isOpen, closeModal);

  const { data: history = [], isLoading } = useQuery<ReopenRow[]>({
    queryKey: ["ReopenHistory", uuid],
    queryFn: () => getReopenHistory(uuid),
    enabled: !!uuid && isOpen,
  });

  if (!isOpen) return null;

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 dark:bg-black/80">
        {/* Modal Container */}
        <div
          ref={modalRef}
          className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-neutral-300 bg-neutral-50 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <UndoDot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Reopen History
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Track when and why this issue was reopened
                </p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Timeline Body */}
          <div className="layout-scrollbar flex-1 overflow-y-auto p-6">
            {isLoading ? (
              // Loading Skeleton
              <div className="flex flex-col gap-6 p-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-full w-0.5 bg-neutral-200 dark:bg-neutral-800"></div>
                    <div className="flex-1 space-y-3 py-2">
                      <div className="details-shimmer h-4 w-1/3 rounded-md"></div>
                      <div className="details-shimmer h-20 w-full rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 rounded-full bg-neutral-100 p-4 dark:bg-neutral-900">
                  <AlertCircle className="h-8 w-8 text-neutral-400 dark:text-neutral-500" />
                </div>
                <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-200">
                  No Reopens Yet
                </h3>
                <p className="mt-1 max-w-sm text-xs text-neutral-500 dark:text-neutral-400">
                  This issue has not been reopened since it was created.
                </p>
              </div>
            ) : (
              // Timeline View
              <div className="relative ml-4 border-l-2 border-neutral-200 py-4 dark:border-neutral-800">
                {history.map((event, index) => {
                  const isLatest = index === 0;

                  const isFirst = index === history.length - 1;

                  return (
                    <div
                      key={event.id}
                      className="relative mb-10 pl-6 last:mb-0"
                    >
                      {/* Timeline Node/Dot */}
                      <div
                        className={`absolute top-1.5 -left-2.25 h-4 w-4 rounded-full border-2 ring-4 ring-neutral-50 dark:ring-neutral-950 ${
                          isLatest
                            ? "border-blue-500 bg-white dark:border-blue-400 dark:bg-neutral-950"
                            : "border-neutral-400 bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-800"
                        }`}
                      />

                      {/* Timestamp */}
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        <Clock className="h-3.5 w-3.5" />
                        {dateFormatter(event.issue_reopen_date)}
                        {isLatest && (
                          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            LATEST
                          </span>
                        )}
                        {isFirst && (
                          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            FIRST CREATION
                          </span>
                        )}
                      </div>

                      {/* Event Card */}
                      <div className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-xs transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700">
                        {/* Who Reopened */}
                        <div className="mb-3 flex w-fit items-center gap-2 rounded-lg bg-neutral-50 p-2.5 text-sm dark:bg-neutral-950">
                          <span className="text-neutral-500 dark:text-neutral-400">
                            {isFirst ? "Created by:" : "Reopened by:"}
                          </span>
                          <div className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100">
                            <UserRound className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="font-medium">
                              {event.issue_reopener_name}
                            </span>
                          </div>
                        </div>

                        {/* Reason */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] font-bold tracking-wider text-neutral-500 uppercase dark:text-neutral-500">
                            Reason for {isFirst ? "Creation" : "Reopening"}
                          </span>
                          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                            {event.issue_reopen_reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

export default ReopenHistoryModal;
