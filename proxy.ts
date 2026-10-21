import { NextResponse, NextRequest } from "next/server";
import { requireSession } from "./lib/Auth";

const authPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// nextUrl keeps the basePath, so the redirect target only needs the app path
const redirectTo = (request: NextRequest, pathname: string) => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl; // stripped of basePath — fine as-is

  const user = await requireSession();

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const response = redirectTo(request, "/login");
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  if (authPaths.includes(pathname)) {
    if (user) {
      return redirectTo(request, "/dashboard");
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
