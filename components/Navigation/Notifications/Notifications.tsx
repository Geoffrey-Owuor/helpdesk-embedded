"use client";
import { Bell } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useState } from "react";
import NotificationModal from "./NotificationModal";
import { useLoadingStore } from "@/store/useLoadingStore";
import { useRouter, usePathname } from "next/navigation";
import { RouteChangeProps } from "./NotificationModal";
import { useAlertStore } from "@/store/useAlertStore";
import { fetchIssues } from "@/queries/fetchIssues";
import { DEFAULT_FETCH_OPTIONS } from "@/public/assets";
import { useSearchStore } from "@/store/useSearchStore";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pathname = usePathname();

  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);

  const triggerAlert = useAlertStore((state) => state.triggerAlert);

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

  const queryClient = useQueryClient();

  const { data: notificationData, isLoading: loading } = useQuery({
    queryKey: ["changelogs"],
    queryFn: async () => {
      const response = await apiClient.get("/notifications/user-changelogs");
      return response.data as NotificationResponse;
    },
  });

  const { data: defaultData = [], isLoading: defaultLoading } = useQuery({
    queryKey: ["issuesDashboardData", superAdminFilter, agentAdminFilter],
    queryFn: () => fetchIssues(DEFAULT_FETCH_OPTIONS),
  });

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

  // Mutation function
  const { mutate: handleCloseModal, isPending: closing } = useMutation({
    mutationFn: async () =>
      await apiClient.patch("/notifications/patch-notifications-date"),
    onSuccess: () => {
      // optimistic update
      queryClient.setQueryData(
        ["changelogs"],
        (prevNotifications: NotificationResponse) => {
          return {
            ...prevNotifications,
            notificationDate: new Date().toISOString(),
            changelogs: [],
          };
        },
      );

      setIsModalOpen(false);
    },
    onError: (error) => {
      const generatedError = getApiErrorMessage(error);
      console.error("Error while trying to close the modal:", generatedError);
      triggerAlert("error", "Failed to update viewed date");
    },
  });

  return (
    <>
      {isModalOpen && notificationData && (
        <NotificationModal
          changelogs={notificationData.changelogs}
          issues={filteredIssues}
          setIsModalOpen={setIsModalOpen}
          isModalOpen={isModalOpen}
          handleRouteChange={handleRouteChange}
          count={count}
          isClosing={closing}
          closeModal={() => handleCloseModal()}
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
