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
      SELECT 
        a.issue_uuid, a.issue_submitter_id, a.issue_reference_id, 
        a.issue_submitter_name, a.issue_submitter_department,
        a.issue_target_department, a.issue_type, a.issue_priority, 
        a.issue_title, a.issue_description, a.issue_remarks, 
        a.issue_created_at, a.issue_updated_at, a.issue_status,
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
    baseQuery += ` GROUP BY a.issue_uuid, a.issue_submitter_id, a.issue_reference_id,
      a.issue_submitter_name, a.issue_submitter_department,
        a.issue_target_department, a.issue_type, 
        a.issue_priority, a.issue_title, a.issue_description, 
        a.issue_remarks, a.issue_created_at, a.issue_updated_at, a.issue_status,
        a.issue_agent_name, a.issue_agent_email, a.issue_date_resolved, 
        a.issue_date_closed
        ORDER BY issue_created_at DESC LIMIT $${params.length + 1}`;
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
