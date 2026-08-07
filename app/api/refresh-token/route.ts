import { query } from "@/lib/Db";
import {
  verifyRefreshTokenJWT,
  signAccessToken,
  signRefreshToken,
  hashRefreshToken,
} from "@/lib/Auth";
import { createSession } from "@/lib/Auth";
import { getUserPrivileges } from "@/lib/UserPrivileges";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "No refresh token" }, { status: 401 });
  }

  try {
    // Verify jwt signature of the refresh token
    const payload = await verifyRefreshTokenJWT(refreshToken);

    // If payload is empty or invalid
    if (!payload || !payload.userId) {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");

      console.log("Token is invalid");

      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    //Checked against the database stored token to ensure it has not been revoked/replaced
    const dbQuery = `SELECT user_id, username, email, role, department, refresh_token, is_user_active FROM users WHERE user_id = $1`;
    const rows = await query(dbQuery, [payload.userId]);

    if (rows.length === 0) {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      console.log("User is not found in the database");
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    // Check if user is an active user
    const isUserActive = rows[0].is_user_active;

    if (!isUserActive) {
      return NextResponse.json(
        { message: "User account is disabled" },
        { status: 401 },
      );
    }

    // Get the required cookie information
    const hashedToken = rows[0].refresh_token;
    const userId = rows[0].user_id;
    const email = rows[0].email;
    const username = rows[0].username;
    const role = rows[0].role;
    const department = rows[0].department;

    if (!hashedToken) {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
      console.log("Previous token not found for user:", email);
      return NextResponse.json({ message: "Token not found" }, { status: 401 });
    }

    // Check for elevated/special privileges (super admin, feature grants)
    const { isSuper, specialAccess } = await getUserPrivileges(userId);

    // Generate new tokens
    const newPayload = {
      userId,
      email,
      username,
      role,
      department,
      isSuper,
      specialAccess,
    };

    const newAccessToken = await signAccessToken(newPayload);
    const newRefreshToken = await signRefreshToken(newPayload);

    // Update db with new refresh token hash
    const newHashedRT = await hashRefreshToken(newRefreshToken);

    const query2 = `UPDATE users 
                        SET refresh_token = $1, 
                        refresh_token_expiry = NOW() + INTERVAL '7 days'
                        WHERE user_id = $2`;
    await query(query2, [newHashedRT, userId]);

    // Create new session with the new tokens
    await createSession(newAccessToken, newRefreshToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Token refresh error:", error);
    // Failure when trying to run the refresh token
    return NextResponse.json(
      { message: "Refresh token verification failed" },
      { status: 503 },
    );
  }
}
