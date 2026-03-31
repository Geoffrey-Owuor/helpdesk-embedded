"use client";

import apiClient from "@/lib/AxiosClient";
import { useQuery } from "@tanstack/react-query";
import { UserCounts, DefaultUserCounts } from "@/public/assets";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import {
  ShieldCheck,
  UsersRound,
  UserRoundCog,
  UserRoundCheck,
} from "lucide-react";
import ActiveCounts from "./ActiveCounts";

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
      color: "text-blue-600 dark:text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800/50",
    },
    {
      label: "Admins",
      value: userCounts.admins.total,
      breakdown: userCounts.admins,
      icon: ShieldCheck,
      color: "text-purple-600 dark:text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      borderColor: "border-purple-200 dark:border-purple-800/50",
    },
    {
      label: "Agents",
      value: userCounts.agents.total,
      breakdown: userCounts.agents,
      icon: UserRoundCog,
      color: "text-orange-600 dark:text-orange-500",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      borderColor: "border-orange-200 dark:border-orange-800/50",
    },
    {
      label: "Normal Users",
      value: userCounts.normalUsers.total,
      breakdown: userCounts.normalUsers,
      icon: UserRoundCheck,
      color: "text-neutral-600 dark:text-neutral-500",
      bgColor: "bg-neutral-100 dark:bg-neutral-900",
      borderColor: "border-neutral-200 dark:border-neutral-800/50",
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
              <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {loading ? (
                  <SkeletonBox className="h-9 w-9 rounded-full" />
                ) : (
                  item.value
                )}
              </h3>
            </div>

            {/* Icon Container with dynamic colors */}
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border ${item.bgColor} ${item.borderColor} ${item.color}`}
            >
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
