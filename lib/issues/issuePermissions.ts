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

  return {
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
};
