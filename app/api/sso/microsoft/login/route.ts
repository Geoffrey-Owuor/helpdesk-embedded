import { MicrosoftEntraId, generateState, generateCodeVerifier } from "arctic";
import { cookies } from "next/headers";
import { getRequestOrigin } from "@/lib/getRequestOrigin";
import { NextRequest } from "next/server";
import { basePath } from "@/public/assets";

export async function GET(req: NextRequest) {
  // 1. Get the true origin via our helper
  const origin = await getRequestOrigin(req);
  const dynamicRedirectURI = `${origin}${basePath}/api/sso/microsoft/callback`;

  const requestUrl = new URL(req.url);
  const isPopup = requestUrl.searchParams.get("popup") === "true";

  // Instantiate Arctic uniquely for the current domain
  const entraId = new MicrosoftEntraId(
    process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID!,
    process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
    dynamicRedirectURI,
  );

  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const cookieStore = await cookies();

  // Set temporary tracking cookies for validation step
  cookieStore.set("oauth_state", state, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  cookieStore.set("oauth_code_verifier", codeVerifier, {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  cookieStore.set("oauth_is_popup", isPopup ? "true" : "false", {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  // FIX: Define the scopes as a flat string array
  const scopes = ["openid", "profile", "email"];

  // FIX: Removed 'await' and passed the 'scopes' array directly as the 3rd argument
  const url = entraId.createAuthorizationURL(state, codeVerifier, scopes);

  return Response.redirect(url);
}
