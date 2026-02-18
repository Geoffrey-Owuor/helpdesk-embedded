import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { revalidateTag } from "next/cache";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";

export const PUT = withAuth(async ({ request, user }) => {
  let client: PoolClient | undefined;

  const { userId, role } = user;

  // Make sure the user running the query is an admin
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
        { message: "Missing some required payload information" },
        { status: 403 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Check if the issue type exists
    const { rows } = await client.query(
      `SELECT issue_type FROM issues_mapping WHERE issue_type = $1 AND admin_id = $2 FOR UPDATE`,
      [issueType, userId],
    );

    // Issue type does not exist
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Issue type not found" },
        { status: 404 },
      );
    }

    // Issue type exists - we can update it
    const updateQuery = `
       UPDATE issues_mapping
       SET issue_type = $1,
       agent_id = (SELECT user_id FROM users WHERE email = $2 LIMIT 1)
       WHERE issue_type = $3 AND admin_id = $4
    `;

    // Run the query
    await client.query(updateQuery, [
      selectedType,
      selectedEmail,
      issueType,
      userId,
    ]);

    // Commit the transaction
    await client.query("COMMIT");

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
    await client?.query("ROLLBACK");
    console.error("Error while trying to update issue type info:", error);
    return NextResponse.json(
      { message: "Error updating issue type info" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
