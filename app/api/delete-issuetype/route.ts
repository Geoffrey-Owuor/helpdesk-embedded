import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { revalidateIssueAgentTags } from "@/lib/userAccounts";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";

export const DELETE = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  const { role, department } = user;

  // User must be an admin
  if (role !== "admin") {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  // try catch area
  try {
    const body = await request.json();
    const { issueType } = body;

    // Check if we have our sent payload
    if (!issueType) {
      return NextResponse.json(
        { message: "Missing required issue type payload" },
        { status: 400 },
      );
    }

    // Get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Check if we have the issue type in our mapping, in the admin's department
    const { rows } = await client.query(
      `SELECT m.id FROM issues_mapping AS m
        JOIN users AS admins ON admins.user_id = m.admin_id
        WHERE m.issue_type = $1 AND admins.department = $2
        FOR UPDATE OF m
        `,
      [issueType, department],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected issue type not found in your department" },
        { status: 404 },
      );
    }

    // Issue is there, we perform our deletion
    await client.query(
      `DELETE FROM issues_mapping
        WHERE id = $1
        `,
      [rows[0].id],
    );

    // commit the transaction
    await client.query("COMMIT");

    // revalidate issues info related data
    revalidateIssueAgentTags();

    // return a response
    return NextResponse.json(
      { message: "Issue type deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while deleting the issue type:", error);
    return NextResponse.json(
      { message: "An error occured while trying to delete the issue type" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
