import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { IssueValueTypes } from "@/contexts/IssuesDataContext";

// Our result interface
export interface commentsQuery {
  comment_id: number;
  comment_submitter_name: string;
  comment_submitter_email: string;
  comment_description: string;
  comment_created_at: IssueValueTypes;
}

export const POST = withAuth(async ({ request }) => {
  try {
    const { uuid } = await request.json();

    // Our query
    const getQuery = `SELECT 
                        comment_id, comment_submitter_name, comment_submitter_email, comment_description, comment_created_at
                        FROM comments
                        WHERE issue_uuid = $1 ORDER BY comment_created_at DESC`;

    // Executing the query with the uuid param
    const result = await query<commentsQuery>(getQuery, [uuid]);

    // Return the result
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error retreiving issue comments data:", error);

    return NextResponse.json(
      { message: "Error retreiving issue comments data" },
      { status: 500 },
    );
  }
});
