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

  try {
    // Simple testing version to see the nature of the api response
    const baseQuery = `
    SELECT issue_id, issue_uuid, issue_reference_id, issue_submitter_name, issue_submitter_department,
    issue_target_department, issue_type, issue_title, issue_description, issue_created_at, issue_status,
    issue_agent_name
    FROM issues_table
    ORDER BY issue_created_at DESC
    `;

    // Execute the query
    const issuesData = await query(baseQuery);

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
