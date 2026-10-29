import { DataCounts } from "@/lib/assets";
import { AgeingBucket } from "@/lib/analytics/ageingBuckets";

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
  issue_description: string;
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
  avgResolutionSeconds: number | null;
  avgStaleSeconds: number | null;
}

export interface AgentBreakdownEntry {
  agentName: string;
  count: number;
  // Of count, the issues still open or in progress
  activeCount: number;
  avgResolutionSeconds: number | null;
  avgStaleSeconds: number | null;
}

export interface DepartmentBreakdownEntry {
  department: string;
  count: number;
  avgResolutionSeconds: number | null;
  avgStaleSeconds: number | null;
}

export interface MonthlyTrendEntry {
  // yyyy-mm
  month: string;
  created: number;
  resolved: number;
}

export interface BacklogAgeingEntry {
  bucket: AgeingBucket;
  count: number;
}

export interface AnalyticsSummary {
  statusCounts: DataCounts;
  reopenedCount: number;
  escalatedCount: number;
  collaboratedCount: number;
  closedWithoutResolutionCount: number;
  avgResolutionSeconds: number | null;
  avgStaleSeconds: number | null;
  avgFirstResponseSeconds: number | null;
  totalFiltered: number;
  monthlyTrend: MonthlyTrendEntry[];
  backlogAgeing: BacklogAgeingEntry[];
  issueTypeBreakdown: IssueTypeBreakdownEntry[];
  agentBreakdown: AgentBreakdownEntry[];
  departmentBreakdown: DepartmentBreakdownEntry[];
}

export interface GlobalAgentOption {
  agent_name: string;
  agent_email: string;
  department: string;
}

// app/api/analytics/sla - see lib/analytics/slaIssuesCte.ts for the rules
export interface SlaStateCounts {
  met: number;
  breached: number;
  // Still inside the target - not counted towards compliance yet
  pending: number;
}

export interface SlaCounts {
  response: SlaStateCounts;
  resolution: SlaStateCounts;
  // Within SLA: both targets met
  sla: SlaStateCounts;
  // Average target of the judged issues' priorities, for mixed sets
  blendedTarget: number | null;
}

export interface SlaPriorityEntry extends SlaCounts {
  priorityCode: string;
  priority: string;
  responseMinutes: number;
  resolutionMinutes: number;
  targetPercent: number;
}

export interface SlaAgentEntry extends SlaCounts {
  agentName: string;
  agentEmail: string;
}

export interface SlaMonthlyEntry {
  // yyyy-mm
  month: string;
  // null for the row covering every agent
  agentEmail: string | null;
  agentName: string | null;
  sla: SlaStateCounts;
  blendedTarget: number | null;
}

export interface AnalyticsSla {
  overall: SlaCounts;
  priorities: SlaPriorityEntry[];
  changeRequests: { sla: SlaStateCounts; targetPercent: number | null };
  agents: SlaAgentEntry[];
  monthly: SlaMonthlyEntry[];
}
