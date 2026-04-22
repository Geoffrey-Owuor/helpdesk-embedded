"use client";

import { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import ClientPortal from "../ClientPortal";
import { useState, useRef, useCallback } from "react";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import {
  X,
  UserRoundCog,
  BotMessageSquare,
  ArrowUpDown,
  Zap,
  LucideIcon,
  ArrowUp,
  ArrowDown,
  Ellipsis,
  MoveHorizontal,
  ChevronDown,
  ContactRound,
  UserRound,
} from "lucide-react";
import { fetchedIssueAgentsMapping } from "@/serverActions/GetIssueTypes";
import { IssueAgentMapping } from "@/serverActions/GetIssueTypes";
import apiClient from "@/lib/AxiosClient";
import DynamicIssueTypes from "./DynamicIssueTypes";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAlertStore } from "@/store/useAlertStore";
import OptionsDropDown from "./OptionsDropDown";
import { fetchedBaseDepartments } from "@/serverActions/GetBaseDepartments";
import FormAsterisk from "../FormAsterisk";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useSearchStore } from "@/store/useSearchStore";
import { useUser } from "@/contexts/UserContext";
import SubmitForAUser, { SubmitForUserData } from "./SubmitForAUser";

// Priority icon types
const priorityIcons: Record<string, LucideIcon> = {
  Critical: Zap,
  High: ArrowUp,
  Medium: MoveHorizontal,
  Low: ArrowDown,
};

// Dynamic Icon Helper
const DynamicIcon = ({ priority }: { priority: string }) => {
  // getting the icon we want
  const IconComponent = priorityIcons[priority]
    ? priorityIcons[priority]
    : Ellipsis;

  return (
    <div className="rounded-full bg-blue-200 p-1 text-blue-600">
      <IconComponent className="h-3.5 w-3.5 animate-pulse" />
    </div>
  );
};

type MainIssueModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const MainIssueModal = ({ isOpen, setIsOpen }: MainIssueModalProps) => {
  const queryClient = useQueryClient();

  const { role } = useUser();

  // Fetch the departments
  const { data: baseDepartments = [], isPending: loading } = useQuery({
    queryKey: ["BaseDepartmentsData"],
    queryFn: fetchedBaseDepartments,
    enabled: isOpen,
  });

  const [formData, setFormData] = useState({
    target_department: "",
    issue_type: "",
    issue_title: "",
    issue_description: "",
    // new optional fields — only sent when submitForUserData is set
    behalf_user_name: "",
    behalf_user_email: "",
    behalf_user_department: "",
  });

  // Submit for user states
  const [isSubmitForUserOpen, setIsSubmitForUserOpen] = useState(false);
  const [submitForUserData, setSubmitForUserData] =
    useState<SubmitForUserData | null>(null);

  const handleSubmitForUserConfirm = (data: SubmitForUserData) => {
    setSubmitForUserData(data);
  };

  // Tab Focus Trapping
  const closeModal = useCallback(() => setIsOpen(false), [setIsOpen]);
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrapping(modalRef, isOpen, closeModal);

  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const selectedDepartment = useSearchStore(
    (state) => state.selectedDepartment,
  );

  // State for the Assignment Bot Card
  const [assignmentInfo, setAssignmentInfo] =
    useState<IssueAgentMapping | null>(null);
  const [isFetchingAssignment, setIsFetchingAssignment] = useState(false);

  // State Data
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const alertType = useAlertStore((state) => state.alertType);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);

  const activeQueryKey = [
    "issuesDashboardData",
    superAdminFilter,
    agentAdminFilter,
  ];

  const activeCardsKey = [
    "dashboardIssueCounts",
    agentAdminFilter,
    superAdminFilter,
  ];
  const automationsQueryKey = ["automationsDashboardData", selectedDepartment];
  const automationCardsKey = ["dashboardAutomationCounts", selectedDepartment];

  // set options error
  const optionsError = alertType === "error";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //function to remove trailing whitespaces
  const handleBlur = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  // Specific handler for department
  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      target_department: value,
      issue_type: "",
    }));
    setAssignmentInfo(null); //clear previously set assignment info
  };

  // Handler for issue types
  const handleIssueChange = async (value: string) => {
    setFormData((prev) => ({
      ...prev,
      issue_type: value,
    }));

    // 2. Fetch Assignment Info
    if (value) {
      setIsFetchingAssignment(true);
      try {
        const info = await fetchedIssueAgentsMapping(
          value,
          formData.target_department,
        );
        setAssignmentInfo(info);
      } catch (error) {
        console.error("Failed to fetch assignment info", error);
      } finally {
        setIsFetchingAssignment(false);
      }
    } else {
      setAssignmentInfo(null);
    }
  };

  // Function for handling issue submission
  const handleFormSubmit = async () => {
    const payload = {
      ...formData,
      ...(submitForUserData && {
        behalf_user_name: submitForUserData.user_name,
        behalf_user_email: submitForUserData.user_email,
        behalf_user_department: submitForUserData.user_department,
      }),
    };
    hideDialog();

    showOverlay("Adding");

    try {
      // post issue api endpoint
      const response = await apiClient.post("/post-issue", payload);

      // Refetch issues data in the background
      queryClient.invalidateQueries({ queryKey: activeQueryKey });
      queryClient.invalidateQueries({ queryKey: activeCardsKey });

      // Refetch automations data if issue type is Automation
      if (formData.issue_type === "Automation") {
        queryClient.invalidateQueries({ queryKey: automationsQueryKey });
        queryClient.invalidateQueries({ queryKey: automationCardsKey });
      }

      // Hide the overlay
      hideOverlay();

      // Clear form data
      setFormData({
        target_department: "",
        issue_type: "",
        issue_title: "",
        issue_description: "",
        behalf_user_name: "",
        behalf_user_email: "",
        behalf_user_department: "",
      });

      // Clear submitForUserData
      setSubmitForUserData(null);

      setAssignmentInfo(null); // Clear assignment info

      // Close issue modal
      setIsOpen(false);

      // Trigger alert on success
      triggerAlert("success", response.data.message);
    } catch (error) {
      hideOverlay();
      // Call the error helper
      const errorMessage = getApiErrorMessage(error);
      // 4. Trigger alert on error
      triggerAlert("error", errorMessage);
      console.error("Error submitting the issue:", error);
    }
  };

  // Function to show the confirmation dialog
  const handleConfirmSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.target_department || !formData.issue_type) {
      triggerAlert("error", "Missing some required fields");
    } else {
      triggerDialog({
        title: "Submit Issue",
        description: "Confirm submission of the issue.",
        onConfirm: handleFormSubmit,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/60">
        {/* Modal Container */}
        <div
          ref={modalRef}
          className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-neutral-300 bg-neutral-50 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-900">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Create A New Issue
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Issue Form */}
          <div className="layout-scrollbar flex-1 overflow-y-auto p-6">
            <form
              onSubmit={handleConfirmSubmit}
              autoComplete="off"
              className="space-y-4"
            >
              {/* Button for submitting for another user */}
              {role !== "user" && (
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitForUserOpen((prev) => !prev)}
                    className="inline-flex items-center justify-between gap-2.5 rounded-xl bg-neutral-950 px-3 py-2 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <ContactRound className="h-4 w-4" />
                      <span>Submit for a user</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isSubmitForUserOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Clear button — only visible when user data has been set */}
                  {submitForUserData && !isSubmitForUserOpen && (
                    <button
                      type="button"
                      onClick={() => setSubmitForUserData(null)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    >
                      <X size={14} />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              )}

              {/* Submit for user modal */}
              <SubmitForAUser
                isOpen={isSubmitForUserOpen}
                setIsOpen={setIsSubmitForUserOpen}
                onConfirm={handleSubmitForUserConfirm}
              />

              {/* A card that displays the selected user info - only displayed when all required submitForUserData is available and isSubmitForUserOpen is false */}
              {submitForUserData && !isSubmitForUserOpen && (
                <div className="w-fit rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      <UserRound size={16} />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {submitForUserData.user_name}
                      </span>
                      <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                        {submitForUserData.user_email}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-lg bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      {submitForUserData.user_department}
                    </span>
                  </div>
                </div>
              )}

              {/* Row: Department & Target Department */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="target_department"
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
                  >
                    Target Department <FormAsterisk />
                  </label>

                  {/* Options Dropdown */}
                  <OptionsDropDown
                    value={formData.target_department}
                    onChange={handleDepartmentChange}
                    loading={loading}
                    options={baseDepartments}
                    dropDownType="department"
                    error={optionsError}
                  />
                </div>

                {/* Dynamic Issue Types */}
                <DynamicIssueTypes
                  value={formData.issue_type}
                  onChange={handleIssueChange}
                  department={formData.target_department}
                  error={optionsError}
                />
              </div>

              {/* --- NEW: Auto-Assignment Bot Card --- */}
              {(assignmentInfo || isFetchingAssignment) && (
                <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200">
                      {isFetchingAssignment ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                      ) : (
                        <BotMessageSquare size={18} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Auto-Assignment Bot
                      </h4>

                      {isFetchingAssignment ? (
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Finding the best agent for this issue...
                        </p>
                      ) : (
                        <div className="mt-1 flex flex-col gap-1 text-xs text-blue-700 dark:text-blue-300">
                          <p>
                            Based on your selection, this issue may be assigned
                            to:
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1.5 font-semibold">
                              <UserRoundCog size={14} />
                              <span>
                                Agent:{" "}
                                {assignmentInfo?.agent_name || "None found"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 opacity-75">
                              <span>
                                (
                                <span className="font-semibold">
                                  Dept Admin
                                </span>
                                : {assignmentInfo?.admin_name || "None found"})
                              </span>
                            </div>

                            {/* Current issue priority */}
                            <div className="flex items-center gap-1.5 font-semibold">
                              <ArrowUpDown size={14} />
                              <span>
                                Default priority:{" "}
                                <span className="font-normal">
                                  {assignmentInfo?.issue_priority || "None"}
                                </span>
                              </span>
                              {/* Dynamic Icon */}
                              <DynamicIcon
                                priority={
                                  assignmentInfo?.issue_priority
                                    ? assignmentInfo.issue_priority
                                    : "None"
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Issue Title */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="issue_title"
                  className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
                >
                  Issue Title
                  <FormAsterisk />
                </label>
                <input
                  type="text"
                  name="issue_title"
                  id="issue_title"
                  value={formData.issue_title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  maxLength={50}
                  placeholder="Brief summary of the issue (50 characters maximum)"
                  className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Issue Description */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="issue_description"
                  className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
                >
                  Description
                  <FormAsterisk />
                </label>
                <textarea
                  id="issue_description"
                  name="issue_description"
                  value={formData.issue_description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  rows={4}
                  placeholder="Please describe the issue in detail..."
                  className="resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    !formData.issue_title ||
                    !formData.issue_description ||
                    !formData.issue_type ||
                    !formData.target_department
                  }
                  className="w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:focus:ring-offset-neutral-900"
                >
                  Submit Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

export default MainIssueModal;
