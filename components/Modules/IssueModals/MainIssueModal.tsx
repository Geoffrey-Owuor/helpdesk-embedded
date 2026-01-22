"use client";

import { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import ClientPortal from "../ClientPortal";
import { useState } from "react";
import { X, ChevronDown, Asterisk } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { PromiseOverlay } from "../Overlays";
import ConfirmationDialog from "../Overlays";
import DynamicIssueTypes from "./DynamicIssueTypes";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAlert } from "@/contexts/AlertContext";
import { useIssuesData } from "@/contexts/IssuesDataContext";

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
  const { setAlertInfo } = useAlert();
  const [loading, setLoading] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const { refetchIssues } = useIssuesData();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to show the confirmation dialog
  const handleConfirmSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowConfirmationDialog(true);
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

      // refetch issues
      refetchIssues();

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
          message="Are you sure you want to submit this issue? (You cannot edit after submitting)"
          onCancel={() => setShowConfirmationDialog(false)}
          onConfirm={handleFormSubmit}
        />
      )}
      <ClientPortal>
        {/* Backdrop */}
        <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 dark:bg-black/60">
          {/* Modal Container */}
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
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
                  <div className="relative">
                    <select
                      id="target_department"
                      name="target_department"
                      value={formData.target_department}
                      onChange={handleChange}
                      required
                      className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    >
                      <option value="" disabled>
                        Direct this issue to...
                      </option>
                      <option value="IT & Projects">IT & Projects</option>
                      <option value="Finance">Finance</option>
                    </select>
                    {/* Lucide Chevron Icon */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-neutral-500">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* Dynamic Issue Types */}
                <DynamicIssueTypes
                  value={formData.issue_type}
                  handleChange={handleChange}
                  department={formData.target_department}
                />
              </div>

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
                  className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
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
                  className="resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:focus:ring-offset-neutral-900"
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
