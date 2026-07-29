// Shared server side permission helpers for acting on a single issue.
// Kept here so every route gates the same way instead of re-implementing
// the "assigned agent OR department admin OR super" check inline.
import { query } from "@/lib/Db";
import { AuthJWTPayload } from "@/lib/Auth";
import { PoolClient } from "pg";

// The subset of an issue row the checks below need. Routes already read these
// columns when they lock the row, so they can pass what they have.
export type IssueAccessRow = {
  issue_agent_email: string | null;
  issue_target_department: string;
};

// Runs against an open transaction client when one is supplied, so a route that
// has already locked the issue row stays inside its own transaction
const runQuery = async (
  text: string,
  params: (string | number)[],
  client?: PoolClient,
) => {
  if (client) {
    const { rows } = await client.query(text, params);
    return rows;
  }
  return await query(text, params);
};

// Is this user listed as a collaborator on this issue?
export const isIssueCollaborator = async (
  uuid: string,
  email: string,
  client?: PoolClient,
): Promise<boolean> => {
  const rows = await runQuery(
    `SELECT 1 FROM issue_collaborators
     WHERE issue_id = $1 AND collaborator_email = $2 LIMIT 1`,
    [uuid, email],
    client,
  );

  return rows.length > 0;
};

// Ownership of the issue: the assigned agent, an admin of the target
// department, or a super admin. Collaborators are deliberately excluded -
// they can be invited onto an issue but cannot manage the collaborator list.
export const canManageCollaborators = (
  user: AuthJWTPayload,
  issue: IssueAccessRow,
): boolean => {
  const { email, role, department, isSuper } = user;

  return (
    issue.issue_agent_email === email ||
    isSuper ||
    (role === "admin" && issue.issue_target_department === department)
  );
};

// Everyone above, plus the invited collaborators. This is the gate for the
// actions a collaborator is allowed to perform on the issue itself.
export const canActOnIssue = async (
  uuid: string,
  user: AuthJWTPayload,
  issue: IssueAccessRow,
  client?: PoolClient,
): Promise<boolean> => {
  if (canManageCollaborators(user, issue)) return true;

  return await isIssueCollaborator(uuid, user.email, client);
};
