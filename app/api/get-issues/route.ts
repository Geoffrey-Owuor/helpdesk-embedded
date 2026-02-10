import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const GET = withAuth(async ({ user, request }) => {
  // destructure user details
  const { userId, email, role, department } = user;

  // Define our query limit
  const limit = 500;

  // Extract query parameters from the request url
  const searchParams = request.nextUrl.searchParams;
  const selectedFilter = searchParams.get("selectedFilter");
  const agentAdminFilter = searchParams.get("agentAdminFilter");
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
    SELECT issue_uuid, issue_submitter_id, issue_reference_id, issue_submitter_name, issue_submitter_department,
    issue_target_department, issue_type, issue_title, issue_description, issue_created_at, issue_status,
    issue_agent_name, issue_agent_email
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
      } else if (role === "admin" || role === "agent") {
        if (agentAdminFilter === "agentAdminFilter") {
          whereClauses.push(`issue_target_department = $${params.length + 1}`);
        } else {
          whereClauses.push(
            `issue_submitter_department = $${params.length + 1}`,
          );
        }
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
      whereClauses.push(`issue_type ILIKE $${params.length + 1}`);
      params.push(`%${issueType}%`);
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

    // Drafting the final query
    baseQuery += ` ORDER BY issue_created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

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
});
