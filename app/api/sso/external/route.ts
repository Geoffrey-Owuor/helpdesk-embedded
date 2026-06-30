import { NextResponse, NextRequest } from "next/server";
import {
  createSession,
  signAccessToken,
  signRefreshToken,
  requireSession,
} from "@/lib/Auth";
import { getRequestOrigin } from "@/lib/getRequestOrigin";
import crypto from "crypto";
import { query } from "@/lib/Db";

export async function GET(request: NextRequest) {
  const baseUrl = await getRequestOrigin(request);

  try {
    const { searchParams } = new URL(request.url);

    const email = searchParams.get("email");
    const timestamp = searchParams.get("timestamp");
    const signature = searchParams.get("signature");

    if (!email || !timestamp || !signature) {
      console.log("Some required fields are missing");
      return NextResponse.redirect(new URL("/login", baseUrl));
    }

    // 1. Prevent Replay Attacks (link expires in 2 minutes - 120000 milliseconds)
    // To cater for second differences between hosting servers
    const now = Date.now();
    const timeDiff = now - parseInt(timestamp, 10);
    if (timeDiff > 120000 || timeDiff < 0) {
      console.log("There is a timestamp difference");
      return NextResponse.redirect(new URL("/login", baseUrl));
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
      return NextResponse.redirect(new URL("/login", baseUrl));
    }

    // If there is already a valid session of the user available,
    // redirect directly to their dashboard
    const existingUser = await requireSession();
    if (existingUser?.email)
      return NextResponse.redirect(new URL("/dashboard", baseUrl));

    const user = await query(
      `
        SELECT user_id, username, email, department, role FROM users WHERE email = $1 LIMIT 1
        `,
      [email],
    );

    // No user found
    if (user.length === 0) {
      return NextResponse.redirect(new URL("/login", baseUrl));
    }

    // User exists assign the user object
    const userObject = user[0];

    // Check if user is a super admin
    const superAdmin = await query(
      `
       SELECT super_admin_id FROM super_admins 
       WHERE super_admin_id = $1 LIMIT 1
      `,
      [userObject.user_id],
    );

    const isSuper = superAdmin.length > 0;

    // The required payload
    const userPayload = {
      userId: userObject.user_id,
      username: userObject.username,
      role: userObject.role,
      department: userObject.department,
      email: userObject.email,
      isSuper: isSuper,
    };

    // Tokens
    const accessToken = await signAccessToken(userPayload);
    const refreshToken = await signRefreshToken(userPayload);

    //Create the user session
    await createSession(accessToken, refreshToken);

    // Success: redirect the user to their dashboard
    return NextResponse.redirect(new URL("/dashboard", baseUrl));
  } catch (error) {
    console.error(
      "Error while trying to create the user issueDesk sso session:",
      error,
    );
    return NextResponse.redirect(new URL("/login", baseUrl));
  }
}
