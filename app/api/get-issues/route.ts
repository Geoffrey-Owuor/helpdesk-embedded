import { query } from "@/lib/Db";
import { NextResponse, NextRequest } from "next/server";
import { verifyAccessTokenJWT } from "@/lib/Auth";

export async function GET(request: NextRequest) {
  // First, check if we have a user
  const user = await verifyAccessTokenJWT();

  if (!user)
    return NextResponse.json(
      { message: "User is not authenticated" },
      { status: 401 },
    );

  // destructure user details
  const { userId, username, role, department } = user;

  // Extract query parameters from the request url
  const searchParams = request.nextUrl.searchParams;
  const selectedFilter = searchParams.get("selectedFilter");
  const status = searchParams.get("status");
  const reference = searchParams.get("reference");
  const departmentParams = searchParams.get("department");
  const agent = searchParams.get("agent");
  const issueType = searchParams.get("type");
  const submitter = searchParams.get("submitter");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  try {
    // Simple testing version to see the nature of the api response
    let baseQuery = `
    SELECT issue_uuid, issue_reference_id, issue_submitter_name, issue_submitter_department,
    issue_target_department, issue_type, issue_title, issue_description, issue_created_at, issue_status,
    issue_agent_name
    FROM issues_table
    `;

    const whereClauses: string[] = [];
    const params: (string | number)[] = [];

    //construct clauses based on role
    // Users see only what they are allowed to see
    if (role === "user") {
      whereClauses.push(`issue_submitter_id = $${params.length + 1}`);
      params.push(userId);
    } else if (role === "admin") {
      whereClauses.push(`issue_target_department = $${params.length + 1}`);
      params.push(department);
    } else if (role === "agent") {
      whereClauses.push(`issue_agent_name = $${params.length + 1}`);
      params.push(username);
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

    // department filtering
    else if (selectedFilter === "department" && departmentParams) {
      if (role === "user") {
        whereClauses.push(`issue_target_department = $${params.length + 1}`);
      } else {
        whereClauses.push(`issue_submitter_department = $${params.length + 1}`);
      }

      params.push(departmentParams);
    }

    // Agent filtering
    else if (selectedFilter === "agent" && agent) {
      whereClauses.push(`issue_agent_name ILIKE $${params.length + 1}`);
      params.push(`%${agent}%`);
    }

    // Issue type filtering
    else if (selectedFilter === "type" && issueType) {
      whereClauses.push(`issue_type = $${params.length + 1}`);
      params.push(issueType);
    }

    // Submitter filter
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

    baseQuery += ` ORDER BY issue_created_at DESC`;

    // Execute the query
    const issuesData = await query(baseQuery, params);

    // return a response
    return NextResponse.json(issuesData, { status: 200 });
  } catch (error) {
    console.error("Error retrieving the issue data", error);
    return NextResponse.json(
      { message: "Error retreiving the issues data" },
      { status: 500 },
    );
  }
}
