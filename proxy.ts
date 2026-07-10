import { NextResponse, NextRequest } from "next/server";
import { requireSession } from "./lib/Auth";

// A simple proxy to redirect from auth pages when a valid cookie session is found
const authPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fetch session status once per request
  const user = await requireSession();

  // 1. HANDLE PROTECTED ROUTE (/dashboard)
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      // Cookie is missing or expired -> Force redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));

      // Optional: Explicitly wipe the dead cookie if requireSession doesn't
      response.cookies.delete("refreshToken");

      return response;
    }
  }

  // 2. HANDLE AUTH PAGES (Redirect logged-in users away)
  if (authPaths.includes(pathname)) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Combined matcher to watch both auth flows and the main dashboard
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/dashboard/:path*",
  ],
};
