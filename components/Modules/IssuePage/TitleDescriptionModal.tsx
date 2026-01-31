"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { useAlert } from "@/contexts/AlertContext";
import { PromiseOverlay } from "../Overlays";
import ConfirmationDialog from "../Overlays";
import ClientPortal from "../ClientPortal";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import apiClient from "@/lib/AxiosClient";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import { useAutomationsData } from "@/contexts/AutomationsDataContext";
import { useIssuesCards } from "@/contexts/IssuesCardsContext";
import { useAutomations } from "@/contexts/AutomationCardsContext";
import { Asterisk, X } from "lucide-react";
import { IssueValueTypes } from "@/contexts/IssuesDataContext";

type TitleDescriptionModalProps = {
  title: IssueValueTypes;
  description: IssueValueTypes;
  uuid: string;
  closeModal: () => void;
};
const TitleDescriptionModal = ({
  title,
  description,
  uuid,
  closeModal,
}: TitleDescriptionModalProps) => {
  const [formData, setFormData] = useState({
    issue_title: title || "",
    issue_description: description || "",
  });

  const [updating, setUpdating] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  // context data
  const { setAlertInfo } = useAlert();
  const { refetchIssues } = useIssuesData();
  const { refetchAutomations } = useAutomationsData();
  const { refetchIssuesCounts } = useIssuesCards();
  const { refetchAutomationCounts } = useAutomations();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //the handle confirm submit function
  const handleConfirmSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowConfirmationDialog(true);
  };

  // the handle submit function
  const handleSubmit = async () => {
    setShowConfirmationDialog(false);
    setUpdating(true);

    // compile our data into one object
    const payload = {
      ...formData,
      uuid,
    };

    try {
      const response = await apiClient.put("/update-issueinfo", payload);

      // Set a success alert
      setAlertInfo({
        alertType: "success",
        showAlert: true,
        alertMessage:
          response.data.message || "Issue status updated successfully",
      });

      // clear the form data
      setFormData({ issue_title: "", issue_description: "" });
      // refetch data
      refetchIssues();
      refetchAutomations();
      refetchAutomationCounts();
      refetchIssuesCounts();

      // close the modal
      closeModal();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      setAlertInfo({
        alertType: "error",
        showAlert: true,
        alertMessage: errorMessage,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      {updating && <PromiseOverlay overlaytext="loading" />}
      {showConfirmationDialog && (
        <ConfirmationDialog
          title="Update Issue Info"
          onConfirm={handleSubmit}
          onCancel={() => setShowConfirmationDialog(false)}
          message="Are you sure you want to update the issue info"
        />
      )}
      <ClientPortal>
        {/* Backdrop */}
        <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 dark:bg-black/60">
          {/* Modal Container */}
          <div className="w-full max-w-lg rounded-2xl border border-neutral-300 bg-neutral-50 p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Update Title & Description
              </h2>
              <button
                onClick={closeModal}
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Update Form */}
            <form onSubmit={handleConfirmSubmit} className="space-y-6">
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

              {/* Update button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:focus:ring-offset-neutral-900"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </ClientPortal>
    </>
  );
};

export default TitleDescriptionModal;
