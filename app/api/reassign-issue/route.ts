import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { emailSender } from "@/services/EmailSender";
import { canTriageIssue } from "@/lib/IssueAccess";

export const PUT = withAuth(async ({ request, user }) => {
  let client: PoolClient | undefined;

  const { username, email, userId } = user;

  try {
    const { uuid, agentName, agentEmail } = await request.json();

    if (!uuid || !agentName || !agentEmail) {
      return NextResponse.json(
        { message: "Missing some required information" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Check if issue is already marked as closed
    const { rows } = await client.query(
      `SELECT issue_status, issue_reference_id, issue_agent_email, issue_target_department
       FROM issues_table WHERE issue_uuid = $1 FOR UPDATE`,
      [uuid],
    );

    //If nothing is returned
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    // Admins of the issue's department and super admins only
    if (!canTriageIssue(user, rows[0])) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "You are not authorized to perform this action" },
        { status: 403 },
      );
    }

    // Our current issues status and current agent email
    const currentStatus = rows[0].issue_status;
    const currentAgentEmail = rows[0].issue_agent_email;
    const referenceNumber = rows[0].issue_reference_id;

    // Issue is already closed
    if (currentStatus === "closed") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "This issue is already marked as closed" },
        { status: 409 },
      );
    }

    //Trying to reassign an issue to the same agent (Feature add: Return a response with the agent name)
    if (agentEmail === currentAgentEmail) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: `Issue is already assigned to ${agentName}` },
        { status: 409 },
      );
    }

    // Get the agent id who is being re-assigned this issue
    const { rows: agentInfo } = await client.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [agentEmail],
    );

    if (agentInfo.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: `Selected agent: ${agentName} not found` },
        { status: 404 },
      );
    }

    // Get the returned agent id
    const agentId = agentInfo[0].user_id;

    // Otherwise let's perform our update
    const updateQuery = `
    UPDATE issues_table SET 
    issue_agent_id = $1,
    issue_agent_name = $2,
    issue_agent_email = $3,
    issue_assigner_id = $4,
    issue_assigner_name = $5,
    issue_assigner_email = $6,
    issue_updated_at = CURRENT_TIMESTAMP
    WHERE issue_uuid = $7
    `;

    // Our params
    const updateParams = [
      agentId,
      agentName,
      agentEmail,
      userId,
      username,
      email,
      uuid,
    ];

    // run the query
    await client.query(updateQuery, updateParams);

    // commit the transaction
    await client.query("COMMIT");

    // EMAIL SERVICE
    const title = `Issue ${referenceNumber} Reassigned to ${agentName}`;
    const description = `Issue ${referenceNumber} has been reassigned to ${agentName} by ${username}`;

    // Fire and Forget - Calling the email sender service
    emailSender({
      title,
      description,
      uuid,
      prevAgentEmail: currentAgentEmail,
    });

    // return a response
    return NextResponse.json(
      { message: "Issue successfully reassigned" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to reassign the issue:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
