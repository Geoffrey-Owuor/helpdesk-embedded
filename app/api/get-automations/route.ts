import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const GET = withAuth(async ({ request }) => {
  //Our main filter
  const IssueTypeFilter = "Automation";

  // Our query limit
  const limit = 500;

  // Extract query parameters from the request url
  const searchParams = request.nextUrl.searchParams;

  const departmentFilter = searchParams.get("departmentFilter");

  try {
    // Simple testing version to see the nature of the api response
    let baseQuery = `
    SELECT issue_uuid, issue_submitter_id, issue_reference_id, issue_submitter_name, issue_submitter_department,
    issue_target_department, issue_type, issue_priority, issue_title, issue_description, issue_remarks, issue_created_at, issue_updated_at, issue_status,
    issue_agent_name, issue_agent_email, issue_date_resolved, issue_date_closed, issue_reopened, issue_reopened_reason
    FROM issues_table
    `;

    const whereClauses: string[] = [];
    const params: (string | number)[] = [];

    // General filters for the Automations query
    if (IssueTypeFilter) {
      whereClauses.push(`issue_type = $${params.length + 1}`);
      params.push(IssueTypeFilter);
    }

    if (departmentFilter) {
      whereClauses.push(`issue_submitter_department = $${params.length + 1}`);
      params.push(departmentFilter);
    }

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    // Our final query
    baseQuery += ` ORDER BY issue_created_at DESC LIMIT $${params.length + 1}`;
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
