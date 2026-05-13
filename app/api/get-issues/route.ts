import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const GET = withAuth(async ({ user, request }) => {
  // destructure user details
  const { userId, email, role, department, isSuper } = user;

  // Define our query limit
  const limit = 500;

  // Extract query parameters from the request url
  const searchParams = request.nextUrl.searchParams;
  const superAdminFilter = searchParams.get("superAdminFilter");
  const agentAdminFilter = searchParams.get("agentAdminFilter");

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
        COUNT(b.issue_id) AS attachments_count,
        COUNT(c.issue_id) AS reopened_count,
        COUNT(d.issue_id) AS escalated_count
      FROM issues_table a
      LEFT JOIN issue_attachments b ON a.issue_uuid = b.issue_id
      LEFT JOIN issue_reopening c ON a.issue_uuid = c.issue_id
      LEFT JOIN issue_escalation d ON a.issue_uuid = d.issue_id
    `;

    const whereClauses: string[] = [];
    const params: (string | number)[] = [];

    //construct clauses based on role
    // Users see only what they are allowed to see
    // SuperAdmin filter only applys to super users
    if (!superAdminFilter || !isSuper) {
      if (role === "user") {
        whereClauses.push(`issue_submitter_id = $${params.length + 1}`);
        params.push(userId);
      } else if (role === "admin") {
        if (agentAdminFilter === "agentAdminFilter") {
          whereClauses.push(`issue_submitter_id = $${params.length + 1}`);
          params.push(userId);
        } else {
          whereClauses.push(`issue_target_department = $${params.length + 1}`);
          params.push(department);
        }
      } else if (role === "agent") {
        if (agentAdminFilter === "agentAdminFilter") {
          whereClauses.push(`issue_submitter_id = $${params.length + 1}`);
          params.push(userId);
        } else {
          whereClauses.push(`issue_agent_email = $${params.length + 1}`);
          params.push(email);
        }
      }
    }

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    // Drafting the final query
    baseQuery += ` GROUP BY a.issue_uuid, a.issue_submitter_id, a.issue_reference_id,
      a.issue_submitter_name, a.issue_submitter_department,
        a.issue_target_department, a.issue_type, 
        a.issue_priority, a.issue_title, a.issue_description, 
        a.issue_remarks, a.issue_created_at, a.issue_updated_at, a.issue_status,
        a.issue_agent_name, a.issue_agent_email, a.issue_date_resolved, 
        a.issue_date_closed
        ORDER BY issue_created_at DESC LIMIT $${params.length + 1}`;
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
