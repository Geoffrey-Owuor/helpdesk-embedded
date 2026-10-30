"use client";

import { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Send,
  CircleQuestionMark,
} from "lucide-react";
import { fetchedIssueAgentsMapping } from "@/serverActions/GetIssueTypes";
import apiClient from "@/lib/AxiosClient";
import { IssueAgentMapping } from "@/serverActions/GetIssueTypes";
import DynamicIssueTypes from "../IssueModals/DynamicIssueTypes";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAlertStore } from "@/store/useAlertStore";
import OptionsDropDown from "../IssueModals/OptionsDropDown";
import { fetchedBaseDepartments } from "@/serverActions/GetBaseDepartments";
import FormAsterisk from "../FormAsterisk";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import SubmitForAUser, {
  SubmitForUserData,
} from "../IssueModals/SubmitForAUser";
import DocumentUpload from "../IssueModals/DocumentUpload";
import Link from "next/link";
import { invalidateIssuesCaches } from "@/utils/invalidateIssuesCaches";
import AiRefineSuggestion from "../IssueModals/AiRefineSuggestion";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

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

// The New Issue page (/dashboard/new-issue)
const NewIssueForm = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { role } = useUser();

  // Fetch the departments
  const {
    data: baseDepartments = [],
    isPending: loading,
    isError: departmentsError,
  } = useQuery({
    queryKey: ["BaseDepartmentsData"],
    queryFn: fetchedBaseDepartments,
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

  // State for adding files
  const [files, setFiles] = useState<File[]>([]);

  // Set once a submit is tried, so empty required dropdowns can turn red
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Submit for user states
  const [isSubmitForUserOpen, setIsSubmitForUserOpen] = useState(false);
  const [submitForUserData, setSubmitForUserData] =
    useState<SubmitForUserData | null>(null);
  // Whether any submit-for-user detail has been entered, complete or not
  const [hasSubmitForUserInput, setHasSubmitForUserInput] = useState(false);
  // Bumped to remount (and so empty) the submit-for-user form
  const [submitForUserKey, setSubmitForUserKey] = useState(0);

  const handleSubmitForUserChange = (
    data: SubmitForUserData | null,
    hasInput: boolean,
  ) => {
    setSubmitForUserData(data);
    setHasSubmitForUserInput(hasInput);
  };

  const clearSubmitForUser = () => {
    setSubmitForUserData(null);
    setHasSubmitForUserInput(false);
    setSubmitForUserKey((key) => key + 1);
  };

  // With a single target department there's nothing to choose, so it's
  // picked for them (still shown); with several the user picks one
  const targetDepartment =
    formData.target_department ||
    (baseDepartments.length === 1 ? baseDepartments[0].value : "");

  // Anything typed, picked or attached would be lost by leaving the page
  const isDirty =
    Object.values(formData).some(Boolean) ||
    files.length > 0 ||
    hasSubmitForUserInput;

  useUnsavedChangesGuard(isDirty, {
    title: "Discard This Issue?",
    description:
      "You haven't submitted this issue. Leaving the page will discard what you've entered.",
  });

  // State for the Assignment Bot Card
  const [assignmentInfo, setAssignmentInfo] =
    useState<IssueAgentMapping | null>(null);
  const [isFetchingAssignment, setIsFetchingAssignment] = useState(false);

  // State Data
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);

  // Each dropdown is red only for its own problem - its options failed to
  // load, or it's still empty after a submit attempt
  const departmentError =
    departmentsError || (submitAttempted && !targetDepartment);
  const issueTypeError = submitAttempted && !formData.issue_type;

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
        const info = await fetchedIssueAgentsMapping(value, targetDepartment);
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
      target_department: targetDepartment,
      ...(submitForUserData && {
        behalf_user_name: submitForUserData.user_name,
        behalf_user_email: submitForUserData.user_email,
        behalf_user_department: submitForUserData.user_department,
      }),
    };

    hideDialog();

    showOverlay("Adding");

    try {
      const submitData = new FormData();

      // Append all our text payload fields dynamically
      Object.entries(payload).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // Append the files (using the same key "attachments" so the backend expects an array)
      files.forEach((file) => {
        submitData.append("attachments", file);
      });

      const response = await apiClient.post("/post-issue", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refetch issues/cards/analytics data in the background
      invalidateIssuesCaches(queryClient);

      // Hide the overlay
      hideOverlay();

      // Open the new issue - its reference, agent and status are there
      const issueUuid: string | undefined = response.data.issue_uuid;
      router.push(issueUuid ? `/dashboard/${issueUuid}` : "/dashboard");

      // Trigger alert on success
      triggerAlert(
        "success",
        response.data.message || "Issue created successfully",
      );
    } catch (error) {
      hideOverlay();
      triggerAlert("error", getApiErrorMessage(error));
    }
  };

  // Function to show the confirmation dialog
  const handleConfirmSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!targetDepartment || !formData.issue_type) {
      triggerAlert("error", "Missing some required fields");
    } else if (hasSubmitForUserInput && !submitForUserData) {
      // Half-entered user details would otherwise submit in your own name
      setIsSubmitForUserOpen(true);
      triggerAlert(
        "error",
        "Complete or clear the user details before submitting",
      );
    } else {
      triggerDialog({
        title: "Submit Issue",
        description: submitForUserData
          ? `Confirm submitting this issue for ${submitForUserData.user_name} (${submitForUserData.user_email}).`
          : "Confirm submission of the issue.",
        onConfirm: handleFormSubmit,
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-6 md:py-4">
      <div className="mb-4 inline-flex flex-col">
        <h1 className="text-xl font-semibold">Create A New Issue</h1>
        <span className="text-sm text-neutral-800 dark:text-neutral-400">
          Enter the required issue details and submit.
        </span>
      </div>

      {/* Issue Form */}
      <form
        onSubmit={handleConfirmSubmit}
        autoComplete="off"
        className="rounded-2xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-5">
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

              {/* Clear button — only visible once user details are entered */}
              {hasSubmitForUserInput && (
                <button
                  type="button"
                  onClick={clearSubmitForUser}
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
            key={submitForUserKey}
            isOpen={isSubmitForUserOpen}
            onChange={handleSubmitForUserChange}
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
                value={targetDepartment}
                onChange={handleDepartmentChange}
                loading={loading}
                options={baseDepartments}
                dropDownType="department"
                error={departmentError}
              />
            </div>

            {/* Dynamic Issue Types */}
            <DynamicIssueTypes
              value={formData.issue_type}
              onChange={handleIssueChange}
              department={targetDepartment}
              error={issueTypeError}
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
                        Based on your selection, this issue may be assigned to:
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <UserRoundCog size={14} />
                          <span>
                            Agent: {assignmentInfo?.agent_name || "None found"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 opacity-75">
                          <span>
                            (<span className="font-semibold">Admin</span>:{" "}
                            {assignmentInfo?.admin_name || "None found"})
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

          {/* AI Refine Suggestion */}
          {role !== "user" && (
            <AiRefineSuggestion
              title={formData.issue_title}
              description={formData.issue_description}
              onRefine={async () => {
                const response = await apiClient.post("/ai/refine-issue", {
                  title: formData.issue_title,
                  description: formData.issue_description,
                });
                return response.data;
              }}
              onApply={(title, description) =>
                setFormData((prev) => ({
                  ...prev,
                  issue_title: title,
                  issue_description: description,
                }))
              }
            />
          )}

          {/* Document Upload */}
          <DocumentUpload
            files={files}
            setFiles={setFiles}
            maxTotalSizeMB={2}
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between gap-4 border-t border-neutral-200 px-4 py-3 sm:px-6 dark:border-neutral-800">
          <Link
            href="/manual#issues-docs"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
          >
            <CircleQuestionMark className="h-3 w-3" />
            Issue types docs
          </Link>
          <button
            type="submit"
            disabled={
              !formData.issue_title ||
              !formData.issue_description ||
              !formData.issue_type ||
              !targetDepartment
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-400 dark:focus:ring-offset-neutral-900"
          >
            Submit
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewIssueForm;
