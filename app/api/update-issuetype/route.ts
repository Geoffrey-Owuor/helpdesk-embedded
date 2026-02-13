import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";
import { revalidateTag } from "next/cache";

export const PUT = withAuth(async ({ request, user }) => {
  const { userId, role } = user;

  // Make sure the user running the query is an administrator
  if (role !== "admin") {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { selectedType, selectedEmail, issueType } = await request.json();

    if (!selectedType || !selectedEmail || !issueType) {
      return NextResponse.json(
        { message: "Missing some required payload" },
        { status: 403 },
      );
    }

    const updateQuery = `
       UPDATE issues_mapping
       SET issue_type = $1,
       agent_id = (SELECT user_id FROM users WHERE email = $2)
       WHERE issue_type = $3 AND admin_id = $4
       RETURNING id
    `;

    // Run the query
    const result = await query(updateQuery, [
      selectedType,
      selectedEmail,
      issueType,
      userId,
    ]);

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Issue type could not be found" },
        { status: 404 },
      );
    }

    // Revalidate the cache tags
    revalidateTag("GetIssueAgents", { expire: 0 });
    revalidateTag("Issue_Types", { expire: 0 });
    revalidateTag("Issue_Agents_Mapping", { expire: 0 });

    // return a response
    return NextResponse.json(
      { message: "Issue type info updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to update issue type info:", error);
    return NextResponse.json(
      { message: "Error updating issue type info" },
      { status: 500 },
    );
  }
});
