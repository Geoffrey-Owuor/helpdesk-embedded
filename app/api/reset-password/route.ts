import { query } from "@/lib/Db";
import { hashPassword, verifyPassword } from "@/lib/Auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // verify the token
    const verifyToken = await query(
      `
            SELECT user_id, password FROM users
            WHERE reset_token = $1
            AND reset_token_expiry > NOW()
            `,
      [token],
    );

    if (verifyToken.length === 0) {
      return NextResponse.json(
        { message: "Looks like your token has expired" },
        { status: 400 },
      );
    }

    // Get user id and password
    const userId = verifyToken[0].user_id;
    const oldPassword = verifyToken[0].password;

    // Prevent re-use of the old password
    const isSameAsCurrent = await verifyPassword(password, oldPassword);

    if (isSameAsCurrent) {
      return NextResponse.json(
        { message: "New password cannot be the same as your current password" },
        { status: 400 },
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update the password and clear the token
    await query(
      `
        UPDATE users
        SET password = $1,
        reset_token = NULL,
        reset_token_expiry = NULL
        WHERE user_id = $2
        `,
      [hashedPassword, userId],
    );

    return NextResponse.json(
      { message: "Your password has been updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password reset error", error);
    return NextResponse.json(
      { message: "Error while trying to update your password" },
      { status: 500 },
    );
  }
}
