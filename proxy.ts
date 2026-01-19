import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireSession } from "./lib/Auth";
import { generateUserRoute } from "./utils/Validators";

export async function proxy(request: NextRequest) {
  const user = await requireSession();

  if (user) {
    const generatedUserRoute = generateUserRoute(user.username);

    return NextResponse.redirect(
      new URL(`/${generatedUserRoute}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  //middleware will only run in this paths
  matcher: ["/login", "/register", "/forgot-password", "/reset-password"],
};
