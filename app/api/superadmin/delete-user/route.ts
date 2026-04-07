import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";

export const DELETE = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { message: "Selected user id could not be found" },
      { status: 400 },
    );
  }

  try {
    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Check if the user exists
    const { rows } = await client.query(
      `SELECT email from users WHERE user_id = $1 FOR UPDATE`,
      [userId],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected user not found" },
        { status: 404 },
      );
    }

    // Check if there are some issues assigned to that specific user
    const { rows: assignedIssues } = await client.query(
      `SELECT id FROM issues_mapping WHERE $1 = ANY(ARRAY[agent_id, admin_id])`,
      [userId],
    );

    if (assignedIssues.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message:
            "Selected user has some assigned issues, reassign those issues before deleting the user",
        },
        { status: 409 },
      );
    }

    // Everything satisfied, mark user as inactive
    const userEmail = rows[0].email;
    const deletedEmail = `deleted_${userEmail}`;
    const deletedPassword = "deleted_password";

    // update query
    const updateQuery = `
    UPDATE users
    SET email = $1,
    password = $2,
    refresh_token = NULL,
    refresh_token_expiry = NULL,
    reset_token = NULL,
    is_user_active = FALSE,
    reset_token_expiry = NULL
    WHERE user_id = $3
    `;

    const updateParams = [deletedEmail, deletedPassword, userId];

    await client.query(updateQuery, updateParams);

    // Commit transaction
    await client.query("COMMIT");

    // Return a response
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to delete a user:", error);
    return NextResponse.json(
      { message: "Error while trying to delete the user" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
