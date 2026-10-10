"use client";

import IssueDetailsSkeleton from "@/components/Skeletons/IssueDetailsSkeleton";
import UpdateStatusModal from "./UpdateStatusModal";
import {
  PenLine,
  UserRoundPen,
  UndoDot,
  GitBranchPlus,
  UserRoundPlus,
  Paperclip,
} from "lucide-react";
import { useState } from "react";
import { useAlertStore } from "@/store/useAlertStore";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import TitleDescriptionModal from "./TitleDescriptionModal";
import ReopenIssueModal from "./ReopenIssueModal";
import ReassignIssue from "./ReassignIssue";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useConfirmStore } from "@/store/useConfirmStore";
import IssueTypeModal from "./IssueTypeModal";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchIssue, IssueDetail } from "@/queries/fetchIssue";
import { statusOptions as baseOptions } from "@/public/assets";
import { priorityOptions } from "@/public/assets";
import EscalateIssueModal from "./EscalateIssueModal";
import InviteCollaboratorsModal from "./InviteCollaboratorsModal";
import AddAttachmentModal from "./AddAttachmentModal";
import { invalidateIssuesCaches } from "@/utils/invalidateIssuesCaches";
import PinButton from "../PinnedIssues/PinButton";
import { useIssueCollaborators } from "@/hooks/useIssueCollaborators";
import { useIssuePermissions } from "@/hooks/useIssuePermissions";
import { IssueNotFound } from "./HelperComponents/IssueNotFound";
import { IssueHeader } from "./HelperComponents/IssueHeader";
import { IssueDetailBody } from "./HelperComponents/IssueDetailBody";
import { IssueHeaderAction } from "./HelperComponents/IssueHeaderParts";

const statusOptions = baseOptions.filter((option) => option.value !== "open");

