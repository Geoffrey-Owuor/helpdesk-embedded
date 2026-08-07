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
      `SELECT issue_status, issue_reference_id,
       issue_created_at, issue_description, issue_submitter_id, 
       issue_submitter_email, issue_submitter_name
      FROM issues_table WHERE issue_uuid = $1 FOR UPDATE`,
      [uuid],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    //our current issue status
    const currentStatus = rows[0].issue_status;
    const referenceNumber = rows[0].issue_reference_id;

    // Our first reopen history data
    const currentCreatedAt = rows[0].issue_created_at;
    const currentSubmitterId = rows[0].issue_submitter_id;
    const currentSubmitterEmail = rows[0].issue_submitter_email;
    const currentSubmitterName = rows[0].issue_submitter_name;
    const currentReason = rows[0].issue_description;

    // Issue is already closed/resolved
    if (currentStatus !== "closed" && currentStatus !== "resolved") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "This issue has not been resolved/closed yet" },
        { status: 409 },
      );
    }

    // Check if there's re-open history for this particular issue
    const { rows: existingHistory } = await client.query(
      `SELECT id FROM issue_reopening WHERE issue_id = $1`,
      [uuid],
    );

    // No history - insert first history - issue first creation
    if (existingHistory.length === 0) {
      await client.query(
        `
        INSERT INTO issue_reopening
        (issue_id, issue_reopen_reason, issue_reopener_id, issue_reopener_email, issue_reopener_name, issue_reopen_date)
        VALUES
        ($1, $2, $3, $4, $5, $6)
        `,
        [
          uuid,
          currentReason,
          currentSubmitterId,
          currentSubmitterEmail,
          currentSubmitterName,
          currentCreatedAt,
        ],
      );
    }

    // Insert new reopen row
    await client.query(
      `
      INSERT INTO issue_reopening
      (issue_id, issue_reopen_reason, issue_reopener_id, issue_reopener_email, issue_reopener_name, issue_reopen_date)
        VALUES
        ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `,
      [uuid, reason, userId, email, username],
    );

    // Update issues_table to set the issue to open and reset the creation date
    await client.query(
      `
      UPDATE issues_table
      SET issue_status = $1,
      issue_created_at = CURRENT_TIMESTAMP,
      issue_updated_at = CURRENT_TIMESTAMP,
      issue_date_closed = NULL,
      issue_date_resolved = NULL
      WHERE issue_uuid = $2
      `,
      ["open", uuid],
    );

    // Commit the transaction
    await client.query("COMMIT");

    // EMAIL SERVICE
    const title = `Issue ${referenceNumber} Reopened by ${username}`;
    const description = `Issue ${referenceNumber} has been reopened by ${username}`;
    const reasonReopened = reason;

    // Fire and forget - Calling the email sender service
    emailSender({ title, description, uuid, reasonReopened });

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
