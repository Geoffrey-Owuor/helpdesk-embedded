"use client";

import { useState, MouseEvent, useRef } from "react";
import { fetchedIssueAgents } from "@/serverActions/GetIssueAgents";
import { useAlertStore } from "@/store/useAlertStore";
import apiClient from "@/lib/AxiosClient";
import { IssueAgentsSkeleton } from "@/components/Skeletons/IssueAgentsSkeleton";
import ClientPortal from "../ClientPortal";
import { AlertCircle, Mail, UserRound, X, GitBranchPlus } from "lucide-react";
import { arrayReducer } from "@/utils/ArrayReducer";
import FormAsterisk from "../FormAsterisk";
import { IssueValueTypes } from "@/public/assets";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

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
  activeQueryKey: (string | boolean)[];
  issueAgentEmail: IssueValueTypes;
};

const EscalateIssueModal = ({
  uuid,
  closeModal,
  isModalOpen,
  activeQueryKey,
  targetDepartment,
  issueAgentEmail,
}: EscalateIssueProps) => {
  const queryClient = useQueryClient();
  const department = targetDepartment.toString();

  // Focus Trapping
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrapping(modalRef, isModalOpen, closeModal);

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
        activeQueryKey,
        (oldData: Record<string, IssueValueTypes>[]) => {
          if (!oldData) return oldData;
          return oldData.map((issue: Record<string, IssueValueTypes>) =>
            issue.issue_uuid === payload.uuid
              ? {
                  ...issue,
                  issue_agent_name: payload.agentName,
                  issue_agent_email: payload.agentEmail,
                  issue_updated_at: new Date().toISOString(),
                }
              : issue,
          );
        },
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
    <ClientPortal>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 dark:bg-black/80">
        {/* Modal Container*/}
        <div
          ref={modalRef}
          className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-neutral-300 bg-neutral-50 p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-2 dark:border-neutral-800">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-200">
              Escalate Issue
            </h2>
            <button
              onClick={closeModal}
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X size={20} />
            </button>
          </div>

          <div className="layout-scrollbar flex flex-col gap-6 overflow-y-auto pr-1">
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
          </div>

          {/* The Escalate Button */}
          <div className="mt-6 flex justify-center border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <button
              onClick={handleConfirmationDialog}
              disabled={
                !agentEmail ||
                !agentName ||
                !escalationReason.trim() ||
                isUpdating
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
            >
              <GitBranchPlus className="h-4 w-4" />
              Escalate
            </button>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

export default EscalateIssueModal;
