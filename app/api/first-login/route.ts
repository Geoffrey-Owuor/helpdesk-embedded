import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { hashPassword, verifyPassword } from "@/lib/Auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  let client: PoolClient | undefined;

  try {
    const { token, previousPassword, newPassword } = await request.json();

    client = await pool.connect();

    await client.query("BEGIN");

    // verify the token
    const { rows: verifyToken } = await client.query(
      `
            SELECT user_id, password FROM users
            WHERE reset_token = $1
            `,
      [token],
    );

    if (verifyToken.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message:
            "Provided reset token is invalid, please request a new one or contact your admin",
        },
        { status: 400 },
      );
    }

    // Get the user id and password
    // Get user id and password
    const userId = verifyToken[0].user_id;
    const oldPassword = verifyToken[0].password;

    // Prevent re-use of the old password
    const isSameAsCurrent = await verifyPassword(previousPassword, oldPassword);

    if (!isSameAsCurrent) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message: "Previous password seems to be incorrect, please try again",
        },
        { status: 400 },
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password and clear the token
    await client.query(
      `
        UPDATE users
        SET password = $1,
        reset_token = NULL,
        reset_token_expiry = NULL
        WHERE user_id = $2
        `,
      [hashedPassword, userId],
    );

    await client.query("COMMIT");

    return NextResponse.json(
      { message: "Your password has been updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Password reset error", error);
    return NextResponse.json(
      { message: "Error while trying to update your password" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
}
