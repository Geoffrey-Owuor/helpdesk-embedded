"use client";
import { Bug, Check, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchedIssueTypes } from "@/serverActions/GetIssueTypes";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { IssueValueTypes } from "@/public/assets";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useAlertStore } from "@/store/useAlertStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type IssueTypeModalProps = {
  targetDepartment: IssueValueTypes;
  currentType: IssueValueTypes;
  activeQueryKey: (string | boolean)[];
  uuid: string;
};
const IssueTypeModal = ({
  targetDepartment,
  uuid,
  currentType,
  activeQueryKey,
}: IssueTypeModalProps) => {
  // Query client initialization
  const queryClient = useQueryClient();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);

  const triggerAlert = useAlertStore((state) => state.triggerAlert);

  const { data: options = [], isLoading: loading } = useQuery({
    queryKey: ["IssuePageTypes", targetDepartment],
    queryFn: () => fetchedIssueTypes(targetDepartment.toString()),
    enabled: !!targetDepartment,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Options dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleIssueTypeUpdate = async (value: string) => {
    hideDialog();

    // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
    await queryClient.cancelQueries({ queryKey: activeQueryKey });

    // 2. Snapshot the previous data (for rollback if the API fails)
    const previousData = queryClient.getQueryData(activeQueryKey);

    // Optimistically update the cache
    queryClient.setQueryData(
      activeQueryKey,
      (oldData: Record<string, IssueValueTypes>[]) => {
        if (!oldData) return oldData;
        // Map through the array and update the specific issue's status
        return oldData.map((issue: Record<string, IssueValueTypes>) =>
          issue.issue_uuid === uuid ? { ...issue, issue_type: value } : issue,
        );
      },
    );

    try {
      const response = await apiClient.patch("/patch-issuetype", {
        type: value,
        uuid: uuid,
      });

      // Trigger alert on success
      triggerAlert("success", response.data.message);
    } catch (error) {
      // 5. Rollback to the snapshot if the API call fails
      queryClient.setQueryData(activeQueryKey, previousData);

      const errorMessage = getApiErrorMessage(error);
      console.error("Error while trying to patch issue type:", errorMessage);
      triggerAlert("error", errorMessage);
    } finally {
      // 6. Always refetch in the background after error or success to sync with the server
      queryClient.invalidateQueries({ queryKey: activeQueryKey });
    }
  };

  const handleSelect = (value: string) => {
    setIsOpen(false);

    triggerDialog({
      title: "Change Issue Type",
      description: `Confirm changing the issue type to ${value}`,
      onConfirm: () => handleIssueTypeUpdate(value),
    });
  };
  return (
    <div className="relative w-fit" ref={dropdownRef}>
      <button
        type="button" // Prevent form submission if inside a form
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-9.5 w-full min-w-43 items-center justify-between rounded-xl border bg-white px-3 text-sm transition-all sm:w-auto dark:bg-neutral-950 ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
        }`}
      >
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
          <Bug className="h-4 w-4" />
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
            Change type
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="default-scrollbar absolute top-full right-0 z-20 mt-2 max-h-80 w-full min-w-50 origin-top-right overflow-y-auto rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
          <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase">
            Type Options
          </div>

          {loading ? (
            <div className="flex items-center gap-1 px-3 py-6 text-sm text-neutral-400 dark:text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : options.length > 0 ? (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                disabled={currentType === option.value}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <span>{option.option}</span>
                {currentType === option.value && (
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))
          ) : (
            /* Fallback state when no options exist */
            <div className="px-3 py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
              No issue types found for this selection.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IssueTypeModal;
