"use client";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import { useAutomationsData } from "@/contexts/AutomationsDataContext";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

export const IssuePage = ({ uuid }: { uuid: string }) => {
  //Get our data
  const { issuesData, loading } = useIssuesData();
  const { automationsData, loading: automationsLoading } = useAutomationsData();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  let recordsData;
  let recordsLoading;

  switch (type) {
    case "automation":
      recordsData = automationsData;
      recordsLoading = automationsLoading;
      break;
    default:
      recordsData = issuesData;
      recordsLoading = loading;
      break;
  }

  return <div>The issue uuid is {uuid}</div>;
};
