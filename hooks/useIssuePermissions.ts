"use client";
import { useUser } from "@/contexts/UserContext";
import { CollaboratorRecord } from "@/queries/fetchCollaborators";
import { IssueDetail } from "@/queries/fetchIssue";

// What the current user may do on a single issue, combining their role with
// the issue's status. The issue page's actions all read from here so the
// rules live in one place. Mirrors lib/IssueAccess.ts, which the API routes
// enforce.
export const useIssuePermissions = (
  issue: IssueDetail | undefined,
  collaborators: CollaboratorRecord[],
) => {
  const { role, email, department, userId, isSuper } = useUser();

  const status = issue?.issue_status;
  const isClosed = status === "closed";
  // Resolved or closed - the issue is done being worked on
  const isFinished = status === "resolved" || isClosed;

  const isDepartmentAdmin =
    role === "admin" && issue?.issue_target_department === department;

  // Am I one of the agents invited to collaborate on this issue?
  const isCollaborator = collaborators.some(
    (collaborator) => collaborator.collaborator_email === email,
  );

  // The assigned agent, a department admin or a super admin own the issue -
  // they are the only ones who can remove a collaborator from it
  const canManageCollaborators =
    issue?.issue_agent_email === email || isSuper || isDepartmentAdmin;

  // Everyone above, plus the invited collaborators, can work on the issue
  const canActOnIssue = canManageCollaborators || isCollaborator;

  return {
    canManageCollaborators,
    canInvite: canActOnIssue && !isClosed,
    canUpdateStatus: canActOnIssue && !isClosed,
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
