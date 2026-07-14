import { NextRequest, NextResponse } from "next/server";
import { verifyAccessTokenJWT, AuthJWTPayload } from "../Auth";
import { checkDbHealth } from "../dbHealth";

// 1. Define what valid Params look like (No 'any' here!)
// This says: "Params is an object where keys are strings, and values are strings, arrays, or undefined."
type DefaultParams = Record<string, string | string[] | undefined>;

// 2. T now defaults to DefaultParams instead of 'any'
type RouteContext<T extends DefaultParams = DefaultParams> = {
  request: NextRequest;
  params: T;
  user: AuthJWTPayload;
};

export const withAuth = <T extends DefaultParams = DefaultParams>(
  handler: (context: RouteContext<T>) => Promise<NextResponse>,
) => {
  return async (request: NextRequest, { params }: { params: Promise<T> }) => {
    // Perform the memoized health check
    const isHealthy = await checkDbHealth();

    if (!isHealthy) {
      return NextResponse.json(
        { message: "Service Temporarily Unavailable" },
        { status: 503 },
      );
    }

    // 1. Check Auth
    const user = await verifyAccessTokenJWT();

    if (!user) {
      return NextResponse.json(
        { message: "User is not authenticated" },
        { status: 401 },
      );
    }

    // 2. Await the params Promise before passing them to the handler
    const resolvedParams = (await params) || ({} as T);

    // 2. Cast the empty object safely if params is missing
    // We use 'as T' to satisfy the compiler that {} matches the generic
    return handler({
      request,
      params: resolvedParams,
      user,
    });
  };
};
