// Shared WHERE-clause builder for the main Issues Data/Cards/single-issue
// endpoints. Combines two independent concerns into one place so the list,
// the summary cards, and the single-issue fetch can never disagree:
//  - visibility: which rows this user is allowed to see at all (role-based,
//    not user-controlled beyond the agentAdminFilter/superAdminFilter toggles)
//  - search filters: the optional filters a user has chosen to narrow results
// See app/api/get-issues/route.ts, app/api/issues-cards/route.ts, and
// app/api/get-issue/route.ts for the consumers.

export interface IssuesVisibilityParams {
  role: string;
  userId: string | number;
  email: string;
  department: string;
  isSuper: boolean;
  agentAdminFilter?: string | null;
  superAdminFilter?: string | null;
}

export interface IssuesFilterParams {
  status?: string;
  reference?: string;
  department?: string;
  agent?: string;
  issueType?: string;
  issuePriority?: string;
  submitter?: string;
  fromDate?: string;
  toDate?: string;
}

// Role-based visibility - not user-controlled beyond the agentAdminFilter/
// superAdminFilter toggles, which flip which slice of "your" data you see.
export const buildIssuesVisibilityClause = (
  visibility: IssuesVisibilityParams,
  tableAlias = "a",
  startParamIndex = 1,
): { clause: string | null; params: (string | number)[] } => {
  const {
    role,
    userId,
    email,
    department,
    isSuper,
    agentAdminFilter,
    superAdminFilter,
  } = visibility;
  const col = (name: string) => `${tableAlias}.${name}`;
  const params: (string | number)[] = [];

  // Super admins viewing the "all departments" toggle bypass visibility entirely
  if (superAdminFilter && isSuper) {
    return { clause: null, params };
  }

  const viewingOwnSubmissions = agentAdminFilter === "agentAdminFilter";

  if (role === "user") {
    params.push(userId);
    return {
      clause: `${col("issue_submitter_id")} = $${startParamIndex}`,
      params,
    };
  }

  if (role === "admin") {
    if (viewingOwnSubmissions) {
      params.push(userId);
      return {
        clause: `${col("issue_submitter_id")} = $${startParamIndex}`,
        params,
      };
    }
    params.push(department);
    return {
      clause: `${col("issue_target_department")} = $${startParamIndex}`,
      params,
    };
  }

  if (role === "agent") {
    if (viewingOwnSubmissions) {
      params.push(userId);
      return {
        clause: `${col("issue_submitter_id")} = $${startParamIndex}`,
        params,
      };
    }
    params.push(email);
    return {
      clause: `(${col("issue_agent_email")} = $${startParamIndex}
        OR EXISTS (
          SELECT 1 FROM issue_collaborators ic
          WHERE ic.issue_id = ${col("issue_uuid")}
          AND ic.collaborator_email = $${startParamIndex}
        ))`,
      params,
    };
  }

  return { clause: null, params };
};

// The user-chosen search filters, ported 1:1 from the previous client-side
// filtering behavior in components/Modules/IssuesData/IssuesData.tsx.
export const buildIssuesSearchFilterClause = (
  filters: IssuesFilterParams,
  visibility: Pick<IssuesVisibilityParams, "role" | "agentAdminFilter">,
  tableAlias = "a",
  startParamIndex = 1,
): { clauses: string[]; params: (string | number)[] } => {
  const col = (name: string) => `${tableAlias}.${name}`;
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  // Must be called BEFORE pushing the value it's indexing, since it derives
  // the placeholder number from the current (pre-push) params.length.
  const nextIndex = () => startParamIndex + params.length;

  if (filters.status) {
    const idx = nextIndex();
    params.push(filters.status);
    clauses.push(`${col("issue_status")} = $${idx}`);
  }

  if (filters.issuePriority) {
    const idx = nextIndex();
    params.push(filters.issuePriority);
    clauses.push(`${col("issue_priority")} = $${idx}`);
  }

  if (filters.reference) {
    const idx = nextIndex();
    params.push(`%${filters.reference}%`);
    clauses.push(`${col("issue_reference_id")} ILIKE $${idx}`);
  }

  if (filters.agent) {
    const idx = nextIndex();
    params.push(`%${filters.agent}%`);
    clauses.push(
      `(${col("issue_agent_name")} ILIKE $${idx} OR EXISTS (SELECT 1 FROM issue_collaborators ac WHERE ac.issue_id = ${col("issue_uuid")} AND ac.collaborator_name ILIKE $${idx}))`,
    );
  }

  if (filters.issueType) {
    const idx = nextIndex();
    params.push(`%${filters.issueType}%`);
    clauses.push(`${col("issue_type")} ILIKE $${idx}`);
  }

  if (filters.submitter) {
    const idx = nextIndex();
    params.push(`%${filters.submitter}%`);
    clauses.push(`${col("issue_submitter_name")} ILIKE $${idx}`);
  }

  if (filters.department) {
    // Which column "department" means depends on role/agentAdminFilter -
    // mirrors the departmentCheck logic previously computed client-side.
    const { role, agentAdminFilter } = visibility;
    const viewingOwnSubmissions = agentAdminFilter === "agentAdminFilter";
    const departmentColumn =
      role === "admin" || role === "agent"
        ? viewingOwnSubmissions
          ? "issue_target_department"
          : "issue_submitter_department"
        : "issue_target_department";

    const idx = nextIndex();
    params.push(filters.department);
    clauses.push(`${col(departmentColumn)} = $${idx}`);
  }

  if (filters.fromDate) {
    const idx = nextIndex();
    params.push(filters.fromDate);
    clauses.push(`${col("issue_created_at")}::date >= $${idx}`);
  }

  if (filters.toDate) {
    const idx = nextIndex();
    params.push(filters.toDate);
    clauses.push(`${col("issue_created_at")}::date <= $${idx}`);
  }

  return { clauses, params };
};

// Combines visibility + search filters into one WHERE clause, continuing $N
// numbering across both so callers can append LIMIT/OFFSET params after.
export const buildIssuesFilter = (
  visibility: IssuesVisibilityParams,
  filters: IssuesFilterParams,
  tableAlias = "a",
): { whereSql: string; params: (string | number)[] } => {
  const { clause: visibilityClause, params: visibilityParams } =
    buildIssuesVisibilityClause(visibility, tableAlias, 1);

  const { clauses: filterClauses, params: filterParams } =
    buildIssuesSearchFilterClause(
      filters,
      visibility,
      tableAlias,
      visibilityParams.length + 1,
    );

  const allClauses = [
    ...(visibilityClause ? [visibilityClause] : []),
    ...filterClauses,
  ];

  return {
    whereSql: allClauses.length ? ` WHERE ${allClauses.join(" AND ")}` : "",
    params: [...visibilityParams, ...filterParams],
  };
};

// Parses the query params the issues routes accept into the typed shape
// buildIssuesFilter expects.
export const parseIssuesFilterParams = (
  searchParams: URLSearchParams,
): IssuesFilterParams => ({
  status: searchParams.get("status") || undefined,
  reference: searchParams.get("reference") || undefined,
  department: searchParams.get("department") || undefined,
  agent: searchParams.get("agent") || undefined,
  issueType: searchParams.get("issueType") || undefined,
  issuePriority: searchParams.get("issuePriority") || undefined,
  submitter: searchParams.get("submitter") || undefined,
  fromDate: searchParams.get("fromDate") || undefined,
  toDate: searchParams.get("toDate") || undefined,
});
