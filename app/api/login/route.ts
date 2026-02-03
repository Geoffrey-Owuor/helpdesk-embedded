import { query } from "@/lib/Db";
import {
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  hashRefreshToken,
} from "@/lib/Auth";
import { createSession } from "@/lib/Auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Find user by email
    const query1 = `SELECT user_id, email, password, username, department, role
                    FROM users
                    WHERE email = $1 LIMIT 1`;
    const params1 = [email];
    const result1 = await query(query1, params1);

    if (!result1.length) {
      return NextResponse.json(
        { message: "wrong email or password" },
        { status: 401 },
      );
    }

    // Assign result to user
    const user = result1[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Wrong email or password" },
        { status: 401 },
      );
    }

    // Define the payload
    const payload = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
      department: user.department,
      email: user.email,
    };
    //Generate access tokens
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // Hash refresh token and store it in the database
    const hashedRefreshToken = await hashRefreshToken(refreshToken);

    const query2 = `UPDATE users 
                    SET refresh_token = $1, 
                    refresh_token_expiry = NOW() + INTERVAL '7 days'
                    WHERE email = $2`;
    const params2 = [hashedRefreshToken, email];

    await query(query2, params2);

    // Create a session with the tokens
    await createSession(accessToken, refreshToken);

    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Server Error, Please Try Again" },
      { status: 500 },
    );
  }
}
