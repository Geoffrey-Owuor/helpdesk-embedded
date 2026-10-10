import apiClient from "@/lib/AxiosClient";
import { useSearchStore } from "@/store/useSearchStore";

// The single-issue shape returned by /get-issue and /analytics/issue - both
// select lib/issues/issueDetailQuery.ts's ISSUE_DETAIL_SELECT.
export interface IssueDetail {
  issue_uuid: string;
  issue_reference_id: string;
  issue_submitter_id: string;
  issue_submitter_name: string;
  issue_submitter_email: string;
  issue_submitter_department: string;
  issue_target_department: string;
  issue_type: string;
  issue_title: string;
  issue_description: string;
  issue_status: string;
  issue_priority: string;
  issue_remarks: string | null;
  issue_agent_name: string | null;
  issue_agent_email: string | null;
  issue_assigner_name: string | null;
  issue_assigner_email: string | null;
  issue_created_at: string;
  issue_updated_at: string;
  issue_date_resolved: string | null;
  issue_date_closed: string | null;
  attachments_count: number;
  reopened_count: number;
  escalated_count: number;
  collaborators_count: number;
}

export const fetchIssue = async (uuid: string): Promise<IssueDetail> => {
  const agentAdminFilter = useSearchStore.getState().agentAdminFilter;
  const superAdminFilter = useSearchStore.getState().superAdminFilter;

  const response = await apiClient.get("/get-issue", {
    params: {
      uuid,
      ...(superAdminFilter ? { superAdminFilter: "superAdminFilter" } : {}),
      ...(agentAdminFilter === "agentAdminFilter" ? { agentAdminFilter } : {}),
    },
  });

  return response.data;
};
