// Shared WHERE-clause builder for the Super Admin issues analytics dashboard.
// Both the issues list endpoint and the summary/cards endpoint import this
// so the two can never disagree about which rows are "in view" for a given
// set of filters - see app/api/analytics/issues/route.ts and
// app/api/analytics/issues-summary/route.ts.

export interface AnalyticsFilterParams {
  department?: string;
  agent?: string;
  issueType?: string;
  status?: string;
  priority?: string;
  fromDate?: string;
  toDate?: string;
  reopened?: boolean;
  escalated?: boolean;
  collaborated?: boolean;
  submitter?: string;
  reference?: string;
}

export const buildAnalyticsIssuesFilter = (
  filters: AnalyticsFilterParams,
  tableAlias = "a",
): { whereSql: string; params: (string | number)[] } => {
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  const col = (name: string) => `${tableAlias}.${name}`;

  if (filters.department) {
    params.push(filters.department);
    clauses.push(`${col("issue_submitter_department")} = $${params.length}`);
  }

  if (filters.agent) {
    params.push(filters.agent);
    clauses.push(`${col("issue_agent_email")} = $${params.length}`);
  }

  if (filters.issueType) {
    params.push(filters.issueType);
    clauses.push(`${col("issue_type")} = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    clauses.push(`${col("issue_status")} = $${params.length}`);
  }

  if (filters.priority) {
    params.push(filters.priority);
    clauses.push(`${col("issue_priority")} = $${params.length}`);
  }

  if (filters.fromDate) {
    params.push(filters.fromDate);
    clauses.push(`${col("issue_created_at")}::date >= $${params.length}`);
  }

  if (filters.toDate) {
    params.push(filters.toDate);
    clauses.push(`${col("issue_created_at")}::date <= $${params.length}`);
  }

  if (filters.reopened) {
    clauses.push(
      `EXISTS (SELECT 1 FROM issue_reopening r WHERE r.issue_id = ${col("issue_uuid")})`,
    );
  }

  if (filters.escalated) {
    clauses.push(
      `EXISTS (SELECT 1 FROM issue_escalation e WHERE e.issue_id = ${col("issue_uuid")})`,
    );
  }

  if (filters.collaborated) {
    clauses.push(
      `EXISTS (SELECT 1 FROM issue_collaborators c WHERE c.issue_id = ${col("issue_uuid")})`,
    );
  }

  if (filters.submitter) {
    params.push(`%${filters.submitter}%`);
    clauses.push(`${col("issue_submitter_name")} ILIKE $${params.length}`);
  }

  if (filters.reference) {
    params.push(`%${filters.reference}%`);
    clauses.push(`${col("issue_reference_id")} ILIKE $${params.length}`);
  }

  return {
    whereSql: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
};

// Parses the query params both analytics routes accept into the typed shape
// buildAnalyticsIssuesFilter expects, so parsing can't drift between routes either.
export const parseAnalyticsFilterParams = (
  searchParams: URLSearchParams,
): AnalyticsFilterParams => ({
  department: searchParams.get("department") || undefined,
  agent: searchParams.get("agent") || undefined,
  issueType: searchParams.get("issueType") || undefined,
  status: searchParams.get("status") || undefined,
  priority: searchParams.get("priority") || undefined,
  fromDate: searchParams.get("fromDate") || undefined,
  toDate: searchParams.get("toDate") || undefined,
  reopened: searchParams.get("reopened") === "true" || undefined,
  escalated: searchParams.get("escalated") === "true" || undefined,
  collaborated: searchParams.get("collaborated") === "true" || undefined,
  submitter: searchParams.get("submitter") || undefined,
  reference: searchParams.get("reference") || undefined,
});
