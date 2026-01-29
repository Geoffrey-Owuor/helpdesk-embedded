import { query } from "@/lib/Db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    // verify the code query
    const verifyCodeQuery = `
        SELECT id FROM verification_codes
        WHERE email = $1 AND code = $2 AND expires_at > NOW() AND verified = FALSE
        `;
    const verifyCodeParams = [email, code];

    const result = await query(verifyCodeQuery, verifyCodeParams);

    // Code expired or does not exist
    if (result.length === 0) {
      return NextResponse.json(
        { message: "Invalid or expired verification code" },
        { status: 400 },
      );
    }

    // If exists, mark verification code as verified
    await query(
      `UPDATE verification_codes
       SET verified = TRUE
       WHERE email = $1`,
      [email],
    );

    return NextResponse.json(
      { message: "Your code has been verified successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while verifying the code:", error);
    return NextResponse.json(
      { message: "Code verification failed" },
      { status: 500 },
    );
  }
}
