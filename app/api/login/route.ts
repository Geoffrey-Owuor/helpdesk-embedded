import { query } from "@/lib/Db";
import {
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  hashRefreshToken,
} from "@/lib/Auth";
import { createSession } from "@/lib/Auth";
import { getUserPrivileges } from "@/lib/UserPrivileges";
import { MAX_LOGIN_ATTEMPTS } from "@/lib/AuthConstants";
import { NextRequest, NextResponse } from "next/server";

const LOCKED_ACCOUNT_MESSAGE =
  "Your account is locked after too many failed attempts. Reset your password to unlock it, or contact the administrator";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 1. Find user by email
    const query1 = `SELECT user_id, email, password, username, department, role, is_user_active, password_attempts, locked_at
                    FROM users
                    WHERE email = $1 LIMIT 1`;
    const params1 = [email];
    const result1 = await query(query1, params1);

    if (!result1.length) {
      return NextResponse.json(
        { message: "Wrong email or password" },
        { status: 401 },
      );
    }

    // Assign result to user
    const user = result1[0];

    // 2. User account is inactive/disabled check
    const isActive = user.is_user_active;

    if (!isActive) {
      return NextResponse.json(
        { message: "Account is disabled, contact the administrator" },
        { status: 403 },
      );
    }

    // 3. Locked after too many failed attempts - a password reset (or a
    // super admin) unlocks it. Checked before the password so a locked
    // account can't keep being guessed at.
    if (user.locked_at) {
      return NextResponse.json(
        { message: LOCKED_ACCOUNT_MESSAGE, locked: true },
        { status: 423 },
      );
    }

    // 4. Verify password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      const newAttempts = (user.password_attempts || 0) + 1;

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Lock the account (it stays active) and update total attempts
        const lockQuery = `UPDATE users
                           SET password_attempts = $1, locked_at = NOW()
                           WHERE user_id = $2`;
        await query(lockQuery, [newAttempts, user.user_id]);

        return NextResponse.json(
          { message: LOCKED_ACCOUNT_MESSAGE, locked: true },
          { status: 423 },
        );
      } else {
        // Increment the counter only
        const incrementQuery = `UPDATE users
                                SET password_attempts = $1
                                WHERE user_id = $2`;
        await query(incrementQuery, [newAttempts, user.user_id]);

        return NextResponse.json(
          {
            message: "Wrong email or password.",
            remainingAttempts: MAX_LOGIN_ATTEMPTS - newAttempts,
          },
          { status: 401 },
        );
      }
    }

    // 5. Check for elevated/special privileges (super admin, feature grants)
    const { isSuper, specialAccess } = await getUserPrivileges(user.user_id);

    // Define the payload
    const payload = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
      department: user.department,
      email: user.email,
      isSuper,
      specialAccess,
    };

    // Generate access tokens
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // Hash refresh token and store it in the database
    const hashedRefreshToken = await hashRefreshToken(refreshToken);

    // 6. SUCCESS: Update tokens AND reset password_attempts back to 0
    const query2 = `UPDATE users 
                    SET refresh_token = $1, 
                        refresh_token_expiry = NOW() + INTERVAL '7 days',
                        password_attempts = 0
                    WHERE email = $2`;
    const params2 = [hashedRefreshToken, email];

    await query(query2, params2);

    // Create a session with the tokens
    await createSession(accessToken, refreshToken);

    return NextResponse.json(
      { message: "Login successful", id: user.user_id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Server Error, Please Try Again" },
      { status: 500 },
    );
  }
}
