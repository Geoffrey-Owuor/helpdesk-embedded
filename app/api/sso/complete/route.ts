import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import {
  requireTemporarySession,
  signAccessToken,
  signRefreshToken,
  createSession,
  hashRefreshToken,
} from "@/lib/Auth";
import { query } from "@/lib/Db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, department } = await req.json();

    const cookieStore = await cookies();

    // Confirm if we still have a valid temporary verification cookie
    const tempUser = await requireTemporarySession();

    if (!tempUser) {
      return NextResponse.json(
        { message: "Unauthorized payload tampering" },
        { status: 403 },
      );
    }

    // 2. Insert into database (role defaults to 'user')
    const insertQuery = `
      INSERT INTO users (username, email, department, role, password) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING user_id, username, email, department, role
    `;
    const newUser = await query(insertQuery, [
      name,
      email,
      department,
      "user",
      "microsoft_sso",
    ]);
    const returnedUser = newUser[0];

    // 3. Create the standard JWT Payload
    const payload = {
      userId: returnedUser.user_id,
      username: returnedUser.username,
      role: returnedUser.role,
      department: returnedUser.department,
      email: returnedUser.email,
      isSuper: false,
    };

    // 4. Generate Tokens & Session
    const userAccessToken = await signAccessToken(payload);
    const userRefreshToken = await signRefreshToken(payload);

    // Hash refresh token and store it in the database
    const hashedRefreshToken = await hashRefreshToken(userRefreshToken);

    const query2 = `UPDATE users 
                    SET refresh_token = $1, 
                    refresh_token_expiry = NOW() + INTERVAL '7 days'
                    WHERE email = $2`;
    const params2 = [hashedRefreshToken, returnedUser.email];

    await query(query2, params2);

    await createSession(userAccessToken, userRefreshToken);

    // 5. Cleanup the temporary SSO pending cookie
    cookieStore.delete("sso_pending_registration");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("SSO Finalization Error:", error);
    return NextResponse.json(
      { message: "Could not complete your registration" },
      { status: 500 },
    );
  }
}
