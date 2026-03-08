import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";
import { revalidateTag } from "next/cache";

export const POST = withAuth(async ({ user, request }) => {
  const { role, userId } = user;

  // Check if user is not an admin
  if (role !== "admin") {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { issueType, agentEmail, issuePriority } = await request.json();

    // Bad request
    if (!issueType || !agentEmail || !issuePriority) {
      return NextResponse.json(
        { message: "Missing some required info" },
        { status: 400 },
      );
    }

    // Conflict - check if there's already an issue-type with the sent name
    const existingIssueTypeQuery = `
        SELECT issue_type FROM issues_mapping
        WHERE issue_type = $1
        `;

    const existingIssueType = await query(existingIssueTypeQuery, [issueType]);

    if (existingIssueType.length > 0) {
      return NextResponse.json(
        { message: "An issue type with this name already exists" },
        { status: 409 },
      );
    }

    // Everything is ok - perform the insert query
    const insertQuery = `
        INSERT INTO issues_mapping(issue_type, issue_priority, admin_id, agent_id)
        VALUES
        ($1, $2, $3, (SELECT user_id FROM users WHERE email = $3 LIMIT 1))
        `;

    // Execute the query
    await query(insertQuery, [issueType, issuePriority, userId, agentEmail]);

    // Revalidate the cache tags
    revalidateTag("GetIssueAgents", { expire: 0 });
    revalidateTag("Issue_Types", { expire: 0 });
    revalidateTag("Issue_Agents_Mapping", { expire: 0 });

    // Return a response
    return NextResponse.json(
      { message: "Issue type added successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro while trying to add an issue type:", error);
    return NextResponse.json(
      { message: "Error while trying to add the issue type" },
      { status: 500 },
    );
  }
});
