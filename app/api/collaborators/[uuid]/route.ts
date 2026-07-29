import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { query, pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { emailSender } from "@/services/EmailSender";
import { canActOnIssue, canManageCollaborators } from "@/lib/IssueAccess";

// The most collaborators that can be invited or removed in one request
const BATCH_LIMIT = 10;

type InvitedCollaborator = {
  name: string;
  email: string;
};

// GET - The collaborator list for a single issue
export const GET = withAuth(async ({ params }) => {
  if (!params.uuid) {
    return NextResponse.json(
      { message: "No issue uuid passed" },
      { status: 400 },
    );
  }

  try {
    const baseQuery = `
      SELECT id, collaborator_id, collaborator_name, collaborator_email,
      inviter_name, inviter_email, invited_at
      FROM issue_collaborators
      WHERE issue_id = $1
      ORDER BY invited_at ASC
    `;

    const rows = await query(baseQuery, [params.uuid as string]);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching the issue collaborators:", error);
    return NextResponse.json(
      { message: "Failed to fetch the issue collaborators" },
      { status: 500 },
    );
  }
});

// POST - Invite one or more agents to collaborate on an issue
export const POST = withAuth(async ({ request, params, user }) => {
  let client: PoolClient | undefined;

  const { username, email, userId } = user;
  const uuid = params.uuid as string;

  try {
    const { collaborators } = await request.json();

    if (!uuid) {
      return NextResponse.json(
        { message: "No issue uuid passed" },
        { status: 400 },
      );
    }

    if (!Array.isArray(collaborators) || collaborators.length === 0) {
      return NextResponse.json(
        { message: "Select at least one agent to invite" },
        { status: 400 },
      );
    }

    if (collaborators.length > BATCH_LIMIT) {
      return NextResponse.json(
        { message: `You can only invite ${BATCH_LIMIT} agents at a time` },
        { status: 400 },
      );
    }

    // Unique list of the invited emails
    const invitedEmails = [
      ...new Set(
        (collaborators as InvitedCollaborator[])
          .map((collaborator) => collaborator?.email)
          .filter(Boolean),
      ),
    ];

    if (invitedEmails.length === 0) {
      return NextResponse.json(
        { message: "Missing some required information" },
        { status: 400 },
      );
    }

    // You are already on the issue
    if (invitedEmails.includes(email)) {
      return NextResponse.json(
        { message: "You cannot invite yourself to collaborate" },
        { status: 409 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Lock the issue row and read what the checks below need
    const { rows } = await client.query(
      `SELECT issue_status, issue_reference_id, issue_agent_email,
       issue_agent_name, issue_target_department
       FROM issues_table
       WHERE issue_uuid = $1 FOR UPDATE`,
      [uuid],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    const issue = rows[0];
    const referenceNumber = issue.issue_reference_id;

    // The assigned agent, a department admin, a super admin or an existing
    // collaborator can invite others onto the issue
    const isAllowed = await canActOnIssue(uuid, user, issue, client);

    if (!isAllowed) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "You are not authorized to perform this action" },
        { status: 403 },
      );
    }

    // Issue is already closed
    if (issue.issue_status === "closed") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "This issue is already marked as closed" },
        { status: 409 },
      );
    }

    // Trying to invite the agent the issue is already assigned to
    if (
      issue.issue_agent_email &&
      invitedEmails.includes(issue.issue_agent_email)
    ) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message: `${issue.issue_agent_name} is already the assigned agent for this issue`,
        },
        { status: 409 },
      );
    }

    // Only active agents/admins of the issue's target department can be invited.
    // This is the security boundary - the modal only hides the other options.
    const { rows: validAgents } = await client.query(
      `SELECT user_id, username, email FROM users
       WHERE email = ANY($1::text[]) AND is_user_active = TRUE
       AND role IN ('agent', 'admin') AND department = $2`,
      [invitedEmails, issue.issue_target_department],
    );

    if (validAgents.length !== invitedEmails.length) {
      await client.query("ROLLBACK");
      const validEmails = validAgents.map((agent) => agent.email);
      const rejected = invitedEmails.filter(
        (invitedEmail) => !validEmails.includes(invitedEmail),
      );

      return NextResponse.json(
        {
          message: `${rejected.join(", ")} cannot collaborate on this issue`,
        },
        { status: 400 },
      );
    }

    // Build the multi row insert
    const insertValues: string[] = [];
    const insertParams: string[] = [];

    validAgents.forEach((agent) => {
      const position = insertParams.length;
      insertValues.push(
        `($${position + 1}, $${position + 2}, $${position + 3}, $${position + 4}, $${position + 5}, $${position + 6}, $${position + 7})`,
      );
      insertParams.push(
        uuid,
        agent.user_id,
        agent.username,
        agent.email,
        userId,
        username,
        email,
      );
    });

    // Re-inviting an existing collaborator is a no op rather than an error
    const { rows: inserted } = await client.query(
      `INSERT INTO issue_collaborators
       (issue_id, collaborator_id, collaborator_name, collaborator_email,
       inviter_id, inviter_name, inviter_email)
       VALUES ${insertValues.join(", ")}
       ON CONFLICT (issue_id, collaborator_email) DO NOTHING
       RETURNING collaborator_name`,
      insertParams,
    );

    if (inserted.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message:
            validAgents.length === 1
              ? `${validAgents[0].username} is already a collaborator on this issue`
              : "The selected agents are already collaborators on this issue",
        },
        { status: 409 },
      );
    }

    // commit the transaction
    await client.query("COMMIT");

    // The names of the agents that were actually added
    const invitedNames = inserted
      .map((row) => row.collaborator_name)
      .join(", ");

    // EMAIL SERVICE
    const title = `Issue ${referenceNumber} - ${invitedNames} invited to collaborate`;
    const description = `${invitedNames} ${inserted.length === 1 ? "has" : "have"} been invited by ${username} to collaborate on issue ${referenceNumber}`;

    // Fire and Forget - Calling the email sender service
    emailSender({ title, description, uuid });

    // return a response
    return NextResponse.json(
      {
        message: `${invitedNames} ${inserted.length === 1 ? "is" : "are"} now collaborating on this issue`,
      },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to invite the collaborators:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});

