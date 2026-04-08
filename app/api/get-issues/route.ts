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
    SELECT issue_uuid, issue_submitter_id, issue_reference_id, issue_submitter_name, issue_submitter_department,
    issue_target_department, issue_type, issue_priority, issue_title, issue_description, issue_remarks, issue_created_at, issue_updated_at, issue_status,
    issue_agent_name, issue_agent_email
    FROM issues_table
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
    baseQuery += ` ORDER BY issue_created_at DESC LIMIT $${params.length + 1}`;
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
