import { query } from "@/lib/Db";
import { validateHotpointEmail } from "@/utils/Validators";
import crypto from "crypto";
import { sendEmail } from "@/services/EmailService";
import ResendLinkTemplate from "@/templates/ResendLinkTemplate";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Check if it is a hotpoint email
    if (!validateHotpointEmail(email)) {
      return NextResponse.json(
        { message: "Unauthorized domain. Please use a Hotpoint email." },
        { status: 403 },
      );
    }

    // Check if the email exists in our users database
    const emailExists = await query(
      `
        SELECT user_id FROM users
        WHERE email = $1
        `,
      [email],
    );

    // email has not been found
    if (emailExists.length === 0) {
      return NextResponse.json({
        message: "If an account exists, a reset link has been sent",
      });
    }

    //Get the user_id and generate a random uuid token
    const userId = emailExists[0].user_id;
    const token = crypto.randomUUID();

    // Update the users table with the generated token
    await query(
      `
        UPDATE users
        SET reset_token = $1, 
        reset_token_expiry = NOW() + INTERVAL '10 minutes'
        WHERE user_id = $2
        `,
      [token, userId],
    );

    //Send the reset link email
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
    const emailHtml = ResendLinkTemplate(resetLink);

    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: emailHtml,
    });

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
