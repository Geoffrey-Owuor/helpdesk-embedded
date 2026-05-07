"use client";

import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
  useRef,
  useCallback,
} from "react";
import ClientPortal from "../Modules/ClientPortal";
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
  CheckCircle2,
  UserRound,
  Send,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import {
  fetchedIssueAgentsMapping,
  IssueAgentMapping,
} from "@/serverActions/GetIssueTypes";
import { fetchedBaseDepartments } from "@/serverActions/GetBaseDepartments";
import { UserRecord } from "@/serverActions/FetchUserRecords";
import { NameValidationResult, NameValidator } from "@/utils/Validators";
import { baseDepartments } from "@/public/assets";

// Stores
import { useAlertStore } from "@/store/useAlertStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";

// Components
import DynamicIssueTypes from "../Modules/IssueModals/DynamicIssueTypes";
import OptionsDropDown from "../Modules/IssueModals/OptionsDropDown";
import FormAsterisk from "../Modules/FormAsterisk";
import UserEmailAutocomplete from "../Modules/IssueModals/UserEmailAutocomplete";
import NameRulesCard from "../Modules/NameRulesCard";

// Priority icon types & helper (Kept inline for reliability)
const priorityIcons: Record<string, LucideIcon> = {
  Critical: Zap,
  High: ArrowUp,
  Medium: MoveHorizontal,
  Low: ArrowDown,
};

const DynamicIcon = ({ priority }: { priority: string }) => {
  const IconComponent = priorityIcons[priority] || Ellipsis;
  return (
    <div className="rounded-full bg-blue-200 p-1 text-blue-600">
      <IconComponent className="h-3.5 w-3.5 animate-pulse" />
    </div>
  );
};

type QuickCreateModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const QuickCreateModal = ({ isOpen, setIsOpen }: QuickCreateModalProps) => {
  // Fetch departments
  const { data: fetchedDepartments = [], isPending: loadingDepartments } =
    useQuery({
      queryKey: ["BaseDepartmentsData"],
      queryFn: fetchedBaseDepartments,
      enabled: isOpen,
    });

  // --- UNIFIED FORM STATE ---
  const [formData, setFormData] = useState({
    // User Details (Mandatory for Quick Create)
    user_email: "",
    user_name: "",
    user_department: "",
    // Issue Details
    target_department: "",
    issue_type: "",
    issue_title: "",
    issue_description: "",
  });

  // Name validation states
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [nameValidation, setNameValidation] = useState<NameValidationResult>({
    hasTwoNames: true,
    isCapitalized: true,
    singleSpace: true,
    isValid: true,
  });

  // Bot Assignment State
  const [assignmentInfo, setAssignmentInfo] =
    useState<IssueAgentMapping | null>(null);
  const [isFetchingAssignment, setIsFetchingAssignment] = useState(false);

  // Global Stores
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const alertType = useAlertStore((state) => state.alertType);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);

  const optionsError = alertType === "error";

  // Tab Focus Trapping
  const closeModal = useCallback(() => setIsOpen(false), [setIsOpen]);
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrapping(modalRef, isOpen, closeModal);

  // --- HANDLERS ---
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "user_name") {
      setNameValidation(NameValidator(value));
    }
  };

  const handleBlur = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleUserAutofill = (user: UserRecord) => {
    setFormData((prev) => ({
      ...prev,
      user_email: user.email,
      user_name: user.name,
      user_department: user.department,
    }));
    setNameValidation(NameValidator(user.name));
  };

  const handleUserDepartmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, user_department: value }));
  };

  const handleTargetDepartmentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      target_department: value,
      issue_type: "",
    }));
    setAssignmentInfo(null);
  };

  const handleIssueChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, issue_type: value }));

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

  const handleFormSubmit = async () => {
    hideDialog();
    showOverlay("Adding");

    try {
      // TODO: Verify if you use a separate endpoint for Quick Create or the standard "/post-issue"
      const response = await apiClient.post(
        `/quick-create?secret=${process.env.NEXT_PUBLIC_APIS_KEY}`,
        formData,
      );

      hideOverlay();
      setIsOpen(false);
      setFormData({
        user_email: "",
        user_name: "",
        user_department: "",
        target_department: "",
        issue_type: "",
        issue_title: "",
        issue_description: "",
      });
      setAssignmentInfo(null);
      triggerAlert(
        "success",
        response.data.message || "Issue created successfully",
      );
    } catch (error) {
      hideOverlay();
      triggerAlert("error", getApiErrorMessage(error));
    }
  };

  const handleConfirmSubmit = (e: FormEvent) => {
    e.preventDefault();
    triggerDialog({
      title: "Submit Quick Issue",
      description: "Confirm submission of this quick issue.",
      onConfirm: handleFormSubmit,
    });
  };

  // Validation check for button state
  const isFormValid =
    formData.user_name.trim() &&
    formData.user_email.trim() &&
    formData.user_department &&
    nameValidation.isValid &&
    formData.target_department &&
    formData.issue_type &&
    formData.issue_title.trim() &&
    formData.issue_description.trim();

  if (!isOpen) return null;

  return (
    <ClientPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 dark:bg-black/80">
        <div
          ref={modalRef}
          className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-neutral-300 bg-neutral-50 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200/50 p-4 dark:border-neutral-900">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Quick Create Issue
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Submit an issue quickly without logging in.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Body */}
          <div className="layout-scrollbar flex-1 overflow-y-auto p-6">
            <form
              onSubmit={handleConfirmSubmit}
              autoComplete="off"
              className="space-y-8"
            >
              {/* --- SECTION 1: USER DETAILS --- */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  1. Your Details
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Email */}
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label
                      htmlFor="user_email"
                      className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
                    >
                      Email Address <FormAsterisk />{" "}
                      <span className="text-[10px] font-normal lowercase">
                        Double-check for follow-up alerts.
                      </span>
                    </label>

                    <UserEmailAutocomplete
                      id="user_email"
                      name="user_email"
                      value={formData.user_email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onSelectUser={handleUserAutofill}
                      placeholder="Enter your email..."
                    />
                  </div>

                  {/* Name */}
                  <div className="relative flex flex-col gap-1">
                    <NameRulesCard
                      validation={nameValidation}
                      isVisible={isNameFocused}
                    />
                    <label
                      htmlFor="user_name"
                      className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
                    >
                      Full Name <FormAsterisk />
                    </label>
                    <div className="relative">
                      <div className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2">
                        {formData.user_name && nameValidation.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <UserRound className="h-4 w-4 text-neutral-400" />
                        )}
                      </div>
                      <input
                        type="text"
                        id="user_name"
                        name="user_name"
                        value={formData.user_name}
                        onFocus={() => setIsNameFocused(true)}
                        onChange={handleChange}
                        onBlur={(e) => {
                          setIsNameFocused(false);
                          handleBlur(e);
                        }}
                        required
                        placeholder="Your full name"
                        className={`w-full rounded-xl border bg-white py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-1 focus:outline-none dark:bg-neutral-900 dark:text-neutral-100 ${
                          !nameValidation.isValid &&
                          formData.user_name.length > 0 &&
                          !isNameFocused
                            ? "border-red-400 focus:border-red-400 focus:ring-red-200 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-900"
                            : "border-neutral-300 focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700"
                        }`}
                      />
                    </div>
                  </div>

                  {/* User Department */}
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                      Your Department <FormAsterisk />
                    </label>
                    <OptionsDropDown
                      value={formData.user_department}
                      onChange={handleUserDepartmentChange}
                      loading={false}
                      options={baseDepartments}
                      dropDownType="department"
                      error={false}
                    />
                  </div>
                </div>
              </div>

              {/* --- SECTION 2: ISSUE DETAILS --- */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  2. Issue Details
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Target Department */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="target_department"
                      className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
                    >
                      Target Department <FormAsterisk />
                    </label>
                    <OptionsDropDown
                      value={formData.target_department}
                      onChange={handleTargetDepartmentChange}
                      loading={loadingDepartments}
                      options={fetchedDepartments}
                      dropDownType="department"
                      error={optionsError}
                    />
                  </div>

                  {/* Issue Type */}
                  <DynamicIssueTypes
                    value={formData.issue_type}
                    onChange={handleIssueChange}
                    department={formData.target_department}
                    error={optionsError}
                  />
                </div>

                {/* Bot Assignment Card */}
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
                              Based on your selection, this issue may be
                              assigned to:
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
                                  : {assignmentInfo?.admin_name || "None found"}
                                  )
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 font-semibold">
                                <ArrowUpDown size={14} />
                                <span>
                                  Default priority:{" "}
                                  <span className="font-normal">
                                    {assignmentInfo?.issue_priority || "None"}
                                  </span>
                                </span>
                                <DynamicIcon
                                  priority={
                                    assignmentInfo?.issue_priority || "None"
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

                {/* Title */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="issue_title"
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
                  >
                    Issue Title <FormAsterisk />
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

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="issue_description"
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
                  >
                    Description <FormAsterisk />
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
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:focus:ring-offset-neutral-900"
                >
                  Submit Quick Issue
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

export default QuickCreateModal;
