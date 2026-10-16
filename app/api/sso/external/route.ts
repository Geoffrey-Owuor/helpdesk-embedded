import { NextResponse, NextRequest } from "next/server";
import {
  createSession,
  signAccessToken,
  signRefreshToken,
  requireSession,
  hashRefreshToken,
} from "@/lib/Auth";
import { getRequestOrigin } from "@/lib/getRequestOrigin";
import { cookies } from "next/headers";
import crypto from "crypto";
import { query } from "@/lib/Db";
import { getUserPrivileges } from "@/lib/UserPrivileges";
import { basePath } from "@/public/assets";

export async function GET(request: NextRequest) {
  const baseUrl = await getRequestOrigin(request);
  const cookieStore = await cookies();

  try {
    const { searchParams } = new URL(request.url);

    const email = searchParams.get("email");
    const name = searchParams.get("name");
    const timestamp = searchParams.get("timestamp");
    const signature = searchParams.get("signature");

    if (!email || !name || !timestamp || !signature) {
      console.log("Some required fields are missing");
      return NextResponse.redirect(new URL(`${basePath}/login`, baseUrl));
    }

    // The timestamp must be epoch milliseconds. Anything else would turn
    // into NaN below, and NaN comparisons are always false - silently
    // skipping the expiry check - so reject it outright.
    if (!/^\d{13}$/.test(timestamp)) {
      console.log("Timestamp is not epoch milliseconds", { raw: timestamp });
      return NextResponse.redirect(new URL(`${basePath}/login`, baseUrl));
    }

    // 1. Prevent Replay Attacks (link expires in 2 minutes - 120000 milliseconds).
    // The timestamp comes from the embedding host's server clock, not the
    // user's device, so allow it to be up to 30s ahead of this server's
    // clock to absorb normal NTP drift between the two servers.
    const MAX_AGE_MS = 120000;
    const MAX_FUTURE_SKEW_MS = 30000;
    const now = Date.now();
    const timeDiff = now - parseInt(timestamp, 10);
    if (timeDiff > MAX_AGE_MS || timeDiff < -MAX_FUTURE_SKEW_MS) {
      // timeDiff < 0: host clock ahead of this server.
      // timeDiff > 120000: stale/reused/prefetched link, or host clock behind.
      console.log("There is a timestamp difference", {
        raw: timestamp,
        now,
        timeDiff,
        referer: request.headers.get("referer"),
        secFetchDest: request.headers.get("sec-fetch-dest"),
        purpose:
          request.headers.get("sec-purpose") || request.headers.get("purpose"),
        userAgent: request.headers.get("user-agent"),
      });
      return NextResponse.redirect(new URL(`${basePath}/login`, baseUrl));
    }

    // 2. Recreate the signature using the shared secret
    const secret = process.env.SSO_SHARED_SECRET;
    if (!secret) {
      console.error("SSO_SHARED_SECRET is not set - refusing SSO sign-in");
      return NextResponse.redirect(new URL(`${basePath}/login`, baseUrl));
    }
    // name is signed too - it seeds the pending registration for new users.
    // JSON-encoded so a ":" in any field can't shift the field boundaries.
    // Must match the host (requisitions_automation dashboard/helpdesk page).
    const dataToSign = JSON.stringify([email, name, timestamp]);
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(dataToSign)
      .digest("hex");

    // 3. Compare signatures in constant time (timingSafeEqual requires
    // equal-length buffers, so a length mismatch is a mismatch outright)
    const signatureBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      console.log("Signatures are not matching");
      return NextResponse.redirect(new URL(`${basePath}/login`, baseUrl));
    }

    const user = await query(
      `
        SELECT user_id, username, email, department, role, is_user_active FROM users WHERE email = $1 LIMIT 1
        `,
      [email],
    );

    // If there is already a valid session for this same user, redirect
    // directly to their dashboard - but only if the account is still
    // active. A stale-but-unexpired refresh token cookie for a
    // since-disabled account must not short-circuit past the
    // is_user_active check below.
    const existingUser = await requireSession();
    const isSameUser =
      !!existingUser?.email &&
      existingUser.email.toLowerCase() === email.toLowerCase();

    if (isSameUser && user[0]?.is_user_active) {
      return NextResponse.redirect(new URL(`${basePath}/dashboard`, baseUrl));
    }

    // A session for a different account (shared PC, account switch on the
    // host) must never be reused. Drop it up front so a failed sign-in or a
    // pending registration below can't leave the previous user signed in.
    if (existingUser && !isSameUser) {
      cookieStore.delete("accessToken");
      cookieStore.delete("refreshToken");
    }

    // No user found - trigger the helpdesk app to complete the sso as we already know
    // the passed email is a valid ms365 email
    if (user.length === 0) {
      // 1. Create a short-lived temporary payload
      const tempPayload = {
        userId: "some_random_id",
        username: name,
        role: "user",
        department: "no_department",
        email: email,
        isSuper: false,
        specialAccess: [],
      };

      const pendingRegistrationToken = await signAccessToken(tempPayload);

      // 3. Set a secure, temporary cookie
      cookieStore.set("sso_pending_registration", pendingRegistrationToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1 hour
        path: "/",
      });

      // 4. Redirect to the completion page
      return Response.redirect(new URL(`${basePath}/sso`, baseUrl));
    }

    // User exists assign the user object
    const userObject = user[0];

    // Check if the user is an active user
    if (!userObject.is_user_active) {
      return Response.redirect(
        new URL(`${basePath}/login?disabled=true`, baseUrl),
      );
    }

    // Check for elevated/special privileges (super admin, feature grants)
    const { isSuper, specialAccess } = await getUserPrivileges(
      userObject.user_id,
    );

    // The required payload
    const userPayload = {
      userId: userObject.user_id,
      username: userObject.username,
      role: userObject.role,
      department: userObject.department,
      email: userObject.email,
      isSuper,
      specialAccess,
    };

    // Tokens
    const accessToken = await signAccessToken(userPayload);
    const refreshToken = await signRefreshToken(userPayload);

    // Hash refresh token and store it in the database
    const hashedRefreshToken = await hashRefreshToken(refreshToken);

    const query2 = `UPDATE users 
                    SET refresh_token = $1, 
                    refresh_token_expiry = NOW() + INTERVAL '7 days'
                    WHERE email = $2`;
    const params2 = [hashedRefreshToken, userObject.email];

    await query(query2, params2);

    //Create the user session
    await createSession(accessToken, refreshToken);

    // Success: redirect the user to their dashboard
    return NextResponse.redirect(new URL(`${basePath}/dashboard`, baseUrl));
  } catch (error) {
    console.error(
      "Error while trying to create the user HelpDesk sso session:",
      error,
    );
    return NextResponse.redirect(new URL(`${basePath}/login`, baseUrl));
  }
}