export const IssuePage = ({ uuid }: { uuid: string }) => {
  // Initialize the query client
  const queryClient = useQueryClient();

  // Fetch the issue directly by uuid - role-visibility gated server-side, so
  // a 404 covers both "doesn't exist" and "exists but not visible to you".
  const {
    data: issueData,
    isLoading: loading,
    isError,
    isFetching,
    refetch: refetchData,
  } = useQuery({
    queryKey: ["issue", uuid],
    queryFn: () => fetchIssue(uuid),
    retry: false,
  });

  const { collaborators, isLoading: collaboratorsLoading } =
    useIssueCollaborators(uuid, issueData);

  const can = useIssuePermissions(issueData, collaborators);

  const triggerAlert = useAlertStore((state) => state.triggerAlert);

  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);

  // States for the modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddAttachmentOpen, setIsAddAttachmentOpen] = useState(false);

  // call useScrollToTop hook
  useScrollToTop();

  const handleStatusSelection = (selectedValue: string) => {
    setSelectedStatus(selectedValue);
    setStatusModalOpen(true);
  };

  // Mutation for updating the priority
  const updatePriorityMutation = useMutation({
    mutationFn: (priority: string) =>
      apiClient.put("/update-priority", { uuid, priority }),

    onSuccess: (response, newPriority) => {
      queryClient.setQueryData(
        ["issue", uuid],
        (old: IssueDetail | undefined) =>
          old
            ? {
                ...old,
                issue_priority: newPriority,
                issue_updated_at: new Date().toISOString(),
              }
            : old,
      );

      triggerAlert("success", response.data.message);
    },

    onError: (error) => {
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    },

    onSettled: () => {
      invalidateIssuesCaches(queryClient, { uuid });
    },
  });

  const handleUpdatePriority = async (priority: string) => {
    hideDialog();
    updatePriorityMutation.mutate(priority);
  };

  const handlePriorityConfirmation = (selectedValue: string) => {
    triggerDialog({
      title: "Update Priority",
      description: `Confirm changing issue priority to ${selectedValue}.`,
      onConfirm: () => handleUpdatePriority(selectedValue),
    });
  };

  if (loading) return <IssueDetailsSkeleton />;

  if (isError || !issueData) {
    return <IssueNotFound backHref="/dashboard" backLabel="Dashboard" />;
  }

  // The header toolbar's actions, in display order within each group
  const headerActions = (
    [
      {
        key: "reassign",
        label: "Reassign",
        icon: UserRoundPen,
        onClick: () => setIsReassignModalOpen(true),
        group: "triage",
        allowed: can.canTriage,
      },
      {
        key: "escalate",
        label: "Escalate",
        icon: GitBranchPlus,
        onClick: () => setEscalateModalOpen(true),
        group: "triage",
        tone: "danger",
        allowed: can.canEscalate,
      },
      {
        key: "invite",
        label: "Invite",
        icon: UserRoundPlus,
        onClick: () => setIsInviteModalOpen(true),
        group: "collaborate",
        secondary: true,
        allowed: can.canInvite,
      },
      {
        key: "attach",
        label: "Attach file",
        icon: Paperclip,
        onClick: () => setIsAddAttachmentOpen(true),
        group: "collaborate",
        secondary: true,
        allowed: can.canAddAttachment,
      },
      {
        key: "reopen",
        label: "Reopen",
        icon: UndoDot,
        onClick: () => setReopenModalOpen(true),
        group: "lifecycle",
        tone: "primary",
        allowed: can.canReopen,
      },
    ] satisfies (IssueHeaderAction & { allowed: boolean })[]
  ).filter((action) => action.allowed);

  return (
    <>
      {/* Update  Status Modal */}
      {statusModalOpen && (
        <UpdateStatusModal
          isOpen={statusModalOpen}
          closeModal={() => setStatusModalOpen(false)}
          uuid={uuid}
          selectedStatus={selectedStatus}
        />
      )}
      {/* Title and description edit modal */}
      {isEditModalOpen && (
        <TitleDescriptionModal
          title={issueData.issue_title}
          description={issueData.issue_description}
          isModalOpen={isEditModalOpen}
          closeModal={() => setIsEditModalOpen(false)}
          uuid={uuid}
          userId={issueData.issue_submitter_id}
        />
      )}

      {/* Reassign Modal */}
      {isReassignModalOpen && (
        <ReassignIssue
          uuid={uuid}
          closeModal={() => setIsReassignModalOpen(false)}
          isModalOpen={isReassignModalOpen}
          issueType={issueData.issue_type}
          targetDepartment={issueData.issue_target_department}
          issueAgentEmail={issueData.issue_agent_email}
        />
      )}

      {/* Invite Collaborators Modal */}
      {isInviteModalOpen && (
        <InviteCollaboratorsModal
          uuid={uuid}
          closeModal={() => setIsInviteModalOpen(false)}
          isModalOpen={isInviteModalOpen}
          issueType={issueData.issue_type}
          targetDepartment={issueData.issue_target_department}
          issueAgentEmail={issueData.issue_agent_email}
          canManage={can.canManageCollaborators}
        />
      )}

      {/* Add Attachment Modal */}
      {isAddAttachmentOpen && (
        <AddAttachmentModal
          uuid={uuid}
          closeModal={() => setIsAddAttachmentOpen(false)}
          isModalOpen={isAddAttachmentOpen}
        />
      )}

      {/* Reopen Modal */}
      {reopenModalOpen && (
        <ReopenIssueModal
          uuid={uuid}
          closeModal={() => setReopenModalOpen(false)}
          isModalOpen={reopenModalOpen}
        />
      )}

      {/* Escalate Modal */}
      {escalateModalOpen && (
        <EscalateIssueModal
          uuid={uuid}
          closeModal={() => setEscalateModalOpen(false)}
          isModalOpen={escalateModalOpen}
          issueAgentEmail={issueData.issue_agent_email}
          issueType={issueData.issue_type}
          targetDepartment={issueData.issue_target_department}
        />
      )}

      <div className="mx-auto py-6 md:py-4">
        <IssueHeader
          issue={issueData}
          onRefresh={() => refetchData()}
          isRefreshing={isFetching}
          pinButton={
            // Only the fields the pinned list needs - pins are persisted
            <PinButton
              className="inline-flex h-9 w-9 items-center justify-center sm:h-8 sm:w-8"
              issue={{
                issue_uuid: uuid,
                issue_reference_id: issueData.issue_reference_id,
                issue_status: issueData.issue_status,
                issue_priority: issueData.issue_priority,
                issue_title: issueData.issue_title,
                issue_description: issueData.issue_description,
              }}
            />
          }
          statusPicker={
            can.canUpdateStatus
              ? { options: statusOptions, onSelect: handleStatusSelection }
              : undefined
          }
          priorityPicker={
            can.canTriage
              ? {
                  options: priorityOptions,
                  onSelect: handlePriorityConfirmation,
                  disabled: updatePriorityMutation.isPending,
                }
              : undefined
          }
          actions={headerActions}
        />

        <IssueDetailBody
          issue={issueData}
          collaborators={collaborators}
          collaboratorsLoading={collaboratorsLoading}
          issueTypeAction={
            can.canChangeType && (
              <IssueTypeModal
                targetDepartment={issueData.issue_target_department}
                uuid={uuid}
                currentType={issueData.issue_type}
              />
            )
          }
          descriptionAction={
            can.canEditDetails && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="group rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                <PenLine className="h-4 w-4" />
              </button>
            )
          }
        />
      </div>
    </>
  );
};

export default IssuePage;
