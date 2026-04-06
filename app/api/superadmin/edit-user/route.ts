import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { hashPassword } from "@/lib/Auth";

export const PUT = withAuth(async ({ request, user }) => {
  let client: PoolClient | undefined;
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const {
      userId,
      name,
      email,
      role,
      department,
      status,
      password,
      confirmPassword,
    } = await request.json();

    // Check if all fields have a value
    if (
      !userId ||
      !name ||
      !email ||
      !role ||
      !department ||
      !status ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    // Check if password is same as confirmPassword
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 },
      );
    }

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
            "Selected user has some assigned issues, reassign those issues before editing the user info",
        },
        { status: 409 },
      );
    }

    // User active boolean
    const isUserActive = status === "true";
    // If everything is ok - hash the password and perform an INSERT query
    const hashedPassword = await hashPassword(password);

    // Update query
    const updateQuery = `
    UPDATE users
    SET email = $1,
    username = $2,
    role = $3,
    department = $4,
    is_user_active = $5,
    password = $6
    WHERE user_id = $7
    `;

    // The update params
    const updateParams = [
      email,
      name,
      role,
      department,
      isUserActive,
      hashedPassword,
      userId,
    ];

    // Running the query
    await client.query(updateQuery, updateParams);

    // Commit transaction
    await client.query("COMMIT");

    // Return a response
    return NextResponse.json(
      { message: "User edited successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to edit a user:", error);
    return NextResponse.json(
      { message: "Error while trying to edit the user" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
