"use client";

import { useState, MouseEvent, useRef } from "react";
import { fetchedIssueAgents } from "@/serverActions/GetIssueAgents";
import { useAlertStore } from "@/store/useAlertStore";
import apiClient from "@/lib/AxiosClient";
import { IssueAgentsSkeleton } from "@/components/Skeletons/IssueAgentsSkeleton";
import ClientPortal from "../ClientPortal";
import {
  AlertCircle,
  Mail,
  Sparkles,
  UserRound,
  UserRoundPen,
  X,
} from "lucide-react";
import { arrayReducer } from "@/utils/ArrayReducer";
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
};

type ReassignIssueProps = {
  uuid: string;
  closeModal: () => void;
  isModalOpen: boolean;
  issueType: IssueValueTypes;
  targetDepartment: IssueValueTypes;
  activeQueryKey: (string | boolean)[];
  issueAgentEmail: IssueValueTypes;
};

const ReassignIssue = ({
  uuid,
  closeModal,
  isModalOpen,
  issueType,
  activeQueryKey,
  targetDepartment,
  issueAgentEmail,
}: ReassignIssueProps) => {
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
  const [agentEmail, setAgentEmail] = useState(""); //will be sent to the api
  const [agentName, setAgentName] = useState(""); //will be sent to the api

  const { data: issueAgents = [], isLoading: loading } = useQuery({
    queryKey: ["IssuePageAgents", department],
    queryFn: () => fetchedIssueAgents(department),
    enabled: !!department,
  });

  //Get the organized array from the Array Reducer
  const organizedIssueAgents = arrayReducer(issueAgents);

  //Handling the selectedAgent
  const handleSelectedAgent = (
    e: MouseEvent<HTMLButtonElement>,
    agentEmail: string,
    agentName: string,
  ) => {
    e.stopPropagation();
    setAgentEmail(agentEmail);
    setAgentName(agentName);
  };

  const { mutate: updateAgent, isPending: isUpdating } = useMutation({
    mutationFn: (payload: Payload) => apiClient.put("/reassign-issue", payload),
    onSuccess: (response, payload) => {
      queryClient.setQueryData(
        activeQueryKey,
        (oldData: Record<string, IssueValueTypes>[]) => {
          if (!oldData) return oldData;
          // Map through the array and update the specific issue's status
          return oldData.map((issue: Record<string, IssueValueTypes>) =>
            issue.issue_uuid === payload.uuid
              ? {
                  ...issue,
                  issue_agent_name: payload.agentName,
                  issue_agent_email: payload.agentEmail,
                }
              : issue,
          );
        },
      );

      // Hide overlay on success
      hideOverlay();

      //   clear data
      setAgentEmail("");
      setAgentName("");

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
  //function for calling the api endpoint to handle reassigning
  const handleReAssigning = async () => {
    const payload: Payload = {
      uuid,
      agentEmail,
      agentName,
    };

    hideDialog();
    showOverlay("Reassigning");

    updateAgent(payload);
  };

  const handleConfirmationDialog = () => {
    triggerDialog({
      title: "Reassign Issue",
      description: `Confirm reassigning of issue to ${agentName}`,
      onConfirm: handleReAssigning,
    });
  };

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/60">
        {/* Modal Container*/}
        <div
          ref={modalRef}
          className="flex max-h-120 w-full max-w-lg flex-col rounded-2xl border border-neutral-300 bg-neutral-50 p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Department Agents
            </h2>
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
                    No agents found for this issue type.
                  </span>
                </div>
              ) : (
                <>
                  {organizedIssueAgents.map((issueAgent) => {
                    const isBestFit =
                      issueAgent.supported_issues.includes(issueType);

                    return (
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
                            ? "border-blue-200 bg-blue-50 shadow-sm dark:border-blue-800 dark:bg-blue-900/20"
                            : "border-neutral-300 bg-white opacity-90 hover:border-blue-200 hover:bg-blue-50/30 hover:opacity-100 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-blue-800 dark:hover:bg-blue-900/10"
                        } `}
                      >
                        {/* Avatar Circle */}
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                            agentEmail === issueAgent.email
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
                              className={`h-3 w-3 ${agentEmail === issueAgent.email ? "text-blue-400 dark:text-blue-400" : "text-neutral-400"}`}
                            />
                            <span
                              className={`text-xs ${agentEmail === issueAgent.email ? "text-blue-600/80 dark:text-blue-300/70" : "text-neutral-500 dark:text-neutral-400"}`}
                            >
                              {issueAgent.email}
                            </span>
                          </div>
                        </div>

                        {/* Best Fit Badge - Now Blue & Distinct */}
                        {isBestFit && (
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

          {/* The Reassign Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleConfirmationDialog}
              disabled={!agentEmail || !agentName || isUpdating}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-3 py-2 text-white hover:bg-blue-800 disabled:opacity-50"
            >
              <UserRoundPen className="h-4 w-4" />
              Reassign
            </button>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

export default ReassignIssue;
