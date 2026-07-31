import { DataCounts } from "@/public/assets";

export type { AnalyticsFilterParams } from "@/lib/analytics/buildAnalyticsIssuesFilter";

export interface AnalyticsIssueRow {
  issue_uuid: string;
  issue_reference_id: string;
  issue_submitter_name: string;
  issue_submitter_department: string;
  issue_target_department: string;
  issue_type: string;
  issue_priority: string;
  issue_title: string;
  issue_status: string;
  issue_agent_name: string;
  issue_agent_email: string;
  issue_created_at: string;
  issue_date_resolved: string | null;
  attachments_count: number;
  reopened_count: number;
  escalated_count: number;
  collaborators_count: number;
}

export interface AnalyticsIssuesResponse {
  rows: AnalyticsIssueRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IssueTypeBreakdownEntry {
  issueType: string;
  count: number;
}

export interface AnalyticsSummary {
  statusCounts: DataCounts;
  reopenedCount: number;
  escalatedCount: number;
  collaboratedCount: number;
  avgResolutionSeconds: number | null;
  avgStaleSeconds: number | null;
  totalFiltered: number;
  issueTypeBreakdown: IssueTypeBreakdownEntry[];
}

export interface AnalyticsIssueDetail {
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

export interface GlobalAgentOption {
  agent_name: string;
  agent_email: string;
  department: string;
}
