// Shared server side permission helpers for acting on a single issue.
// Kept here so every route gates the same way instead of re-implementing
// the "assigned agent OR department admin OR super" check inline.
import { query } from "@/lib/Db";
import { AuthJWTPayload } from "@/lib/Auth";
import { PoolClient } from "pg";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";
import { isUuid } from "@/lib/isUuid";

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

// Admins of the issue's target department and super admins triage the issue:
// reassigning it, changing its priority and changing its type.
export const canTriageIssue = (
  user: AuthJWTPayload,
  issue: Pick<IssueAccessRow, "issue_target_department">,
): boolean =>
  user.isSuper ||
  (user.role === "admin" && issue.issue_target_department === user.department);

// The submitter, plus everyone who can triage it, can edit the issue's title
// and description.
export const canEditIssueDetails = (
  user: AuthJWTPayload,
  issue: Pick<IssueAccessRow, "issue_target_department"> & {
    issue_submitter_id: string;
  },
): boolean =>
  String(issue.issue_submitter_id) === String(user.userId) ||
  canTriageIssue(user, issue);

// Every issue this user can open, regardless of the issue lists' "my
// submissions"/"all departments" toggles - those choose which slice a list
// shows, not what the user may see. Super admins see everything (null clause).
export const buildIssueAccessClause = (
  user: AuthJWTPayload,
  tableAlias = "a",
  startParamIndex = 1,
): { clause: string | null; params: (string | number)[] } => {
  const col = (name: string) => `${tableAlias}.${name}`;
  const { role, userId, email, department, isSuper } = user;

  if (isSuper) return { clause: null, params: [] };

  const submitter = `${col("issue_submitter_id")} = $${startParamIndex}`;

  if (role === "admin") {
    return {
      clause: `(${submitter} OR ${col("issue_target_department")} = $${startParamIndex + 1})`,
      params: [userId, department],
    };
  }

  if (role === "agent") {
    const emailParam = `$${startParamIndex + 1}`;
    return {
      clause: `(${submitter}
        OR ${col("issue_agent_email")} = ${emailParam}
        OR EXISTS (
          SELECT 1 FROM issue_collaborators ic
          WHERE ic.issue_id = ${col("issue_uuid")}
          AND ic.collaborator_email = ${emailParam}
        ))`,
      params: [userId, email],
    };
  }

  return { clause: submitter, params: [userId] };
};

// Can this user see this issue? Analytics viewers can read any issue through
// the analytics pages, so read-only routes those pages use pass
// allowAnalytics; routes that change the issue never do.
export const canViewIssue = async (
  uuid: string,
  user: AuthJWTPayload,
  { allowAnalytics = false }: { allowAnalytics?: boolean } = {},
): Promise<boolean> => {
  if (!isUuid(uuid)) return false;

  // Analytics viewers only need the issue to exist
  const { clause, params } =
    allowAnalytics && hasFeatureAccess(user, FEATURES.ANALYTICS)
      ? { clause: null, params: [] }
      : buildIssueAccessClause(user, "a", 2);

  const rows = await query(
    `SELECT 1 FROM issues_table a WHERE a.issue_uuid = $1
     ${clause ? `AND ${clause}` : ""} LIMIT 1`,
    [uuid, ...params],
  );

  return rows.length > 0;
};
