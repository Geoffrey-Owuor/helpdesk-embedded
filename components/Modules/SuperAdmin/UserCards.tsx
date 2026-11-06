"use client";

import apiClient from "@/lib/AxiosClient";
import { useQuery } from "@tanstack/react-query";
import { UserCounts, DefaultUserCounts } from "@/lib/assets";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { ShieldCheck, UsersRound, UserRoundCheck, Headset } from "lucide-react";
import ActiveCounts from "./ActiveCounts";
import { indicatorCircle } from "@/lib/indicatorStyles";

const UserCards = () => {
  const { data: userCounts = DefaultUserCounts, isPending: loading } =
    useQuery<UserCounts>({
      queryKey: ["UserCountsData"],
      queryFn: async () => {
        const response = await apiClient.get("/get-usercounts");
        return response.data;
      },
    });

  // Mapping data to UI config for cleaner rendering
  const cardData = [
    {
      label: "Total Users",
      value: userCounts.totals.total,
      breakdown: userCounts.totals,
      icon: UsersRound,
    },
    {
      label: "Admins",
      value: userCounts.admins.total,
      breakdown: userCounts.admins,
      icon: ShieldCheck,
    },
    {
      label: "Agents",
      value: userCounts.agents.total,
      breakdown: userCounts.agents,
      icon: Headset,
    },
    {
      label: "Normal Users",
      value: userCounts.normalUsers.total,
      breakdown: userCounts.normalUsers,
      icon: UserRoundCheck,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-3.5 lg:grid-cols-4">
      {cardData.map((item, index) => (
        <div
          key={index}
          className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white px-6 py-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
        >
          <span className="mb-1 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
            {item.label}
          </span>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
                {loading ? (
                  <SkeletonBox className="h-9 w-9 rounded-full" />
                ) : (
                  <>{item.value > 500 ? "500+" : item.value}</>
                )}
              </h3>
            </div>

            <div className={indicatorCircle}>
              <item.icon className="h-6 w-6" strokeWidth={2} />
            </div>
          </div>

          {/* Priority counts */}
          <ActiveCounts cardLoading={loading} breakdown={item.breakdown} />
        </div>
      ))}
    </div>
  );
};

export default UserCards;
