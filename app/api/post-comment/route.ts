import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { emailSender } from "@/services/EmailSender";
import { canViewIssue } from "@/lib/IssueAccess";

export const POST = withAuth(async ({ request, user }) => {
  try {
    const { uuid, comment } = await request.json();
    const { userId, username, email } = user;

    // Only those who can see the issue may comment on it - a 404 either way so we
    // don't leak which uuids exist
    if (!(await canViewIssue(uuid, user))) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    // Getting issue reference id
    const result = await query(
      `
      SELECT issue_reference_id FROM issues_table
      WHERE issue_uuid = $1 LIMIT 1
      `,
      [uuid],
    );

    const referenceNumber = result[0].issue_reference_id;

    // Our base query
    const baseQuery = `INSERT INTO comments
                       (issue_uuid, comment_submitter_id, comment_submitter_name, comment_submitter_email, comment_description)
                       VALUES
                       ($1, $2, $3, $4, $5)`;

    const queryParams = [uuid, userId, username, email, comment];

    // Run the query
    await query(baseQuery, queryParams);

    // A comment from support (not the submitter) is the issue's first response
    // if nothing came before it - the SLA response target measures this
    await query(
      `
      UPDATE issues_table i
      SET issue_first_response_at = CURRENT_TIMESTAMP
      WHERE i.issue_uuid = $1
        AND i.issue_first_response_at IS NULL
        AND i.issue_submitter_id <> $2
        AND (
          i.issue_agent_id = $2
          OR $3 IN ('agent', 'admin')
          OR EXISTS (SELECT 1 FROM issue_collaborators col
                     WHERE col.issue_id = i.issue_uuid AND col.collaborator_id = $2)
        )
      `,
      [uuid, userId, user.role],
    );

    // EMAIL SERVICE
    const title = `New Comment Raised on Issue ${referenceNumber}`;
    const description = `A new comment has been raised by ${username} on ${referenceNumber}`;

    // Fire and forget - Calling the email sender service
    emailSender({ title, description, uuid, comment, author: username });

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
