"use client";
import { fetchedIssueAgents } from "@/serverActions/GetIssueAgents";
import { IssueAgents } from "@/serverActions/GetIssueAgents";
import { useUser } from "@/contexts/UserContext";
import { useState, useEffect } from "react";

const AgentsInfo = () => {
  const [agentsInfo, setAgentsInfo] = useState<IssueAgents[]>([]);
  const [loading, setLoading] = useState(false);
  const { userId } = useUser();

  useEffect(() => {
    const fetchAgentsInfo = async () => {
      setLoading(true);
      try {
        const agentsData = await fetchedIssueAgents(userId);
        setAgentsInfo(agentsData);
      } catch (error) {
        console.error("Error while fetching agents information:", error);
        setAgentsInfo([]);
      } finally {
        setLoading(false);
      }
    };
  }, [userId]);
  return <div>The AgentsInfo Page</div>;
};

export default AgentsInfo;
