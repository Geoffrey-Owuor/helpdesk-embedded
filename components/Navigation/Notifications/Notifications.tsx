"use client";
import { Bell } from "lucide-react";
import { useIssuesStore } from "@/store/useIssuesStore";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useEffect, useState } from "react";
import NotificationModal from "./NotificationModal";
import { useLoadingStore } from "@/store/useLoadingStore";
import { useRouter, usePathname } from "next/navigation";
import { RouteChangeProps } from "./NotificationModal";

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
  const [loading, setLoading] = useState(true); //default to true
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pathname = usePathname();

  const defaultData = useIssuesStore((state) => state.issuesData);
  const defaultLoading = useIssuesStore((state) => state.loading);
  const type = "issue";

  const router = useRouter();

  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);

  const handleRouteChange = ({
    uuid,
    title,
    description,
  }: RouteChangeProps) => {
    setIsModalOpen(false);

    // Return if we already on the issue's page
    if (`/dashboard/${uuid}` === pathname) return;

    // our dashboard path
    const dashboardPath = `/dashboard/${uuid}?type=${type}&title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`;

    setLoadingLine(true);

    router.push(dashboardPath);
  };

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
    notificationData?.notificationDate && defaultData
      ? defaultData.filter(
          (issue) =>
            new Date(issue.issue_created_at) >
            new Date(notificationData.notificationDate),
        )
      : [];

  const count =
    (notificationData?.changelogs?.length ?? 0) + filteredIssues.length;

  // Handling closing the modal
  const handleCloseModal = async () => {
    setIsModalOpen(false);

    //Nothing was viewed, skip the update
    if (count === 0) return;

    try {
      await apiClient.patch("/notifications/patch-notifications-date");
      // optimistically clearing the count by setting the notificationDate to now
      setNotificationData((prev) =>
        prev
          ? {
              ...prev,
              notificationDate: new Date().toISOString(),
              changelogs: [],
            }
          : null,
      );
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      console.error("Error updating notification last viewed:", errorMessage);
    }
  };

  return (
    <>
      {isModalOpen && notificationData && (
        <NotificationModal
          changelogs={notificationData.changelogs}
          issues={filteredIssues}
          setIsModalOpen={setIsModalOpen}
          handleRouteChange={handleRouteChange}
          count={count}
          closeModal={handleCloseModal}
        />
      )}
      <button
        disabled={loading || defaultLoading}
        onClick={() => setIsModalOpen(true)}
        className="bell-btn relative inline-flex items-center justify-center rounded-full p-2 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
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
