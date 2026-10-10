"use client";

import { useState, MouseEvent } from "react";
import { fetchedIssueAgents } from "@/serverActions/GetIssueAgents";
import { useAlertStore } from "@/store/useAlertStore";
import apiClient from "@/lib/AxiosClient";
import { IssueAgentsSkeleton } from "@/components/Skeletons/IssueAgentsSkeleton";
import { AlertCircle, Mail, UserRound, GitBranchPlus } from "lucide-react";
import { arrayReducer } from "@/utils/ArrayReducer";
import FormAsterisk from "../FormAsterisk";
import { IssueValueTypes } from "@/public/assets";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { IssueDetail } from "@/queries/fetchIssue";
import { invalidateIssuesCaches } from "@/utils/invalidateIssuesCaches";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../Modal/Modal";

type Payload = {
  uuid: string;
  agentName: IssueValueTypes;
  agentEmail: IssueValueTypes;
  reason: string;
};

type EscalateIssueProps = {
  uuid: string;
  closeModal: () => void;
  isModalOpen: boolean;
  issueType: IssueValueTypes;
  targetDepartment: IssueValueTypes;
  issueAgentEmail: IssueValueTypes;
};

const EscalateIssueModal = ({
  uuid,
  closeModal,
  isModalOpen,
  targetDepartment,
  issueAgentEmail,
}: EscalateIssueProps) => {
  const queryClient = useQueryClient();
  const department = targetDepartment.toString();

  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);

  const [agentEmail, setAgentEmail] = useState("");
  const [agentName, setAgentName] = useState("");
  const [escalationReason, setEscalationReason] = useState("");

  const { data: issueAgents = [], isLoading: loading } = useQuery({
    queryKey: ["IssuePageAgents", department],
    queryFn: () => fetchedIssueAgents(department),
    enabled: !!department,
  });

  const organizedIssueAgents = arrayReducer(issueAgents);

  const handleSelectedAgent = (
    e: MouseEvent<HTMLButtonElement>,
    email: string,
    name: string,
  ) => {
    e.stopPropagation();
    setAgentEmail(email);
    setAgentName(name);
  };

  const { mutate: escalateIssue, isPending: isUpdating } = useMutation({
    // TODO: Confirm this is the correct endpoint for your escalation route
    mutationFn: (payload: Payload) => apiClient.put("/escalate-issue", payload),
    onSuccess: (response, payload) => {
      queryClient.setQueryData(
        ["issue", uuid],
        (old: IssueDetail | undefined) =>
          old
            ? {
                ...old,
                issue_agent_name: payload.agentName,
                issue_agent_email: payload.agentEmail,
                issue_updated_at: new Date().toISOString(),
              }
            : old,
      );

      hideOverlay();
      setAgentEmail("");
      setAgentName("");
      setEscalationReason("");
      closeModal();
      triggerAlert("success", response.data.message);
    },
    onError: (error) => {
      hideOverlay();
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    },
    onSettled: () => {
      invalidateIssuesCaches(queryClient, { uuid });
    },
  });

  const handleEscalating = async () => {
    const payload: Payload = {
      uuid,
      agentEmail,
      agentName,
      reason: escalationReason.trim(),
    };

    hideDialog();
    showOverlay("Updating");
    escalateIssue(payload);
  };

  const handleConfirmationDialog = () => {
    triggerDialog({
      title: "Escalate Issue",
      description: `Are you sure you want to escalate this issue to ${agentName}?`,
      onConfirm: handleEscalating,
    });
  };

  return (
    <Modal open={isModalOpen} onClose={closeModal} size="lg" tone="muted">
      <ModalHeader title="Escalate Issue" />

      <ModalBody className="flex flex-col gap-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Select Agent to Escalate To
          </h3>

          {loading ? (
            <IssueAgentsSkeleton />
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {organizedIssueAgents.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50/50 px-4 py-3 text-red-800 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-300">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    No agents found for this department.
                  </span>
                </div>
              ) : (
                <>
                  {organizedIssueAgents.map((issueAgent) => (
                    <button
                      key={issueAgent.email}
                      disabled={issueAgentEmail === issueAgent.email}
                      onClick={(e) =>
                        handleSelectedAgent(
                          e,
                          issueAgent.email,
                          issueAgent.name,
                        )
                      }
                      className={`relative flex cursor-pointer items-center gap-3 rounded-xl border py-1.5 pr-4 pl-1.5 transition-all duration-200 select-none disabled:cursor-default disabled:opacity-50 ${
                        agentEmail === issueAgent.email
                          ? "border-red-200 bg-red-50 shadow-sm dark:border-red-800 dark:bg-red-900/20"
                          : "border-neutral-300 bg-white opacity-90 hover:border-red-200 hover:bg-red-50/30 hover:opacity-100 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-red-800 dark:hover:bg-red-900/10"
                      } `}
                    >
                      {/* Avatar Circle */}
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                          agentEmail === issueAgent.email
                            ? "bg-red-600 text-white dark:bg-red-500 dark:text-white"
                            : "bg-neutral-100 text-neutral-500 group-hover:bg-red-100 group-hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-400"
                        } `}
                      >
                        <UserRound className="h-4 w-4" />
                      </div>

                      {/* Agent Info Stack */}
                      <div className="flex flex-col items-start">
                        <span className="text-sm leading-none font-semibold text-neutral-700 dark:text-neutral-200">
                          {issueAgent.name}
                        </span>
                        <div className="mt-0.5 flex items-center gap-1">
                          <Mail
                            className={`h-3 w-3 ${
                              agentEmail === issueAgent.email
                                ? "text-red-400 dark:text-red-400"
                                : "text-neutral-400"
                            }`}
                          />
                          <span
                            className={`text-xs ${
                              agentEmail === issueAgent.email
                                ? "text-red-600/80 dark:text-red-300/70"
                                : "text-neutral-500 dark:text-neutral-400"
                            }`}
                          >
                            {issueAgent.email}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        {/* Escalation Reason TextArea */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="escalationReason"
            className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300"
          >
            Escalation Reason <FormAsterisk />
          </label>
          <textarea
            id="escalationReason"
            value={escalationReason}
            onChange={(e) => setEscalationReason(e.target.value)}
            placeholder="Please provide a reason for escalating this issue..."
            rows={3}
            className="resize-none rounded-xl border border-neutral-300 bg-white p-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
      </ModalBody>

      {/* The Escalate Button */}
      <ModalFooter className="sm:justify-center">
        <button
          onClick={handleConfirmationDialog}
          disabled={
            !agentEmail || !agentName || !escalationReason.trim() || isUpdating
          }
          className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
        >
          <GitBranchPlus className="h-4 w-4" />
          Escalate
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default EscalateIssueModal;
