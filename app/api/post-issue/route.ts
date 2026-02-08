import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const POST = withAuth(async ({ request, user }) => {
  // initialze the pool client variable
  let client: PoolClient | undefined;

  // Define our default agent value
  const defaultAgent = "Not Assigned";

  try {
    const { target_department, issue_type, issue_title, issue_description } =
      await request.json();

    // Check if we have all the data
    if (
      !target_department ||
      !issue_type ||
      !issue_title ||
      !issue_description
    ) {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // begin a transaction
    await client.query("BEGIN");

    // construct a prepared statement
    const insertQuery = `
    INSERT INTO issues_table
    (issue_submitter_id, issue_submitter_name, issue_submitter_email, issue_submitter_department, issue_target_department, issue_type, issue_title, issue_description, issue_agent_name)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING issue_id
    `;

    // construct the params
    const params = [
      user.userId,
      user.username,
      user.email,
      user.department,
      target_department,
      issue_type,
      issue_title,
      issue_description,
      defaultAgent,
    ];

    //run the query
    const { rows: returnedId } = await client.query(insertQuery, params);

    // Get the returned id
    const resultantId = returnedId[0].issue_id;

    // Craft an issue reference number
    const issueReferenceNumber = `#ISSUE-${resultantId}`;

    // Update the issues table with the reference number
    await client.query(
      `
        UPDATE issues_table
        SET issue_reference_id = $1
        WHERE issue_id = $2
        `,
      [issueReferenceNumber, resultantId],
    );

    // Query to auto-assign the issue to an agent based on the target department and issue type
    //First, we fetch the necessary agent and admin info based on the issue type and target department.
    // This is done before the update to ensure we have the correct info in case of any issues during the update.

    const fetchAgentInfoQuery = `
    SELECT 
    agents.username AS agent_name,
    agents.email AS agent_email,
    admins.username AS admin_name,
    admins.email AS admin_email
    FROM issues_mapping AS m
    JOIN users AS agents ON m.agent_id = agents.user_id
    JOIN users AS admins ON m.admin_id = admins.user_id
    WHERE m.issue_type = $1 AND admins.department = $2 AND agents.department = $2 LIMIT 1
    `;

    const fetchAgentInfoParams = [issue_type, target_department];

    const { rows: agentInfoRows } = await client.query(
      fetchAgentInfoQuery,
      fetchAgentInfoParams,
    );

    // If we found an agent mapping, proceed to update the issue with the agent info
    if (agentInfoRows.length > 0) {
      const agentInfo = agentInfoRows[0];

      // Update the issue with the agent info
      await client.query(
        `
        UPDATE issues_table
        SET issue_agent_email = $1, issue_agent_name = $2, issue_assigner_name = $3, issue_assigner_email = $4
        WHERE issue_id = $5
        `,
        [
          agentInfo.agent_email,
          agentInfo.agent_name,
          agentInfo.admin_name,
          agentInfo.admin_email,
          resultantId,
        ],
      );
    }

    // COMMIT THE TRANSACTION
    await client.query("COMMIT");

    // Return a response to the client
    return NextResponse.json(
      { message: "Your issue has been submitted!" },
      { status: 200 },
    );
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Error while submitting the issue", error);

    return NextResponse.json(
      { message: "Error while trying to submit your issue" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
