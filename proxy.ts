import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "./lib/Auth";

// A simple proxy to redirect from auth pages when a valid cookie session is found

export async function proxy(request: NextRequest) {
  const user = await requireSession();

  if (user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  //middleware will only run in this paths
  matcher: ["/login", "/register", "/forgot-password", "/reset-password"],
};
