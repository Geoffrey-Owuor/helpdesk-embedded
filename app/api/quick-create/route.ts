import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { NextResponse, NextRequest } from "next/server";
import { emailSender } from "@/services/EmailSender";
import { CheckBehalfUser } from "@/serverActions/CheckBehalfUser";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const secret = searchParams.get("secret");

  if (secret !== process.env.NEXT_PUBLIC_APIS_KEY) {
    return NextResponse.json(
      {
        message:
          "Wrong secret, please provide the right one or contact your admin",
      },
      { status: 400 },
    );
  }

  // initialze the pool client variable
  let client: PoolClient | undefined;

  // Define our default agent value
  const defaultAgent = "Not Assigned";

  try {
    // Payload definition
    const payload = await request.json();

    // Destructure the payload
    const {
      user_name,
      user_email,
      user_department,
      target_department,
      issue_type,
      issue_title,
      issue_description,
    } = payload;

    // Bad request - Missing some required fields
    const someFieldsMissing = Object.values(payload).some((value) => !value);

    if (someFieldsMissing) {
      return NextResponse.json(
        { message: "Some required fields are missing, please try again" },
        { status: 400 },
      );
    }

    // Call the check behalf user to verify the user submitting an issue
    const returnedUser = await CheckBehalfUser({
      name: user_name,
      email: user_email,
      department: user_department,
    });

    if (!returnedUser) {
      return NextResponse.json(
        {
          message:
            "Could not verify/create the user you're trying to submit for, please contact your admin",
        },
        { status: 422 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // begin a transaction
    await client.query("BEGIN");

    // construct a prepared statement
    const insertQuery = `
    INSERT INTO issues_table
    (issue_submitter_id, issue_submitter_name, issue_submitter_email, issue_submitter_department, issue_target_department, issue_type, issue_title, issue_description, issue_agent_name, issue_reference_id)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, generate_issue_reference())
    RETURNING issue_id, issue_uuid, issue_reference_id
    `;

    // construct the params
    const params = [
      returnedUser.userId,
      returnedUser.name,
      returnedUser.email,
      returnedUser.department,
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
    const resultantUuid = returnedId[0].issue_uuid;
    const issueReferenceNumber = returnedId[0].issue_reference_id;

    // Query to auto-assign the issue to an agent based on the target department and issue type
    //First, we fetch the necessary agent and admin info based on the issue type and target department.
    // This is done before the update to ensure we have the correct info in case of any issues during the update.

    const fetchAgentInfoQuery = `
    SELECT 
    agents.username AS agent_name,
    agents.email AS agent_email,
    admins.username AS admin_name,
    admins.email AS admin_email,
    m.issue_priority AS issue_priority,
    m.admin_id AS admin_id,
    m.agent_id AS agent_id
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
        SET issue_agent_email = $1, issue_agent_name = $2, issue_assigner_name = $3, issue_assigner_email = $4,
        issue_priority = $5, issue_agent_id = $6, issue_assigner_id = $7
        WHERE issue_id = $8
        `,
        [
          agentInfo.agent_email,
          agentInfo.agent_name,
          agentInfo.admin_name,
          agentInfo.admin_email,
          agentInfo.issue_priority,
          agentInfo.agent_id,
          agentInfo.admin_id,
          resultantId,
        ],
      );
    }

    // COMMIT THE TRANSACTION
    await client.query("COMMIT");

    // EMAIL SERVICE
    const title = `New Issue ${issueReferenceNumber} Raised By ${returnedUser.name}`;
    const description = `A new issue has been raised to ${target_department} by ${returnedUser.name}`;

    // Fire and forget - calling the email sender service
    emailSender({
      title,
      description,
      uuid: resultantUuid,
    });

    // Return a response to the client
    return NextResponse.json(
      { message: "Your issue has been submitted successfully!" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to submit a quick create issue:", error);
    return NextResponse.json(
      { message: "An error occurred while trying to submit your issue" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
}
