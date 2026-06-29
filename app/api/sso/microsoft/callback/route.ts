import { MicrosoftEntraId } from "arctic";
import { cookies } from "next/headers";
import { createSession } from "@/lib/Auth";
import { signAccessToken, signRefreshToken } from "@/lib/Auth";
import { query } from "@/lib/Db";
import { getRequestOrigin } from "@/lib/getRequestOrigin";

export async function GET(req: Request) {
  const origin = await getRequestOrigin(req);
  const dynamicRedirectURI = `${origin}/api/sso/microsoft/callback`;

  const entraId = new MicrosoftEntraId(
    process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID!,
    process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
    dynamicRedirectURI,
  );

  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const storedCodeVerifier = cookieStore.get("oauth_code_verifier")?.value;

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response("Invalid OAuth state pairing", { status: 400 });
  }

  try {
    const tokens = await entraId.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );

    // Fallback checks for handling across Arctic version updates safely
    const accessToken =
      typeof tokens.accessToken === "function"
        ? tokens.accessToken()
        : tokens.accessToken;

    const response = await fetch("https://graph.microsoft.com/oidc/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const profile = await response.json();

    // Query the user from our database
    const baseQuery = `
      SELECT user_id, username, email, department, role 
      FROM users WHERE email = $1 LIMIT 1
    `;

    // Super admin query
    const superAdminQuery = `
      SELECT super_admin_id FROM super_admins 
      WHERE super_admin_id = $1 LIMIT 1
    `;

    const user = await query(baseQuery, [profile.email]);

    if (user.length > 0) {
      const returnedUser = user[0];

      const superAdmin = await query(superAdminQuery, [returnedUser.user_id]);

      const isSuper = superAdmin.length > 0;

      //  Creating our payload
      const payload = {
        userId: returnedUser.user_id,
        username: returnedUser.username,
        role: returnedUser.role,
        department: returnedUser.department,
        email: returnedUser.email,
        isSuper: isSuper,
      };

      //Generate access tokens
      const userAccessToken = await signAccessToken(payload);
      const userRefreshToken = await signRefreshToken(payload);

      // Store user data in the secure cookie using our jose helper
      await createSession(userAccessToken, userRefreshToken);

      // Cleanup state tracking cookies
      cookieStore.delete("oauth_state");
      cookieStore.delete("oauth_code_verifier");

      return Response.redirect(new URL("/dashboard", origin));
    } else {
      // 1. Create a short-lived temporary payload
      const tempPayload = {
        userId: "some_random_id",
        username: profile.name,
        role: "user",
        department: "no_department",
        email: profile.email,
        isSuper: false,
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
      return Response.redirect(new URL("/sso", origin));
    }
  } catch (error) {
    console.error("Authentication handshake error:", error);
    return new Response("Authentication failed", { status: 500 });
  }
}
