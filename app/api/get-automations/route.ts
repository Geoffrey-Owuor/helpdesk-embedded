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
  const selectedFilter = searchParams.get("selectedFilter");
  const departmentFilter = searchParams.get("departmentFilter");
  const status = searchParams.get("status");
  const reference = searchParams.get("reference");
  const agent = searchParams.get("agent");
  const submitter = searchParams.get("submitter");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  try {
    // Simple testing version to see the nature of the api response
    let baseQuery = `
    SELECT issue_uuid, issue_reference_id, issue_submitter_name, issue_submitter_department,
    issue_target_department, issue_type, issue_title, issue_description, issue_created_at, issue_status,
    issue_agent_name, issue_agent_email
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

    // Dynamic filtering based on client params
    // status filter
    if (selectedFilter === "status" && status) {
      whereClauses.push(`issue_status = $${params.length + 1}`);
      params.push(status);
    }
    // reference filter
    else if (selectedFilter === "reference" && reference) {
      whereClauses.push(`issue_reference_id ILIKE $${params.length + 1}`);
      params.push(`%${reference}%`);
    }
    // Agent filtering
    else if (selectedFilter === "agent" && agent) {
      whereClauses.push(`issue_agent_name ILIKE $${params.length + 1}`);
      params.push(`%${agent}%`);
    }

    // Submitter filtering
    else if (selectedFilter === "submitter" && submitter) {
      whereClauses.push(`issue_submitter_name ILIKE $${params.length + 1}`);
      params.push(`%${submitter}%`);
    }

    // Date filtering
    else if (selectedFilter === "date" && fromDate && toDate) {
      whereClauses.push(`issue_created_at >= $${params.length + 1}`);
      params.push(fromDate);

      whereClauses.push(`issue_created_at <= $${params.length + 1}`);
      // Check if it's just a date string (length 10 usually implies YYYY-MM-DD)
      // If so, append end-of-day time. Otherwise use as is.
      // This helps when searching issues submitted within a specific day
      const finalToDate = toDate.length === 10 ? `${toDate} 23:59:59` : toDate;
      params.push(finalToDate);
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
