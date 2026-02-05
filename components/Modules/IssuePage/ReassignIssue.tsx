"use client";

import { useState, useEffect, MouseEvent } from "react";
import { fetchedIssueAgents } from "@/serverActions/GetIssueAgents";
import { IssueAgents } from "@/serverActions/GetIssueAgents";
import { useAlert } from "@/contexts/AlertContext";
import ConfirmationDialog from "../Overlays";
import apiClient from "@/lib/AxiosClient";
import { PromiseOverlay } from "../Overlays";
import { IssueAgentsSkeleton } from "@/components/Skeletons/IssueAgentsSkeleton";
import { useUser } from "@/contexts/UserContext";
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
import { IssueValueTypes } from "@/contexts/IssuesDataContext";
import { useAutomations } from "@/contexts/AutomationCardsContext";
import { useIssuesCards } from "@/contexts/IssuesCardsContext";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import { useAutomationsData } from "@/contexts/AutomationsDataContext";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";

type ReassignIssueProps = {
  uuid: string;
  closeModal: () => void;
  issueType: IssueValueTypes;
  issueAgentEmail: IssueValueTypes;
};

const ReassignIssue = ({
  uuid,
  closeModal,
  issueType,
  issueAgentEmail,
}: ReassignIssueProps) => {
  const [loading, setLoading] = useState(false);
  const { userId } = useUser();
  const { setAlertInfo } = useAlert();
  const [issueAgents, setIssueAgents] = useState<IssueAgents[]>([]);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [agentEmail, setAgentEmail] = useState(""); //will be sent to the api
  const [agentName, setAgentName] = useState(""); //will be sent to the api

  //The refetch functions - called after successful reassigning
  const { refetchAutomationCounts } = useAutomations();
  const { refetchAutomations } = useAutomationsData();
  const { refetchIssuesCounts } = useIssuesCards();
  const { refetchIssues } = useIssuesData();

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const result = await fetchedIssueAgents(userId);
        setIssueAgents(result);
      } catch (error) {
        console.error("Error while trying to fetch Issue Agents:", error);
        setIssueAgents([]);
      } finally {
        setLoading(false);
      }
    };

    //Call the function
    fetchAgents();
  }, [userId]);

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

  //function for calling the api endpoint to handle reassigning
  const handleReAssigning = async () => {
    setShowConfirmationDialog(false);
    setUpdating(true);

    try {
      const response = await apiClient.put("/reassign-issue", {
        agentName,
        agentEmail,
        uuid,
      });

      // Show the alert on success
      setAlertInfo({
        alertType: "success",
        showAlert: true,
        alertMessage: response.data.message || "Agent Updated Successfully",
      });

      //   clear data
      setAgentEmail("");
      setAgentName("");

      //   Refetch data
      refetchAutomationCounts();
      refetchAutomations();
      refetchIssuesCounts();
      refetchIssues();

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
      {showConfirmationDialog && (
        <ConfirmationDialog
          title="Reassign Issue"
          message={`Confirm reassigning of issue to ${agentName}`}
          onCancel={() => setShowConfirmationDialog(false)}
          onConfirm={handleReAssigning}
        />
      )}
      {updating && <PromiseOverlay overlaytext="loading" />}
      <ClientPortal>
        {/* Backdrop */}
        <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 dark:bg-black/60">
          {/* Modal Container*/}
          <div className="w-full max-w-lg rounded-2xl border border-neutral-300 bg-neutral-50 p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Department Agents
              </h2>
              <button
                onClick={closeModal}
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X size={20} />
              </button>
            </div>

            {loading ? (
              <IssueAgentsSkeleton />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
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
                onClick={() => setShowConfirmationDialog(true)}
                disabled={!agentEmail || !agentName}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-3 py-2 text-white hover:bg-blue-800 disabled:opacity-50"
              >
                <UserRoundPen className="h-4 w-4" />
                Reassign
              </button>
            </div>
          </div>
        </div>
      </ClientPortal>
    </>
  );
};

export default ReassignIssue;
