"use client";

import apiClient from "@/lib/AxiosClient";
import { useQuery } from "@tanstack/react-query";
import { UserCounts, DefaultUserCounts } from "@/public/assets";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import {
  ShieldCheck,
  Activity,
  UsersRound,
  UserRoundCog,
  UserRoundCheck,
  UserRoundMinus,
} from "lucide-react";

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
      value: userCounts.totals,
      icon: UsersRound,
      color: "text-blue-500",
    },
    {
      label: "Admins",
      value: userCounts.admins,
      icon: ShieldCheck,
      color: "text-purple-500",
    },
    {
      label: "Agents",
      value: userCounts.agents,
      icon: UserRoundCog,
      color: "text-orange-500",
    },
    {
      label: "Normal Users",
      value: userCounts.normalUsers,
      icon: UserRoundCheck,
      color: "text-neutral-500",
    },
    {
      label: "Active",
      value: userCounts.activeUsers,
      icon: Activity,
      color: "text-emerald-500",
    },
    {
      label: "Inactive",
      value: userCounts.inactiveUsers,
      icon: UserRoundMinus,
      color: "text-rose-500",
    },
  ];

  return (
    <div className="mb-4 grid w-full grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {cardData.map((card, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wider text-neutral-500 dark:text-neutral-400">
              {card.label}
            </span>
            <card.icon size={16} className={`${card.color} opacity-80`} />
          </div>

          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            {loading ? (
              <SkeletonBox className="h-6 w-12 rounded-md" />
            ) : (
              card.value.toLocaleString()
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserCards;
