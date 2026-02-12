"use client";

import { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import ClientPortal from "../ClientPortal";
import { useState } from "react";
import { X, Asterisk, Bot, UserRoundCog } from "lucide-react";
import { fetchedIssueAgentsMapping } from "@/serverActions/GetIssueTypes";
import { IssueAgentMapping } from "@/serverActions/GetIssueTypes";
import apiClient from "@/lib/AxiosClient";
import { PromiseOverlay } from "../Overlays";
import ConfirmationDialog from "../Overlays";
import DynamicIssueTypes from "./DynamicIssueTypes";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAlert } from "@/contexts/AlertContext";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import { useAutomationsData } from "@/contexts/AutomationsDataContext";
import { useIssuesCards } from "@/contexts/IssuesCardsContext";
import { useAutomations } from "@/contexts/AutomationCardsContext";
import OptionsDropDown from "./OptionsDropDown";
import { baseDepartments } from "@/public/assets";

type MainIssueModalProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const MainIssueModal = ({ isOpen, setIsOpen }: MainIssueModalProps) => {
  const [formData, setFormData] = useState({
    target_department: "",
    issue_type: "",
    issue_title: "",
    issue_description: "",
  });

  // State for the Assignment Bot Card
  const [assignmentInfo, setAssignmentInfo] =
    useState<IssueAgentMapping | null>(null);
  const [isFetchingAssignment, setIsFetchingAssignment] = useState(false);

  const { setAlertInfo, alertInfo } = useAlert();
  const [loading, setLoading] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const { refetchIssues } = useIssuesData();
  const { refetchAutomations } = useAutomationsData();
  const { refetchAutomationCounts } = useAutomations();
  const { refetchIssuesCounts } = useIssuesCards();

  // set options error
  const optionsError = alertInfo.alertType === "error";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  // Function to show the confirmation dialog
  const handleConfirmSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.target_department || !formData.issue_type) {
      setAlertInfo({
        showAlert: true,
        alertType: "error",
        alertMessage: "Missing some required fields",
      });
    } else {
      setShowConfirmationDialog(true);
    }
  };

  // Function for handling issue submission
  const handleFormSubmit = async () => {
    setShowConfirmationDialog(false);
    setLoading(true);

    try {
      // post issue api endpoint
      const response = await apiClient.post("/post-issue", formData);

      setAlertInfo({
        showAlert: true,
        alertType: "success",
        alertMessage: response.data.message || "Issue Submitted Successfully",
      });

      // Clear form data
      setFormData({
        target_department: "",
        issue_type: "",
        issue_title: "",
        issue_description: "",
      });

      setAssignmentInfo(null); // Clear assignment info

      // refetch all data
      refetchIssues();
      refetchAutomations();
      refetchAutomationCounts();
      refetchIssuesCounts();

      // Close issue modal
      setIsOpen(false);
    } catch (error) {
      // Call the error helper
      const errorMessage = getApiErrorMessage(error);
      // 4. Update the UI with the error
      setAlertInfo({
        showAlert: true,
        alertType: "error",
        alertMessage: errorMessage,
      });
      console.error("Error submitting the issue:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Submitting overlay */}
      {loading && <PromiseOverlay overlaytext="Submitting" />}

      {showConfirmationDialog && (
        <ConfirmationDialog
          title="Submit Issue"
          message="Are you sure you want to submit this issue?"
          onCancel={() => setShowConfirmationDialog(false)}
          onConfirm={handleFormSubmit}
        />
      )}
      <ClientPortal>
        {/* Backdrop */}
        <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 dark:bg-black/60">
          {/* Modal Container */}
          <div className="w-full max-w-lg rounded-2xl border border-neutral-300 bg-neutral-50 p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Create A New Issue
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Issue Form */}
            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              {/* Row: Department & Target Department */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="target_department"
                    className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
                  >
                    Target Department{" "}
                    <Asterisk className="h-3 w-3 text-red-500" />
                  </label>

                  {/* Options Dropdown */}
                  <OptionsDropDown
                    value={formData.target_department}
                    onChange={handleDepartmentChange}
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
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative overflow-hidden rounded-lg border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200">
                        {isFetchingAssignment ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        ) : (
                          <Bot size={18} />
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
                            <div className="mt-1 flex items-center gap-4">
                              <div className="flex items-center gap-1.5 font-semibold">
                                <UserRoundCog size={14} />
                                <span>Agent: {assignmentInfo?.agent_name}</span>
                              </div>

                              <div className="flex items-center gap-1.5 opacity-75">
                                <span>
                                  (
                                  <span className="font-semibold">
                                    Dept Admin
                                  </span>
                                  : {assignmentInfo?.admin_name})
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
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
                  <Asterisk className="h-3 w-3 text-red-500" />
                </label>
                <input
                  type="text"
                  name="issue_title"
                  id="issue_title"
                  value={formData.issue_title}
                  onChange={handleChange}
                  required
                  maxLength={50}
                  placeholder="Brief summary of the issue (50 characters maximum)"
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Issue Description */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="issue_description"
                  className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
                >
                  Description
                  <Asterisk className="h-3 w-3 text-red-500" />
                </label>
                <textarea
                  id="issue_description"
                  name="issue_description"
                  value={formData.issue_description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Please describe the issue in detail..."
                  className="resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:focus:ring-offset-neutral-900"
                >
                  Submit Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      </ClientPortal>
    </>
  );
};

export default MainIssueModal;
