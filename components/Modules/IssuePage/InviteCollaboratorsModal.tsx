"use client";

import { useState, MouseEvent, useRef } from "react";
import { fetchedIssueAgents } from "@/serverActions/GetIssueAgents";
import { fetchCollaborators } from "@/queries/fetchCollaborators";
import { useAlertStore } from "@/store/useAlertStore";
import apiClient from "@/lib/AxiosClient";
import { IssueAgentsSkeleton } from "@/components/Skeletons/IssueAgentsSkeleton";
import ClientPortal from "../ClientPortal";
import {
  AlertCircle,
  Mail,
  Sparkles,
  UserRound,
  UserRoundCheck,
  UserRoundMinus,
  UserRoundPlus,
  X,
} from "lucide-react";
import { arrayReducer } from "@/utils/ArrayReducer";
import { IssueValueTypes } from "@/public/assets";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useUser } from "@/contexts/UserContext";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

type SelectedAgent = {
  name: string;
  email: string;
};

type InviteCollaboratorsModalProps = {
  uuid: string;
  closeModal: () => void;
  isModalOpen: boolean;
  issueType: IssueValueTypes;
  targetDepartment: IssueValueTypes;
  activeQueryKey: (string | boolean)[];
  issueAgentEmail: IssueValueTypes;
  canManage: boolean;
};

