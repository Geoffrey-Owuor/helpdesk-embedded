import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { emailSender } from "@/services/EmailSender";

export const PUT = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  const { role, username } = user;

  //Check if the user is authorized to perform this transaction
  if (role === "user") {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { uuid, status, remarks } = await request.json();

    if (!uuid || !status || !remarks) {
      return NextResponse.json(
        { message: "UUID and Status are required" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    //check if the issue is already marked as closed
    const { rows } = await client.query(
      `SELECT issue_status, issue_reference_id, issue_agent_id FROM issues_table WHERE issue_uuid = $1 FOR UPDATE`,
      [uuid],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    //our current issue status
    const currentStatus = rows[0].issue_status;
    const assignedAgentId = rows[0].issue_agent_id;
    const referenceNumber = rows[0].issue_reference_id;

    // Issue is already closed
    if (currentStatus === "closed") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "This issue is already marked as closed" },
        { status: 409 },
      );
    }

    // Selected status is the one currently marked for the issue
    if (currentStatus === status) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: `This issue is already marked as ${status}` },
        { status: 409 },
      );
    }

    // Don't update the status if there's no agent assigned to the issue
    if (!assignedAgentId) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message: "Can't update the status of an unassigned issue",
        },
        { status: 409 },
      );
    }

    // Group our params
    const queryParams = [status, remarks, uuid];

    // Issue is not closed, so we can continue
    await client.query(
      `UPDATE issues_table 
        SET issue_status = $1,
        issue_remarks = $2,
        issue_updated_at = CURRENT_TIMESTAMP
        WHERE issue_uuid = $3`,
      queryParams,
    );

    // Update date resolved when status is resolved
    if (status === "resolved") {
      await client.query(
        `UPDATE issues_table SET issue_date_resolved = CURRENT_TIMESTAMP WHERE issue_uuid = $1`,
        [uuid],
      );
    }

    // Update date closed when status is closed
    if (status === "closed") {
      await client.query(
        `UPDATE issues_table SET issue_date_closed = CURRENT_TIMESTAMP WHERE issue_uuid = $1`,
        [uuid],
      );
    }

    // Commit the transaction
    await client.query("COMMIT");

    // EMAIL SERVICE
    const title = `Issue ${referenceNumber} status updated to ${status}`;
    const description = `Status of Issue ${referenceNumber} has been updated to ${status} by ${username}`;

    // Fire and forget - Calling the email sender service
    // emailSender({ title, description, uuid });

    // return a response to the user
    return NextResponse.json(
      { message: "Status updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to update the status:", error);
    return NextResponse.json(
      { message: "Error updating the status" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
