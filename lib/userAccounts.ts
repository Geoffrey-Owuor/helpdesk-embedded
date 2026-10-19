// Shared checks and writes for the super admin and admin panel routes that
// change a user's account (deactivate, delete, change role or department).
// Server side only.
import { revalidateTag } from "next/cache";
import { PoolClient } from "pg";

export type UserRole = "user" | "agent" | "admin";

export const USER_ROLES: UserRole[] = ["user", "agent", "admin"];

export const isUserRole = (role: unknown): role is UserRole =>
  USER_ROLES.includes(role as UserRole);

// An active user's id by email when they hold one of the roles (and, when
// given, belong to the department). Issue types need an agent (an agent or
// an admin) and an admin from the department they serve.
export async function findActiveStaff(
  client: PoolClient,
  email: unknown,
  roles: UserRole[],
  department?: string,
): Promise<{ userId: string; department: string } | null> {
  if (typeof email !== "string" || !email) return null;

  const { rows } = await client.query(
    `SELECT user_id AS "userId", department FROM users
     WHERE LOWER(email) = LOWER($1) AND is_user_active = TRUE
     AND role = ANY($2::text[])
     AND ($3::text IS NULL OR department = $3)
     LIMIT 1`,
    [email, roles, department ?? null],
  );
  return rows[0] ?? null;
}

// Whether another issue type already has this name (ignoring case) -
// issues store the name, so it identifies the issue type
export async function issueTypeNameTaken(
  client: PoolClient,
  issueType: string,
  exceptId: number | null = null,
): Promise<boolean> {
  const { rows } = await client.query(
    `SELECT id FROM issues_mapping
     WHERE LOWER(issue_type) = LOWER($1)
     AND ($2::int IS NULL OR id <> $2)
     LIMIT 1`,
    [issueType, exceptId],
  );
  return rows.length > 0;
}

// Renames an issue type on the issues raised to its department, so history
// and analytics follow the new name
export async function renameIssueTypeOnIssues(
  client: PoolClient,
  oldName: string,
  newName: string,
  department: string,
): Promise<void> {
  if (oldName === newName) return;
  await client.query(
    `UPDATE issues_table SET issue_type = $1
     WHERE issue_type = $2 AND issue_target_department = $3`,
    [newName, oldName, department],
  );
}

// Issue types the user is the agent or admin of (issues_mapping)
export async function countIssueMappings(
  client: PoolClient,
  userId: string,
): Promise<number> {
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS total FROM issues_mapping
     WHERE $1 IN (agent_id, admin_id)`,
    [userId],
  );
  return rows[0].total;
}

// Issues still assigned to the user that aren't resolved or closed
export async function countOpenAssignedIssues(
  client: PoolClient,
  userId: string,
): Promise<number> {
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS total FROM issues_table
     WHERE issue_agent_id = $1
     AND issue_status NOT IN ('resolved', 'closed')`,
    [userId],
  );
  return rows[0].total;
}

// Why the user can't be deactivated or deleted yet ("... reassign them",
// callers add "before ..."), or null when they can:
// issue types would route to an inactive user, and their open issues would
// be stranded
export async function accountRemovalBlocker(
  client: PoolClient,
  userId: string,
): Promise<string | null> {
  const mappings = await countIssueMappings(client, userId);
  if (mappings > 0) {
    return `The user is the agent or admin of ${mappings} issue type${mappings === 1 ? "" : "s"}, reassign ${mappings === 1 ? "it" : "them"}`;
  }

  const openIssues = await countOpenAssignedIssues(client, userId);
  if (openIssues > 0) {
    return `The user has ${openIssues} open issue${openIssues === 1 ? "" : "s"} assigned, reassign ${openIssues === 1 ? "it" : "them"}`;
  }

  return null;
}

// Soft-deletes a user: frees their email for a new account and ends their
// sessions. The timestamp keeps the freed email unique when the same address
// is deleted more than once (users.email is UNIQUE).
export async function softDeleteUser(
  client: PoolClient,
  userId: string,
  email: string,
): Promise<void> {
  await client.query(
    `UPDATE users
     SET email = $1,
     password = 'deleted_password',
     refresh_token = NULL,
     refresh_token_expiry = NULL,
     reset_token = NULL,
     reset_token_expiry = NULL,
     locked_at = NULL,
     is_user_active = FALSE
     WHERE user_id = $2`,
    [`deleted_${Date.now()}_${email}`, userId],
  );

  // Privileges don't outlive the account
  await client.query(`DELETE FROM super_admins WHERE super_admin_id = $1`, [
    userId,
  ]);
  await client.query(`DELETE FROM special_access WHERE user_id = $1`, [
    userId,
  ]);
}

// The cached agent lists and issue type lookups (serverActions/GetIssueAgents,
// serverActions/GetIssueTypes) show user names, roles and departments
export function revalidateIssueAgentTags() {
  revalidateTag("GetIssueAgents", { expire: 0 });
  revalidateTag("Issue_Types", { expire: 0 });
  revalidateTag("Issue_Agents_Mapping", { expire: 0 });
}
