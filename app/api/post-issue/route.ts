import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const POST = withAuth(async ({ request, user }) => {
  // initialze the pool client variable
  let client: PoolClient | undefined;

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
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, 'Not Assigned')
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
