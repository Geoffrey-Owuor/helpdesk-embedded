import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";

export const PUT = withAuth(async ({ request, user }) => {
  let client: PoolClient | undefined;

  const { role } = user;

  // Check if user is authorized to perform this action
  if (role !== "user") {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { issue_title, issue_description, uuid } = await request.json();

    if (!issue_title || !issue_description || !uuid) {
      return NextResponse.json(
        { message: "Issue description and title are required" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    //check if the issue is already marked as resolved
    const { rows } = await client.query(
      `SELECT issue_status FROM issues_table WHERE issue_uuid = $1 FOR UPDATE`,
      [uuid],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    //our current issue status
    const currentStatus = rows[0].issue_status;

    // Issue is already resolved
    if (currentStatus === "resolved") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "This issue is already marked as resolved" },
        { status: 409 },
      );
    }

    // Our query
    const updateQuery = `
    UPDATE issues_table SET 
    issue_title = $1,
    issue_description = $2,
    issue_update_at = CURRENT_TIMESTAMP
    WHERE issue_uuid = $3
    `;

    // Our query params
    const params = [issue_title, issue_description, uuid];

    // Run the query
    await client.query(updateQuery, params);

    // Commit the transaction
    await client.query("COMMIT");

    // Return a response to the user
    return NextResponse.json(
      { message: "Details update successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to update title and description:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
