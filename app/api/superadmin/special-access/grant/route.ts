import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";
import { FEATURES } from "@/lib/FeatureAccess";

export const POST = withAuth(async ({ user, request }) => {
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { userId, feature } = await request.json();

    if (!userId || !feature) {
      return NextResponse.json(
        { message: "User and feature are required" },
        { status: 400 },
      );
    }

    if (!Object.values(FEATURES).includes(feature)) {
      return NextResponse.json(
        { message: "Unrecognized feature" },
        { status: 400 },
      );
    }

    // Check for an existing grant
    const existingGrant = await query(
      `SELECT id FROM special_access WHERE user_id = $1 AND feature = $2 LIMIT 1`,
      [userId, feature],
    );

    if (existingGrant.length > 0) {
      return NextResponse.json(
        { message: "This user already has access to this feature" },
        { status: 409 },
      );
    }

    await query(
      `INSERT INTO special_access (user_id, feature, granted_by) VALUES ($1, $2, $3)`,
      [userId, feature, user.userId],
    );

    return NextResponse.json(
      { message: "Access granted successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error while trying to grant special access", error);
    return NextResponse.json(
      { message: "An error occurred while granting access" },
      { status: 500 },
    );
  }
});
