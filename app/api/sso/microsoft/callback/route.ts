import { MicrosoftEntraId } from "arctic";
import { cookies } from "next/headers";
import { createSession } from "@/lib/Auth";
import {
  signAccessToken,
  signRefreshToken,
  hashRefreshToken,
} from "@/lib/Auth";
import { query } from "@/lib/Db";
import { getUserPrivileges } from "@/lib/UserPrivileges";
import { getRequestOrigin } from "@/lib/getRequestOrigin";
import { NextRequest } from "next/server";
import { basePath } from "@/lib/basePath";
import {
  afterLoginPath,
  loginPath,
  NEXT_PARAM,
  safeNextPath,
} from "@/lib/loginRedirect";
import {
  fetchMicrosoftProfile,
  isMicrosoftUnreachable,
  retryOnConnectFailure,
} from "@/lib/microsoftSso";

export async function GET(req: NextRequest) {
  const origin = await getRequestOrigin(req);
  const dynamicRedirectURI = `${origin}${basePath}/api/sso/microsoft/callback`;

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
  // The page that sent them to login (set by ../login), validated again
  const next = safeNextPath(cookieStore.get("oauth_next")?.value);

  // Back to login with an alert reason, keeping ?next= for the retry
  const loginWith = (param: string) => {
    const path = loginPath(next);
    return `${basePath}${path}${path.includes("?") ? "&" : "?"}${param}`;
  };

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
                { type: "AUTH_SUCCESS", url: ${JSON.stringify(targetPath)} }, 
                window.location.origin
              );
              window.close();
            } else {
              window.location.href = ${JSON.stringify(targetPath)};
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
    // Retried once only if the connection to Microsoft never opened - the
    // code is single-use, so anything that may have reached Microsoft isn't.
    const tokens = await retryOnConnectFailure("SSO code exchange", () =>
      entraId.validateAuthorizationCode(code, storedCodeVerifier),
    );

    // Fallback checks for handling across Arctic version updates safely
    const accessToken =
      typeof tokens.accessToken === "function"
        ? tokens.accessToken()
        : tokens.accessToken;

    const profile = await fetchMicrosoftProfile(accessToken as string);
    if (!profile.email) {
      // Without an email we can neither match an account nor pre-fill a
      // registration - never continue with an undefined email.
      console.error("Authentication handshake error: profile has no email");
      cookieStore.delete("oauth_is_popup");
      cookieStore.delete("oauth_next");
      return handleRedirect(loginWith("sso_error=failed"));
    }

    // Query the user from our database
    const baseQuery = `
      SELECT user_id, username, email, department, role, is_user_active 
      FROM users WHERE email = $1 LIMIT 1
    `;

    const user = await query(baseQuery, [profile.email]);

    if (user.length > 0) {
      const returnedUser = user[0];

      // Check if the user is active
      if (!returnedUser.is_user_active) {
        cookieStore.delete("oauth_is_popup");
        cookieStore.delete("oauth_next");
        return handleRedirect(`${basePath}/login?disabled=true`);
      }

      const { isSuper, specialAccess } = await getUserPrivileges(
        returnedUser.user_id,
      );

      //  Creating our payload
      const payload = {
        userId: returnedUser.user_id,
        username: returnedUser.username,
        role: returnedUser.role,
        department: returnedUser.department,
        email: returnedUser.email,
        isSuper,
        specialAccess,
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
      cookieStore.delete("oauth_next");
      return handleRedirect(`${basePath}${afterLoginPath(next)}`);
    } else {
      // 1. Create a short-lived temporary payload
      const tempPayload = {
        userId: "some_random_id",
        username: profile.name ?? "",
        role: "user",
        department: "no_department",
        email: profile.email,
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
      cookieStore.delete("oauth_is_popup");
      cookieStore.delete("oauth_next");
      // Registration can outlast the cookie, so the page rides in the URL
      return handleRedirect(
        `${basePath}/sso${next ? `?${new URLSearchParams({ [NEXT_PARAM]: next })}` : ""}`,
      );
    }
  } catch (error) {
    console.error("Authentication handshake error:", error);
    // Back to the login page with a reason the page turns into an alert:
    // couldn't reach Microsoft at all (network) vs. sign-in failed.
    const reason = isMicrosoftUnreachable(error) ? "unreachable" : "failed";
    cookieStore.delete("oauth_is_popup");
    cookieStore.delete("oauth_next");
    return handleRedirect(loginWith(`sso_error=${reason}`));
  }
}
