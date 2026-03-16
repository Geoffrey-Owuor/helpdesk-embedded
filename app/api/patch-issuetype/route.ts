import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";

export const PATCH = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  const { isSuper, email, userId, username } = user;

  //Is user a super admin
  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { type, uuid } = await request.json();

    if (!type || !uuid) {
      return NextResponse.json(
        { message: "Missing some required payload" },
        { status: 400 },
      );
    }

    // Getting a pool client
    client = await pool.connect();

    // Begin a transactiob
    await client.query("BEGIN");

    // Check if issue is already marked as resolved
    const { rows } = await client.query(
      `
        SELECT issue_type, issue_status FROM issues_table WHERE issue_uuid = $1 FOR UPDATE
        `,
      [uuid],
    );

    // Issue not found
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    // Our current issue type and status
    const currentStatus = rows[0].issue_status;
    const currentType = rows[0].issue_type;

    // Issue is already marked as resolved
    if (currentStatus === "resolved") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "This issue is already marked as resolved" },
        { status: 409 },
      );
    }

    // Trying to assign the same issue type that was already there before
    if (currentType === type) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: `Issue type is already set to ${type}` },
        { status: 409 },
      );
    }

    // Otherwise, run the update query
    const updateQuery = `
    UPDATE issues_table
    SET issue_type = $1,
    issue_assigner_id = $2,
    issue_assigner_email = $3,
    issue_assigner_name = $4,
    issue_updated_at = CURRENT_TIMESTAMP
    WHERE issue_uuid = $5
    `;

    // The params
    const params = [type, userId, email, username, uuid];

    await client.query(updateQuery, params);

    // Commit the transaction
    await client.query("COMMIT");

    // Return a response
    return NextResponse.json(
      { message: "Issue type updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to patch the issue type:", error);
    return NextResponse.json(
      { message: "Error updating issue type" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
