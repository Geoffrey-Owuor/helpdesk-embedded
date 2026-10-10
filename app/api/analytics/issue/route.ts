import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";
import { ISSUE_DETAIL_SELECT } from "@/lib/issues/issueDetailQuery";

export const GET = withAuth(async ({ user, request }) => {
  if (!hasFeatureAccess(user, FEATURES.ANALYTICS)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const uuid = searchParams.get("uuid");

  if (!uuid) {
    return NextResponse.json({ message: "Missing uuid" }, { status: 400 });
  }

  try {
    const result = await query(
      `${ISSUE_DETAIL_SELECT} WHERE a.issue_uuid = $1`,
      [uuid],
    );

    if (result.length === 0) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Error retrieving analytics issue data", error);
    return NextResponse.json(
      { message: "Error retrieving the analytics issue data" },
      { status: 500 },
    );
  }
});
