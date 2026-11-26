import type { AuthJWTPayload } from "@/lib/Auth";

type PermissionUser = Pick<
  AuthJWTPayload,
  "role" | "email" | "department" | "userId" | "isSuper"
>;

// The parts of an issue the rules read - on both the issue page's detail shape
// and the issue list's rows
export type PermissionIssue = {
  issue_status: string;
  issue_target_department: string;
  issue_agent_email: string | null;
  issue_submitter_id: string;
  // Set by /get-issue when the issue was escalated away from the viewer
  viewer_is_past_agent?: boolean;
};

// What a user may do on a single issue, combining their role with the issue's
// status. The issue page and the issue list's actions both read from here so
// the rules live in one place. Mirrors lib/IssueAccess.ts, which the API routes
// enforce.
export const getIssuePermissions = (
  { role, email, department, userId, isSuper }: PermissionUser,
  issue: PermissionIssue | undefined,
  // One of the agents invited to collaborate on this issue?
  isCollaborator: boolean,
) => {
  const status = issue?.issue_status;
  const isClosed = status === "closed";
  // Resolved or closed - the issue is done being worked on
  const isFinished = status === "resolved" || isClosed;

  const isDepartmentAdmin =
    role === "admin" && issue?.issue_target_department === department;

  // The assigned agent, a department admin or a super admin own the issue -
  // they are the only ones who can remove a collaborator from it
  const canManageCollaborators =
    issue?.issue_agent_email === email || isSuper || isDepartmentAdmin;

  // Everyone above, plus the invited collaborators, can work on the issue
  const canActOnIssue = canManageCollaborators || isCollaborator;

  const permissions = {
    canManageCollaborators,
    canInvite: canActOnIssue && !isClosed,
    // Plain users can't change a status, and an issue needs an agent first
    canUpdateStatus:
      canActOnIssue &&
      !isClosed &&
      Boolean(issue?.issue_agent_email) &&
      (role !== "user" || isSuper),
    canEscalate: canActOnIssue && !isFinished,
    // Anyone who can view the issue can attach files to it
    canAddAttachment: !isClosed,
    canReopen: isFinished,
    // Reassigning and changing priority
    canTriage: (isDepartmentAdmin || isSuper) && !isFinished,
    canChangeType: (isDepartmentAdmin || isSuper) && !isClosed,
    canEditDetails:
      (userId === issue?.issue_submitter_id || isDepartmentAdmin || isSuper) &&
      !isClosed,
  };

  // An agent the issue was escalated away from only reads it and comments
  // (comments aren't gated here), so every action is off - including the
  // reopen and attachments any other viewer gets
  if (issue?.viewer_is_past_agent) {
    return Object.fromEntries(
      Object.keys(permissions).map((key) => [key, false]),
    ) as typeof permissions;
  }

  return permissions;
};
