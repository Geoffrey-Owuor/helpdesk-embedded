import { query } from "@/lib/Db";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/Auth";
import { cookies } from "next/headers";
import {
  signRefreshToken,
  signAccessToken,
  hashRefreshToken,
  hashPassword,
} from "@/lib/Auth";

export async function POST(request: Request) {
  // strict client typing
  let client: PoolClient | undefined;
  try {
    const { email, name, password, department } = await request.json();

    // Check if email is still verified (code verification has not expired)
    const verified = await query(
      `SELECT id FROM verification_codes
       WHERE email = $1 AND verified = TRUE AND expires_at > NOW()`,
      [email],
    );

    if (verified.length === 0) {
      return NextResponse.json(
        { message: "You took too long, please register again" },
        { status: 400 },
      );
    }

    // Get the user's hashed password
    const hashedPassword = await hashPassword(password);

    // Code is still valid, start the registration process
    // Get a dedicated client from the pool
    client = await pool.connect();

    // Start the transaction
    await client.query("BEGIN");

    // Create the user
    const result = await client.query(
      `
        INSERT INTO users(username, email, department, password, role)
        VALUES ($1, $2, $3, $4, 'user')
        RETURNING user_id, role
        `,
      [name, email, department, hashedPassword],
    );

    // Get the user id and role
    const userId = result.rows[0].user_id;
    const role = result.rows[0].role;

    // Define the payload
    const payload = {
      userId: userId,
      username: name,
      role: role,
      department: department,
      email: email,
    };

    //Generate access and refresh tokens
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // Hash refresh token to store it in the database
    const hashedRefreshToken = await hashRefreshToken(refreshToken);

    // The query for storing the refresh token
    await client.query(
      `
        UPDATE users
        SET refresh_token = $1, 
        refresh_token_expiry = NOW() + INTERVAL '7 days'
        WHERE email = $2
        `,
      [hashedRefreshToken, email],
    );

    // Clean up the verification code
    await client.query(
      `
        DELETE FROM verification_codes
        WHERE email = $1
        `,
      [email],
    );

    // Commit the transaction to the db
    await client.query("COMMIT");

    // Create a session using the tokens
    await createSession(accessToken, refreshToken);

    // Delete the verify-email cookie sinces it is no longer needed
    const cookieStore = await cookies();
    cookieStore.delete("verify_email");

    return NextResponse.json(
      { message: "Registration completed successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Error while completing the registration", error);

    return NextResponse.json(
      { message: "Error while trying to complete your registration" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
}
