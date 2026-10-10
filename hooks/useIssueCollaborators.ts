"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchCollaborators } from "@/queries/fetchCollaborators";
import { IssueDetail } from "@/queries/fetchIssue";

// The agents invited to collaborate on an issue - only fetched once we know
// the issue has any, so issues without collaborators skip the request.
export const useIssueCollaborators = (
  uuid: string,
  issue: IssueDetail | undefined,
) => {
  const { data: collaborators = [], isLoading } = useQuery({
    queryKey: ["issueCollaborators", uuid],
    queryFn: () => fetchCollaborators(uuid),
    enabled: Number(issue?.collaborators_count) > 0,
  });

  return { collaborators, isLoading };
};
