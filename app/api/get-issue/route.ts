import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { buildIssueAccessClause } from "@/lib/IssueAccess";
import { ISSUE_DETAIL_SELECT } from "@/lib/issues/issueDetailQuery";

export const GET = withAuth(async ({ user, request }) => {
  const uuid = request.nextUrl.searchParams.get("uuid");

  if (!uuid) {
    return NextResponse.json({ message: "Missing uuid" }, { status: 400 });
  }

  try {
    // uuid is always $1; access params (if any) continue from $2. Access is
    // everything the user can open - the issue lists' toggles don't apply here,
    // so links from notifications, search and pins always resolve.
    const { clause: accessClause, params: accessParams } =
      buildIssueAccessClause(user, "a", 2);

    const whereParts = [
      "a.issue_uuid = $1",
      ...(accessClause ? [accessClause] : []),
    ];

    const result = await query(
      `${ISSUE_DETAIL_SELECT} WHERE ${whereParts.join(" AND ")}`,
      [uuid, ...accessParams],
    );

    if (result.length === 0) {
      // Collapse "doesn't exist" and "exists but not visible to you" into one
      // response so we don't leak which uuids exist to unauthorized viewers.
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Error retrieving issue data", error);
    return NextResponse.json(
      { message: "Error retrieving the issue data" },
      { status: 500 },
    );
  }
});
