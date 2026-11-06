"use client";
import { useUser } from "@/contexts/UserContext";
import { getIssuePermissions } from "@/lib/issues/issuePermissions";
import { CollaboratorRecord } from "@/queries/fetchCollaborators";
import { IssueDetail } from "@/queries/fetchIssue";

// What the current user may do on the issue page's issue
export const useIssuePermissions = (
  issue: IssueDetail | undefined,
  collaborators: CollaboratorRecord[],
) => {
  const user = useUser();

  return getIssuePermissions(
    user,
    issue,
    collaborators.some(
      (collaborator) => collaborator.collaborator_email === user.email,
    ),
  );
};
