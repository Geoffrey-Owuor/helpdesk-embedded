import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { sendPasswordResetLink } from "@/lib/passwordReset";

// Emails a user the same reset link the forgot-password form sends, so a
// super admin can get them back in without knowing their password
export const POST = withAuth(async ({ request, user }) => {
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "Selected user id could not be found" },
        { status: 400 },
      );
    }

    const rows = await query(
      `SELECT email, is_user_active FROM users WHERE user_id = $1`,
      [userId],
    );

    if (rows.length === 0 || rows[0].email.startsWith("deleted_")) {
      return NextResponse.json(
        { message: "Selected user not found" },
        { status: 404 },
      );
    }

    if (!rows[0].is_user_active) {
      return NextResponse.json(
        {
          message:
            "The account is deactivated, activate it before sending a reset link",
        },
        { status: 409 },
      );
    }

    const { success } = await sendPasswordResetLink(userId, rows[0].email);

    if (!success) {
      return NextResponse.json(
        { message: "The reset link email could not be sent, try again" },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { message: `Reset link sent to ${rows[0].email}` },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to send a reset link:", error);
    return NextResponse.json(
      { message: "Error while trying to send the reset link" },
      { status: 500 },
    );
  }
});
