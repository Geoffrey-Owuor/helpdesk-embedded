import { NextResponse, NextRequest } from "next/server";
import { requireSession } from "./lib/Auth";
import { afterLoginPath, loginPath, NEXT_PARAM } from "./lib/loginRedirect";

const authPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// nextUrl keeps the basePath, so the redirect target only needs the app path
// (and query) - "/login?next=..."
const redirectTo = (request: NextRequest, path: string) => {
  const url = request.nextUrl.clone();
  const target = new URL(path, url.href);
  url.pathname = target.pathname;
  url.search = target.search;
  return NextResponse.redirect(url);
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl; // stripped of basePath — fine as-is

  const user = await requireSession();

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      // Remember the page so login can come back to it
      const response = redirectTo(
        request,
        loginPath(`${pathname}${request.nextUrl.search}`),
      );
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  if (authPaths.includes(pathname)) {
    if (user) {
      // Already signed in (e.g. another tab) - go where login would have
      return redirectTo(
        request,
        afterLoginPath(request.nextUrl.searchParams.get(NEXT_PARAM)),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/dashboard/:path*",
  ],
};
