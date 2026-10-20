import { query } from "@/lib/Db";
import { validateHotpointEmail } from "@/utils/Validators";
import { sendPasswordResetLink } from "@/lib/passwordReset";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Check if it is a hotpoint email
    if (!validateHotpointEmail(email)) {
      return NextResponse.json(
        { message: "Unauthorized domain. Please use a Hotpoint email." },
        { status: 403 },
      );
    }

    // Check if the email belongs to an active account - a disabled one can't
    // sign in after a reset anyway. A locked one can: the reset unlocks it.
    const emailExists = await query(
      `
        SELECT user_id FROM users
        WHERE email = $1 AND is_user_active = TRUE
        `,
      [email],
    );

    // email has not been found
    if (emailExists.length === 0) {
      return NextResponse.json({
        message: "If an account exists, a reset link has been sent",
      });
    }

    // Generate a reset token and email the link
    await sendPasswordResetLink(emailExists[0].user_id, email);

    return NextResponse.json(
      { message: "If an account exists, a reset link has been sent" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while sending a reset link:", error);
    return NextResponse.json(
      { message: "Failed to send a reset link" },
      { status: 500 },
    );
  }
}
