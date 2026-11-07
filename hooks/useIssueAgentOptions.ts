"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { useSearchStore } from "@/store/useSearchStore";
import { fetchIssueAgents } from "@/queries/fetchIssueAgents";

// The issues list's Agent filter options for the current view (own
// submissions / all departments), shared by the filter panel and its pills
export const useIssueAgentOptions = () => {
  const { isSuper } = useUser();
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);
  const view = {
    agentAdminFilter,
    superAdminFilter: !!(isSuper && superAdminFilter),
  };

  const { data: agents = [] } = useQuery({
    queryKey: ["issueAgents", view.agentAdminFilter, view.superAdminFilter],
    queryFn: () => fetchIssueAgents(view),
    staleTime: 5 * 60 * 1000,
  });

  const options = agents.map((a) => ({
    label: a.department ? `${a.agent_name} - ${a.department}` : a.agent_name,
    value: a.agent_email,
  }));

  // The name for a selected email; the email itself if it isn't listed
  const agentName = (email: string) =>
    agents.find((a) => a.agent_email === email.toLowerCase())?.agent_name ?? email;

  return { options, agentName };
};
