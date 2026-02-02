import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const POST = withAuth(async ({ request, user }) => {
  try {
    const { uuid, comment } = await request.json();
    const { userId, username, email } = user;

    // Our base query
    const baseQuery = `INSERT INTO comments
                       (issue_uuid, comment_submitter_id, comment_submitter_name, comment_submitter_email, comment_description)
                       VALUES
                       ($1, $2, $3, $4, $5)`;

    const queryParams = [uuid, userId, username, email, comment];

    // Run the query
    await query(baseQuery, queryParams);

    // Return a response
    return NextResponse.json(
      { message: "Comment posted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to post a comment:", error);
    return NextResponse.json(
      { message: "Error while trying to post the comment" },
      { status: 500 },
    );
  }
});
