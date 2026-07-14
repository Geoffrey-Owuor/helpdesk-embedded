import { NextResponse, NextRequest } from "next/server";
import { requireSession } from "./lib/Auth";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const authPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl; // stripped of basePath — fine as-is

  const user = await requireSession();

  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const response = NextResponse.redirect(
        new URL(`${BASE_PATH}/login`, request.url),
      );
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  if (authPaths.includes(pathname)) {
    if (user) {
      return NextResponse.redirect(
        new URL(`${BASE_PATH}/dashboard`, request.url),
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
