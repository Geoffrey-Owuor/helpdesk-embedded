import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { verifyAccessTokenJWT } from "@/lib/Auth";

export async function GET() {
  // First, check if we have a user
  const user = await verifyAccessTokenJWT();

  if (!user)
    return NextResponse.json(
      { message: "User is not authenticated" },
      { status: 401 },
    );

  // destructure user details
  const { userId, username, role, department } = user;

  try {
    // Simple testing version to see the nature of the api response
    let baseQuery = `
    SELECT issue_uuid, issue_reference_id, issue_submitter_name, issue_submitter_department,
    issue_target_department, issue_type, issue_title, issue_description, issue_created_at, issue_status,
    issue_agent_name
    FROM issues_table
    `;

    const whereClauses = [];
    const params = [];

    //construct clauses based on role
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
