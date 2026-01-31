"use client";

import { useState, useEffect } from "react";
import { fetchedIssueAgents } from "@/serverActions/GetIssueAgents";
import { IssueAgents } from "@/serverActions/GetIssueAgents";
import { useAlert } from "@/contexts/AlertContext";
import ConfirmationDialog from "../Overlays";
import IssueAgentsSkeleton from "@/components/Skeletons/IssueAgentsSkeleton";
import { useUser } from "@/contexts/UserContext";
import ClientPortal from "../ClientPortal";
import { X } from "lucide-react";
import { automationsValueTypes } from "@/contexts/AutomationsDataContext";

type ReassignIssueProps = {
  uuid: string;
  closeModal: () => void;
  issueType: automationsValueTypes;
};

const ReassignIssue = ({ uuid, closeModal, issueType }: ReassignIssueProps) => {
  const [loading, setLoading] = useState(false);
  const { userId } = useUser();
  const [issueAgents, setIssueAgents] = useState<IssueAgents[]>([]);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

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

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 dark:bg-black/60">
        {/* Modal Container*/}
        <div className="w-full max-w-lg rounded-2xl border border-neutral-300 bg-neutral-50 p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Reassign Issue
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
            <div className="flex flex-wrap items-center gap-2">
              {issueAgents.length === 0 ? (
                <span>No Agents Found</span>
              ) : (
                <>
                  {issueAgents.map((issueAgent) => (
                    <div
                      className="rounded-full border bg-gray-200"
                      key={issueAgent.issue_type}
                    >
                      <span>{issueAgent.agent_name}</span>
                      <span>{issueAgent.agent_email}</span>
                      <span>
                        {issueAgent.issue_type === issueType && "Best fit"}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ClientPortal>
  );
};

export default ReassignIssue;
