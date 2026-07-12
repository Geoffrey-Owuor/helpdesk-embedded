import { MicrosoftEntraId } from "arctic";
import { cookies } from "next/headers";
import { createSession } from "@/lib/Auth";
import {
  signAccessToken,
  signRefreshToken,
  hashRefreshToken,
} from "@/lib/Auth";
import { query } from "@/lib/Db";
import { getRequestOrigin } from "@/lib/getRequestOrigin";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
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
  const isPopup = cookieStore.get("oauth_is_popup")?.value === "true";

  const handleRedirect = (targetPath: string) => {
    if (isPopup) {
      return new Response(
        `<!DOCTYPE html>
      <html>
        <head><title>Authenticating...</title></head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                { type: "AUTH_SUCCESS", url: "${targetPath}" }, 
                window.location.origin
              );
              window.close();
            } else {
              window.location.href = "${targetPath}";
            }
          </script>
        </body>
      </html>`,
        { headers: { "Content-Type": "text/html" } },
      );
    }
    return Response.redirect(new URL(targetPath, origin));
  };

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
      SELECT user_id, username, email, department, role, is_user_active 
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

      // Check if the user is active
      if (!returnedUser.is_user_active) {
        cookieStore.delete("oauth_is_popup");
        return handleRedirect("/login");
      }

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

      // Hash refresh token and store it in the database
      const hashedRefreshToken = await hashRefreshToken(userRefreshToken);

      const query2 = `UPDATE users 
                          SET refresh_token = $1, 
                          refresh_token_expiry = NOW() + INTERVAL '7 days'
                          WHERE email = $2`;
      const params2 = [hashedRefreshToken, returnedUser.email];

      await query(query2, params2);

      // Store user data in the secure cookie using our jose helper
      await createSession(userAccessToken, userRefreshToken);

      // Cleanup state tracking cookies
      cookieStore.delete("oauth_state");
      cookieStore.delete("oauth_code_verifier");
      cookieStore.delete("oauth_is_popup"); // Clean up new cookie
      return handleRedirect("/dashboard");
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
      cookieStore.delete("oauth_is_popup");
      return handleRedirect("/sso");
    }
  } catch (error) {
    console.error("Authentication handshake error:", error);
    return new Response("Authentication failed", { status: 500 });
  }
}
