import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const GET = withAuth(async ({ user, request }) => {
  // destructure user details
  const { userId, email, role, department, isSuper } = user;

  // Define our default/max query limits
  const DEFAULT_LIMIT = 500;
  const MAX_LIMIT = 5000;

  // Extract query parameters from the request url
  const searchParams = request.nextUrl.searchParams;
  const superAdminFilter = searchParams.get("superAdminFilter");
  const agentAdminFilter = searchParams.get("agentAdminFilter");
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
        a.issue_target_department, a.issue_type, 
        a.issue_priority, a.issue_title, a.issue_description, 
        a.issue_remarks, a.issue_created_at, a.issue_updated_at, a.issue_status,
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

    //construct clauses based on role
    // Users see only what they are allowed to see
    // SuperAdmin filter only applys to super users
    if (!superAdminFilter || !isSuper) {
      if (role === "user") {
        whereClauses.push(`a.issue_submitter_id = $${params.length + 1}`);
        params.push(userId);
      } else if (role === "admin") {
        if (agentAdminFilter === "agentAdminFilter") {
          whereClauses.push(`a.issue_submitter_id = $${params.length + 1}`);
          params.push(userId);
        } else {
          whereClauses.push(
            `a.issue_target_department = $${params.length + 1}`,
          );
          params.push(department);
        }
      } else if (role === "agent") {
        if (agentAdminFilter === "agentAdminFilter") {
          whereClauses.push(`a.issue_submitter_id = $${params.length + 1}`);
          params.push(userId);
        } else {
          // Agents see the issues assigned to them, plus any issue they have
          // been invited onto as a collaborator
          whereClauses.push(
            `(a.issue_agent_email = $${params.length + 1}
              OR EXISTS (
                SELECT 1 FROM issue_collaborators ic
                WHERE ic.issue_id = a.issue_uuid
                AND ic.collaborator_email = $${params.length + 1}
              ))`,
          );
          params.push(email);
        }
      }
    }

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    // Drafting the final query
    baseQuery += ` ORDER BY a.issue_created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    // Execute the query
    const issuesData = await query(baseQuery, params);

    // return a response
    return NextResponse.json(issuesData, { status: 200 });
  } catch (error) {
    console.error("Error retrieving issues data", error);
    return NextResponse.json(
      { message: "Error retreiving the issues data" },
      { status: 500 },
    );
  }
});
