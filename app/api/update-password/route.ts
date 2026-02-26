import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { pool } from "@/lib/Db";
import { verifyPassword, hashPassword } from "@/lib/Auth";
import { PoolClient } from "pg";

export const PUT = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  // get user's id
  const { userId } = user;

  try {
    const { previousPassword, newPassword, confirmNewPassword } =
      await request.json();

    // Making sure all required payload is available
    if (!previousPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json(
        { message: "Missing some required form data" },
        { status: 400 },
      );
    }

    // Making sure new password and confirmation password are the same
    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { message: "New password and confirmation password do not match" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    //begin a transaction
    await client.query("BEGIN");

    // get the user's previous password
    const { rows: userPassword } = await client.query(
      `
            SELECT password FROM users
            WHERE user_id = $1 FOR UPDATE
            `,
      [userId],
    );

    // User not found
    if (userPassword.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify current password is correct
    const currentPassword = userPassword[0].password;

    const isValid = await verifyPassword(previousPassword, currentPassword);

    if (!isValid) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Previous password is incorrect" },
        { status: 400 },
      );
    }

    // Check if the new password provided is same as the current password
    const isSameAsCurrent = await verifyPassword(newPassword, currentPassword);

    if (isSameAsCurrent) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "New password same as your current password" },
        { status: 400 },
      );
    }

    // All checks have passed, hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update query
    await client.query(
      `
        UPDATE users
        SET password = $1
        WHERE user_id = $2
        `,
      [hashedNewPassword, userId],
    );

    // Commit the transaction
    await client.query("COMMIT");

    // Return a response
    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to update password:", error);

    return NextResponse.json(
      { message: "An error occurred while trying to update password" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
