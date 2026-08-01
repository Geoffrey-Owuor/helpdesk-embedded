import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { AUTOMATION_TYPE_FILTERS as issueTypeFilters } from "@/public/assets";

export const GET = withAuth(async ({ request, user }) => {
  // Our default/max query limits
  const DEFAULT_LIMIT = 500;
  const MAX_LIMIT = 5000;

  const { role, isSuper } = user;

  // Extract query parameters from the request url
  const searchParams = request.nextUrl.searchParams;

  const departmentFilter = searchParams.get("departmentFilter");
  const requestedLimit = searchParams.get("limit");

  // Only admins, agents, and super admins may request a limit above the
  // default cap - users stay capped to keep the query cheap and prevent abuse
  const canRequestExtendedLimit =
    isSuper || role === "admin" || role === "agent";

  let limit = DEFAULT_LIMIT;
  if (canRequestExtendedLimit && requestedLimit) {
    const parsedLimit = parseInt(requestedLimit, 10);
    if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
      limit = Math.min(parsedLimit, MAX_LIMIT);
    }
  }

  try {
    // Simple testing version to see the nature of the api response
    let baseQuery = `
      SELECT 
        a.issue_uuid, a.issue_submitter_id, a.issue_reference_id, 
        a.issue_submitter_name, a.issue_submitter_department,
        a.issue_target_department, a.issue_type, a.issue_priority, 
        a.issue_title, a.issue_description, a.issue_remarks, 
        a.issue_created_at, a.issue_updated_at, a.issue_status,
        a.issue_agent_name, a.issue_agent_email, a.issue_date_resolved,
        a.issue_date_closed,
        (SELECT COUNT(*) FROM issue_attachments b WHERE b.issue_id = a.issue_uuid) AS attachments_count,
        (SELECT COUNT(*) FROM issue_reopening c WHERE c.issue_id = a.issue_uuid) AS reopened_count,
        (SELECT COUNT(*) FROM issue_escalation d WHERE d.issue_id = a.issue_uuid) AS escalated_count,
        (SELECT COUNT(*) FROM issue_collaborators e WHERE e.issue_id = a.issue_uuid) AS collaborators_count
      FROM issues_table a
    `;

    const whereClauses: string[] = [];
    const params: (string | number)[] = [];

    if (departmentFilter) {
      whereClauses.push(`a.issue_submitter_department = $${params.length + 1}`);
      params.push(departmentFilter);
    }

    // 2. NEW: Issue Type Array Filter
    if (issueTypeFilters && issueTypeFilters.length > 0) {
      // Option A: Dynamic IN clauses ($2, $3, $4...)
      const placeholders = issueTypeFilters.map(
        (_, index) => `$${params.length + index + 1}`,
      );
      whereClauses.push(`a.issue_type IN (${placeholders.join(", ")})`);
      params.push(...issueTypeFilters);
    }

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    // Our final query
    baseQuery += ` ORDER BY a.issue_created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const automationsData = await query(baseQuery, params);

    // return a response
    return NextResponse.json(automationsData, { status: 200 });
  } catch (error) {
    console.error("Error retrieving the issue data", error);
    return NextResponse.json(
      { message: "Error retreiving the issues data" },
      { status: 500 },
    );
  }
});
