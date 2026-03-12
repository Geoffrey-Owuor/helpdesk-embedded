import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const GET = withAuth(async ({ request }) => {
  const searchParams = request.nextUrl.searchParams;
  const uuid = searchParams.get("uuid");

  try {
    const baseQuery = `
    SELECT issue_uuid, issue_submitter_id, issue_reference_id, issue_submitter_name, issue_submitter_department,
    issue_target_department, issue_type, issue_priority, issue_title, issue_description, issue_created_at, issue_status,
    issue_agent_name, issue_agent_email
    FROM issues_table WHERE issue_uuid = $1
    `;

    // Query execution
    const result = await query(baseQuery, [uuid]);
    const issueData = result.length > 0 ? result[0] : {};

    return NextResponse.json(issueData, { status: 200 });
  } catch (error) {
    console.error("Error retrieving issue data", error);
    return NextResponse.json(
      { message: "Error retreiving the issue data" },
      { status: 500 },
    );
  }
});
