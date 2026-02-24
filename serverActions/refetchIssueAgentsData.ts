"use server";
import { updateTag } from "next/cache";

export const handleRefetchIssueAgentsData = async () => {
  // revalidate issues info related data
  updateTag("GetIssueAgents");
  updateTag("Issue_Types");
  updateTag("Issue_Agents_Mapping");
};
