"use client";
import CustomAgentsDropdown from "./CustomAgentsDropdown";
import CustomDropdown from "./CustomDropDown";
import ClientPortal from "../../ClientPortal";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { useState, useRef, FocusEvent } from "react";
import { DropdownOption } from "./CustomDropDown";
import { Bug, X } from "lucide-react";
import FormAsterisk from "../../FormAsterisk";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useAlertStore } from "@/store/useAlertStore";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { IssueMappingRecord } from "../IssuesMapping/IssuesMapping";

export const priorityOptions: DropdownOption[] = [
  { option: "Low", value: "Low" },
  { option: "Medium", value: "Medium" },
  { option: "High", value: "High" },
  { option: "Critical", value: "Critical" },
];

export interface EditIssueInfo {
  issueType: string;
  issuePriority: string;
  agentEmail: string;
  adminEmail: string;
}

// Payload we send to the api
interface editIssuePayload extends EditIssueInfo {
  issueId: string;
}

type EditIssueTypeModalProps = {
  isModalOpen: boolean;
  hideModal: () => void;
  issueId: string;
  issueInfo: EditIssueInfo;
  agentsInfo: DropdownOption[];
  adminsInfo: DropdownOption[];
};

const EditIssueTypeModal = ({
  isModalOpen,
  hideModal,
  issueId,
  issueInfo,
  agentsInfo,
  adminsInfo,
}: EditIssueTypeModalProps) => {
  // Query client
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<EditIssueInfo>(issueInfo);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Zustand states
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  useFocusTrapping(modalRef, isModalOpen, hideModal);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleDropdownChange = (field: keyof EditIssueInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerDialog({
      title: "Edit Issue Type",
      description: "Confirm editing of issue type info",
      onConfirm: handleSubmit,
    });
  };

  const handleSubmit = async () => {
    hideDialog();
    showOverlay("Updating");
    const payload = { ...formData, issueId };

    // The mutation function
    editIssueMutation(payload);
  };

  const { mutate: editIssueMutation, isPending: updating } = useMutation({
    mutationFn: async (payload: editIssuePayload) =>
      apiClient.put("/superadmin/edit-issue", payload),
    onSuccess: (response, payload) => {
      const agentObject = agentsInfo.find(
        (agent) => agent.value === payload.agentEmail,
      );
      const adminObject = adminsInfo.find(
        (admin) => admin.value === payload.adminEmail,
      );

      // Assign names from emails
      const agentName = agentObject ? agentObject.option : "No Name";
      const adminName = adminObject ? adminObject.option : "No Name";

      // Optimistic update
      queryClient.setQueryData(
        ["issuesMappingDataInfo"],
        (oldData: IssueMappingRecord[]) => {
          if (!oldData) return oldData;
          return oldData.map((issue) => {
            if (issue.issue_id === payload.issueId) {
              return {
                ...issue,
                agent_name: agentName,
                agent_email: payload.agentEmail,
                admin_name: adminName,
                admin_email: payload.adminEmail,
                issue_type: payload.issueType,
                issue_priority: payload.issuePriority,
              };
            }
            return issue;
          });
        },
      );

      // Hide the overlay
      hideOverlay();

      // Hide the modal
      hideModal();

      // Trigger an alert message
      triggerAlert("success", response.data.message);
    },
    onError: (error) => {
      hideOverlay();
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["IssueCountsData"] }),
  });

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div className="custom-blur fixed inset-0 z-50 bg-black/40 transition-opacity dark:bg-black/60" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
      >
        <div className="flex max-h-[80vh] w-full flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Edit Issue Type
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Update the issue type details below
              </p>
            </div>
            <button
              onClick={hideModal}
              className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleConfirmSubmit}
            className="layout-scrollbar flex flex-col gap-4 overflow-y-auto px-6 py-5"
          >
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="issueType"
                className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Issue Type
                <FormAsterisk />
              </label>
              <div className="relative">
                <div className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2">
                  <Bug className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  id="issueType"
                  name="issueType"
                  type="text"
                  value={formData.issueType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Enter Issue Type"
                  className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pr-3.5 pl-9 text-sm text-neutral-900 shadow-sm transition-all duration-150 placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
                />
              </div>
            </div>

            {/* Priority */}
            <CustomDropdown
              label="Priority"
              options={priorityOptions}
              value={formData.issuePriority}
              onChange={(val) => handleDropdownChange("issuePriority", val)}
            />

            {/* Agents */}
            <CustomAgentsDropdown
              label="Agent"
              options={agentsInfo}
              value={formData.agentEmail}
              onChange={(val) => handleDropdownChange("agentEmail", val)}
            />

            {/* Admins */}
            <CustomAgentsDropdown
              label="Admin"
              options={adminsInfo}
              value={formData.adminEmail}
              onChange={(val) => handleDropdownChange("adminEmail", val)}
            />

            {/* Footer */}
            <div className="mt-1 flex items-center justify-end gap-2.5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <button
                type="button"
                onClick={hideModal}
                className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-300 focus:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formData === issueInfo || updating}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus:ring-white dark:focus:ring-offset-neutral-950"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </ClientPortal>
  );
};

export default EditIssueTypeModal;
