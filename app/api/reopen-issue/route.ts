import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { emailSender } from "@/services/EmailSender";

export const PUT = withAuth(async ({ request, user }) => {
  const { username, userId, email } = user;
  let client: PoolClient | undefined;

  try {
    const { uuid, reason } = await request.json();

    if (!uuid || !reason) {
      return NextResponse.json(
        { message: "UUID and Reason are required" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    //check if the issue is not marked as closed
    const { rows } = await client.query(
      `SELECT issue_status, issue_reference_id FROM issues_table WHERE issue_uuid = $1 FOR UPDATE`,
      [uuid],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    //our current issue status
    const currentStatus = rows[0].issue_status;
    const referenceNumber = rows[0].issue_reference_id;

    // Issue is already closed
    if (currentStatus !== "closed") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "This issue is not yet closed" },
        { status: 409 },
      );
    }

    // Grouping our params
    const queryParams = ["open", "Yes", reason, userId, email, username, uuid];

    // Issue is not closed, so we can continue
    await client.query(
      `UPDATE issues_table 
        SET issue_status = $1,
        issue_reopened = $2,
        issue_reopened_reason = $3,
        issue_created_at = CURRENT_TIMESTAMP,
        issue_updated_at = CURRENT_TIMESTAMP,
        issue_reopener_id = $4,
        issue_reopener_email = $5,
        issue_reopener_name = $6,
        issue_reopened_date = CURRENT_TIMESTAMP
        WHERE issue_uuid = $7`,
      queryParams,
    );

    // Commit the transaction
    await client.query("COMMIT");

    // EMAIL SERVICE
    const title = `Issue ${referenceNumber} Reopened by ${username}`;
    const description = `Issue ${referenceNumber} has been reopened by ${username}`;

    // Fire and forget - Calling the email sender service
    // emailSender({ title, description, uuid });

    // return a response to the user
    return NextResponse.json(
      { message: "Issue reopened successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to reopen an issue:", error);
    return NextResponse.json(
      { message: "Error reopening the issue" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