const InviteCollaboratorsModal = ({
  uuid,
  closeModal,
  isModalOpen,
  issueType,
  activeQueryKey,
  targetDepartment,
  issueAgentEmail,
  canManage,
}: InviteCollaboratorsModalProps) => {
  const queryClient = useQueryClient();
  const department = targetDepartment.toString();

  // Focus Trapping
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrapping(modalRef, isModalOpen, closeModal);

  const { email } = useUser();

  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);

  // Agents picked to be invited, and existing collaborators picked for removal
  const [selectedAgents, setSelectedAgents] = useState<SelectedAgent[]>([]);
  const [selectedRemovals, setSelectedRemovals] = useState<SelectedAgent[]>([]);

  const { data: issueAgents = [], isLoading: loading } = useQuery({
    queryKey: ["IssuePageAgents", department],
    queryFn: () => fetchedIssueAgents(department),
    enabled: !!department,
  });

  const { data: collaborators = [] } = useQuery({
    queryKey: ["issueCollaborators", uuid],
    queryFn: () => fetchCollaborators(uuid),
  });

  //Get the organized array from the Array Reducer
  const organizedIssueAgents = arrayReducer(issueAgents);

  // The emails already collaborating on this issue
  const collaboratorEmails = collaborators.map(
    (collaborator) => collaborator.collaborator_email,
  );

  // Keeps the collaborated indicator on the issues table/cards in sync without
  // refetching the whole dashboard list
  const patchCollaboratorsCount = (delta: number) => {
    queryClient.setQueryData(
      activeQueryKey,
      (oldData: Record<string, IssueValueTypes>[]) => {
        if (!oldData) return oldData;

        return oldData.map((issue: Record<string, IssueValueTypes>) =>
          issue.issue_uuid === uuid
            ? {
                ...issue,
                collaborators_count: Math.max(
                  Number(issue.collaborators_count ?? 0) + delta,
                  0,
                ),
                issue_updated_at: new Date().toISOString(),
              }
            : issue,
        );
      },
    );
  };

  //Toggling an agent in or out of the invite selection
  const handleSelectedAgent = (
    e: MouseEvent<HTMLButtonElement>,
    agentEmail: string,
    agentName: string,
  ) => {
    e.stopPropagation();

    setSelectedAgents((previous) =>
      previous.some((agent) => agent.email === agentEmail)
        ? previous.filter((agent) => agent.email !== agentEmail)
        : [...previous, { name: agentName, email: agentEmail }],
    );
  };

  //Toggling an existing collaborator in or out of the removal selection
  const handleSelectedRemoval = (
    e: MouseEvent<HTMLButtonElement>,
    agentEmail: string,
    agentName: string,
  ) => {
    e.stopPropagation();

    setSelectedRemovals((previous) =>
      previous.some((agent) => agent.email === agentEmail)
        ? previous.filter((agent) => agent.email !== agentEmail)
        : [...previous, { name: agentName, email: agentEmail }],
    );
  };

  const { mutate: inviteCollaborators, isPending: isInviting } = useMutation({
    mutationFn: (payload: SelectedAgent[]) =>
      apiClient.post(`/collaborators/${uuid}`, { collaborators: payload }),
    onSuccess: (response, payload) => {
      patchCollaboratorsCount(payload.length);
      queryClient.invalidateQueries({ queryKey: ["issueCollaborators", uuid] });

      // Hide overlay on success
      hideOverlay();

      // clear data
      setSelectedAgents([]);

      // close the modal
      closeModal();

      // Show the alert on success
      triggerAlert("success", response.data.message);
    },
    onError: (error) => {
      hideOverlay();
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    },
  });

  const { mutate: removeCollaborators, isPending: isRemoving } = useMutation({
    mutationFn: (payload: SelectedAgent[]) =>
      apiClient.delete(`/collaborators/${uuid}`, {
        data: { emails: payload.map((agent) => agent.email) },
      }),
    onSuccess: (response, payload) => {
      patchCollaboratorsCount(-payload.length);
      queryClient.invalidateQueries({ queryKey: ["issueCollaborators", uuid] });

      hideOverlay();
      setSelectedRemovals([]);
      closeModal();

      triggerAlert("success", response.data.message);
    },
    onError: (error) => {
      hideOverlay();
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    },
  });

  //function for calling the api endpoint to handle the invites
  const handleInviting = async () => {
    hideDialog();
    showOverlay("Inviting");

    inviteCollaborators(selectedAgents);
  };

  //function for calling the api endpoint to handle the removals
  const handleRemoving = async () => {
    hideDialog();
    showOverlay("Removing");

    removeCollaborators(selectedRemovals);
  };

  const handleInviteConfirmation = () => {
    const names = selectedAgents.map((agent) => agent.name).join(", ");

    triggerDialog({
      title: "Invite Collaborators",
      description: `Confirm inviting ${names} to collaborate on this issue`,
      onConfirm: handleInviting,
    });
  };

  const handleRemoveConfirmation = () => {
    const names = selectedRemovals.map((agent) => agent.name).join(", ");

    triggerDialog({
      title: "Remove Collaborators",
      description: `Confirm removing ${names} from this issue`,
      onConfirm: handleRemoving,
    });
  };

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 dark:bg-black/80">
        {/* Modal Container*/}
        <div
          ref={modalRef}
          className="flex max-h-120 w-full max-w-lg flex-col rounded-2xl border border-neutral-300 bg-neutral-50 p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-neutral-200 pb-2 dark:border-neutral-800">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Invite Collaborators
              </h2>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Select agents to work on this issue alongside the assigned agent
              </span>
            </div>
            <button
              onClick={closeModal}
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X size={20} />
            </button>
          </div>

          {loading ? (
            <IssueAgentsSkeleton />
          ) : (
            <div className="layout-scrollbar flex flex-wrap items-center gap-3 overflow-y-auto">
              {organizedIssueAgents.length === 0 ? (
                // Empty State - Added subtle blue background
                <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3 text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-300">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    No agents found for this department.
                  </span>
                </div>
              ) : (
                <>
                  {organizedIssueAgents.map((issueAgent) => {
                    const isBestFit =
                      issueAgent.supported_issues.includes(issueType);

                    const isCollaborator = collaboratorEmails.includes(
                      issueAgent.email,
                    );
                    const isSelected = selectedAgents.some(
                      (agent) => agent.email === issueAgent.email,
                    );
                    const isMarkedForRemoval = selectedRemovals.some(
                      (agent) => agent.email === issueAgent.email,
                    );

                    // The assigned agent and the current user are already on the
                    // issue. Existing collaborators can only be clicked by
                    // someone allowed to manage the collaborator list.
                    const isDisabled =
                      issueAgentEmail === issueAgent.email ||
                      email === issueAgent.email ||
                      (isCollaborator && !canManage);

                    return (
                      <button
                        key={issueAgent.email}
                        disabled={isDisabled}
                        onClick={(e) =>
                          isCollaborator
                            ? handleSelectedRemoval(
                                e,
                                issueAgent.email,
                                issueAgent.name,
                              )
                            : handleSelectedAgent(
                                e,
                                issueAgent.email,
                                issueAgent.name,
                              )
                        }
                        className={`relative flex cursor-pointer items-center gap-3 rounded-xl border py-1.5 pr-4 pl-1.5 transition-all duration-200 select-none disabled:cursor-default disabled:opacity-50 ${
                          isMarkedForRemoval
                            ? "border-red-200 bg-red-50 shadow-sm dark:border-red-800 dark:bg-red-900/20"
                            : isSelected
                              ? "border-blue-200 bg-blue-50 shadow-sm dark:border-blue-800 dark:bg-blue-900/20"
                              : isCollaborator
                                ? "border-neutral-300 bg-neutral-100 opacity-60 dark:border-neutral-700 dark:bg-neutral-900"
                                : "border-neutral-300 bg-white opacity-90 hover:border-blue-200 hover:bg-blue-50/30 hover:opacity-100 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-blue-800 dark:hover:bg-blue-900/10"
                        } `}
                      >
                        {/* Floating badge marking an existing collaborator */}
                        {isCollaborator && (
                          <span
                            title="Already collaborating on this issue"
                            className={`absolute -right-2 -bottom-2 flex h-5.5 w-5.5 items-center justify-center rounded-full text-white shadow-sm ring-2 ring-neutral-50 dark:ring-neutral-950 ${
                              isMarkedForRemoval
                                ? "bg-red-600 dark:bg-red-500"
                                : "bg-blue-600 dark:bg-blue-500"
                            }`}
                          >
                            {isMarkedForRemoval ? (
                              <X className="h-3 w-3" />
                            ) : (
                              <UserRoundCheck className="h-3 w-3" />
                            )}
                          </span>
                        )}

                        {/* Avatar Circle */}
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                            isMarkedForRemoval
                              ? "bg-red-600 text-white dark:bg-red-500 dark:text-white"
                              : isSelected
                                ? "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
                                : "bg-neutral-100 text-neutral-500 group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-neutral-800 dark:text-neutral-400"
                          } `}
                        >
                          <UserRound className="h-4 w-4" />
                        </div>

                        {/* Agent Info Stack */}
                        <div className="flex flex-col items-start">
                          <span
                            className={`text-sm leading-none font-semibold ${
                              isBestFit
                                ? "text-blue-900 dark:text-blue-300"
                                : "text-neutral-700 dark:text-neutral-200"
                            }`}
                          >
                            {issueAgent.name}
                          </span>

                          {/* Email with Icon */}
                          <div className="mt-0.5 flex items-center gap-1">
                            <Mail
                              className={`h-3 w-3 ${isSelected ? "text-blue-400 dark:text-blue-400" : "text-neutral-400"}`}
                            />
                            <span
                              className={`text-xs ${isSelected ? "text-blue-600/80 dark:text-blue-300/70" : "text-neutral-500 dark:text-neutral-400"}`}
                            >
                              {issueAgent.email}
                            </span>
                          </div>
                        </div>

                        {/* Best Fit Badge - Now Blue & Distinct */}
                        {isBestFit && !isCollaborator && (
                          <div className="ml-2 flex items-center gap-1 border-l border-blue-200 pl-3 dark:border-blue-700/50">
                            <Sparkles className="h-3.5 w-3.5 fill-current text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-bold tracking-wide text-blue-700 uppercase dark:text-blue-300">
                              Best Fit
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* The Invite and Remove Buttons */}
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={handleInviteConfirmation}
              disabled={selectedAgents.length === 0 || isInviting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              <UserRoundPlus className="h-4 w-4" />
              Invite
              {selectedAgents.length > 0 && ` (${selectedAgents.length})`}
            </button>

            {canManage && collaboratorEmails.length > 0 && (
              <button
                onClick={handleRemoveConfirmation}
                disabled={selectedRemovals.length === 0 || isRemoving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-900 px-3 py-2 text-sm text-white hover:bg-red-800 disabled:opacity-50"
              >
                <UserRoundMinus className="h-4 w-4" />
                Remove
                {selectedRemovals.length > 0 && ` (${selectedRemovals.length})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

export default InviteCollaboratorsModal;
