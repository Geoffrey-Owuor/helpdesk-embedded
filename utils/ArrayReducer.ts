// A function that uses the javascript reduce method
// to create an organized list from a query result array
import { IssueAgents } from "@/serverActions/GetIssueAgents";
import { IssueValueTypes } from "@/contexts/IssuesDataContext";

// 1. Define the shape of the new, grouped agent object
export interface AgentWithSkills {
  name: string;
  email: string;
  supported_issues: IssueValueTypes[];
}

export const arrayReducer = (queryArray: IssueAgents[]): AgentWithSkills[] => {
  const issueAgentsMap = queryArray.reduce<Record<string, AgentWithSkills>>(
    (acc, row) => {
      // using email as our unique key
      const key = row.agent_email;

      // if we haven't seen this agent yet, create its object
      if (!acc[key]) {
        acc[key] = {
          name: row.agent_name,
          email: row.agent_email,
          supported_issues: [],
        };
      }

      // Add the current row's issue type to the agent's list
      acc[key].supported_issues.push(row.issue_type);

      return acc;
    },
    {},
  ); //we start with an empty object and push key value pairs to it as we mapp over the issueAgents array

  // Return the values
  return Object.values(issueAgentsMap);
};
