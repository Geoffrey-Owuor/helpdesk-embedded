import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import VerificationCodeTemplate from "@/templates/VerificationCodeTemplate";
import { sendEmail } from "@/services/EmailService";
import crypto from "crypto";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Checking if the email is already registered
    const baseQuery = `SELECT user_id FROM users WHERE email = $1`;
    const queryParams = [email];

    const result = await query(baseQuery, queryParams);

    if (result.length > 0) {
      return NextResponse.json(
        {
          message:
            "We couldn't verify your email. Try another email or sign in.",
        },
        { status: 409 },
      );
    }

    // Generate a 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();

    // Store or update the verification code
    const verificationCodeQuery = `
           INSERT INTO verification_codes (email, code, expires_at)
           VALUES ($1, $2, NOW() + INTERVAL '10 minutes')
           ON CONFLICT (email)
           DO UPDATE SET
            code = excluded.code,
            expires_at = excluded.expires_at
           `;
    const verificationCodeParams = [email, code];

    // Execute the query
    await query(verificationCodeQuery, verificationCodeParams);

    // Sign the JWT
    const secret = new TextEncoder().encode(process.env.AUTH_TOKEN_SECRET);
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("10m")
      .sign(secret);

    //Stote in a HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("verify_email", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/register",
      maxAge: 600, // 10 Minutes
    });

    // Send verification email

    const emailHtml = VerificationCodeTemplate(code);

    await sendEmail({
      to: email,
      subject: "Verify Your Email Address",
      html: emailHtml,
    });

    return NextResponse.json(
      { message: "Verification code has been sent to your email" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { message: "Failed to send a verification code" },
      { status: 500 },
    );
  }
}
