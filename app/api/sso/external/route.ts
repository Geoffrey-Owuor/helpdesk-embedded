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

    // 1. Prevent Replay Attacks (link expires in 2 minutes - 120000 milliseconds)
    // To cater for second differences between hosting servers
    const now = Date.now();
    const timeDiff = now - parseInt(timestamp, 10);
    if (timeDiff > 120000 || timeDiff < 0) {
      console.log("There is a timestamp difference");
      return NextResponse.redirect(new URL(`${basePath}/login`, baseUrl));
    }

    // 2. Recreate the signature using the shared secret
    const secret = process.env.SSO_SHARED_SECRET!;
    const dataToSign = `${email}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(dataToSign)
      .digest("hex");

    // 3. Compare signatures
    if (signature !== expectedSignature) {
      console.log("Signatures are not matching");
      return NextResponse.redirect(new URL(`${basePath}/login`, baseUrl));
    }

    // If there is already a valid session of the user available,
    // redirect directly to their dashboard
    const existingUser = await requireSession();
    if (existingUser?.email)
      return NextResponse.redirect(new URL(`${basePath}/dashboard`, baseUrl));

    const user = await query(
      `
        SELECT user_id, username, email, department, role, is_user_active FROM users WHERE email = $1 LIMIT 1
        `,
      [email],
    );

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