// DELETE - Remove one or more collaborators from an issue
export const DELETE = withAuth(async ({ request, params, user }) => {
  let client: PoolClient | undefined;

  const uuid = params.uuid as string;

  try {
    const { emails } = await request.json();

    if (!uuid) {
      return NextResponse.json(
        { message: "No issue uuid passed" },
        { status: 400 },
      );
    }

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { message: "Select at least one collaborator to remove" },
        { status: 400 },
      );
    }

    if (emails.length > BATCH_LIMIT) {
      return NextResponse.json(
        {
          message: `You can only remove ${BATCH_LIMIT} collaborators at a time`,
        },
        { status: 400 },
      );
    }

    // Unique list of the emails being removed
    const removedEmails = [...new Set((emails as string[]).filter(Boolean))];

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Lock the issue row
    const { rows } = await client.query(
      `SELECT issue_reference_id, issue_agent_email, issue_target_department
       FROM issues_table
       WHERE issue_uuid = $1 FOR UPDATE`,
      [uuid],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    // Removing a collaborator is restricted to the assigned agent, a department
    // admin or a super admin. Collaborators cannot remove one another.
    if (!canManageCollaborators(user, rows[0])) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "You are not authorized to perform this action" },
        { status: 403 },
      );
    }

    const { rows: removed } = await client.query(
      `DELETE FROM issue_collaborators
       WHERE issue_id = $1 AND collaborator_email = ANY($2::text[])
       RETURNING collaborator_name`,
      [uuid, removedEmails],
    );

    if (removed.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "No matching collaborators found on this issue" },
        { status: 404 },
      );
    }

    // commit the transaction
    await client.query("COMMIT");

    const removedNames = removed.map((row) => row.collaborator_name).join(", ");

    // return a response
    return NextResponse.json(
      {
        message: `${removedNames} ${removed.length === 1 ? "is" : "are"} no longer collaborating on this issue`,
      },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to remove the collaborators:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
