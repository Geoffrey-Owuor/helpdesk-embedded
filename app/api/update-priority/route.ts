import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { emailSender } from "@/services/EmailSender";

export const PUT = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  const { role, username, userId, email, isSuper } = user;

  //  Admin functionality only
  if (role !== "admin" && !isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { uuid, priority } = await request.json();

    if (!uuid || !priority) {
      return NextResponse.json(
        { message: "UUID and priority are required" },
        { status: 400 },
      );
    }

    //Get a pool client
    client = await pool.connect();

    //Begin a transaction
    await client.query("BEGIN");

    //check if the issue is already marked as resolved
    const { rows } = await client.query(
      `SELECT issue_status, issue_reference_id, issue_priority FROM issues_table WHERE issue_uuid = $1 FOR UPDATE`,
      [uuid],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    //our current issue status
    const currentStatus = rows[0].issue_status;
    const currentPriority = rows[0].issue_priority;
    const referenceNumber = rows[0].issue_reference_id;

    // Issue is already resolved
    if (currentStatus === "resolved") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "This issue is already marked as resolved" },
        { status: 409 },
      );
    }

    // Selected priority is the one currently associated with the issue
    if (currentPriority === priority) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: `Issue's priority is already marked as ${priority}` },
        { status: 409 },
      );
    }

    // Grouping our parameters
    const queryParams = [priority, userId, email, username, uuid];

    // Our query
    await client.query(
      `
        UPDATE issues_table
        SET issue_priority = $1,
        issue_assigner_id = $2,
        issue_assigner_email = $3,
        issue_assigner_name = $4,
        issue_updated_at = CURRENT_TIMESTAMP
        WHERE issue_uuid = $5
        `,
      queryParams,
    );

    // Commit the transaction
    await client.query("COMMIT");

    // EMAIL SERVICE
    const title = `${referenceNumber} Priority Changed to ${priority}`;
    const description = `${referenceNumber} priority has been changed to ${priority} by ${username}`;

    // Fire and forget - Calling the email sender service
    emailSender({ title, description, uuid });

    // Return a response to the user
    return NextResponse.json(
      { message: "Issue priority updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to update the issue priority:", error);
    return NextResponse.json(
      { message: "Error updating issue priority" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
