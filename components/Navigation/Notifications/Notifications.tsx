"use client";
import { Bell } from "lucide-react";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useEffect, useState } from "react";
import NotificationModal from "./NotificationModal";

export interface ChangelogItem {
  changelog_id: string;
  changelog_updated_at: string;
  changelog_type: string;
  changelog_title: string;
  changelog_description: string;
}

type NotificationResponse = {
  notificationDate: string;
  changelogs: ChangelogItem[];
};

const Notifications = () => {
  const [notificationData, setNotificationData] =
    useState<NotificationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { issuesData } = useIssuesData();

  useEffect(() => {
    const fetchChangelogs = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/notifications/user-changelogs");
        setNotificationData(response.data);
      } catch (error) {
        const errorMessage = getApiErrorMessage(error);
        console.error("Error while fetching changelogs data:", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchChangelogs();
  }, []);

  // Filter issuesData to only those created on or after notificationDate
  const filteredIssues =
    notificationData?.notificationDate && issuesData
      ? issuesData.filter(
          (issue) =>
            new Date(issue.issue_created_at) >
            new Date(notificationData.notificationDate),
        )
      : [];

  const count =
    (notificationData?.changelogs?.length ?? 0) + filteredIssues.length;

  return (
    <>
      {isModalOpen && notificationData && (
        <NotificationModal
          changelogs={notificationData.changelogs}
          issues={filteredIssues}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
      <button
        disabled={loading}
        onClick={() => setIsModalOpen(true)}
        className="bell-btn relative inline-flex items-center justify-center rounded-full p-2 text-neutral-700 hover:bg-neutral-200 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <Bell className="bell-icon h-5 w-5" />

        {count > 0 && (
          <span className="absolute right-0.5 bottom-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none font-semibold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
    </>
  );
};

export default Notifications;
