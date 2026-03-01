"use client";
import { Bell } from "lucide-react";
import ClientPortal from "@/components/Modules/ClientPortal";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useEffect, useState } from "react";

const Notifications = () => {
  const count = 10;

  return (
    <button className="bell-btn relative inline-flex items-center justify-center rounded-full p-2 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800">
      <Bell strokeWidth={1.5} className="bell-icon h-5 w-5" />

      {/* Number value */}
      {count > 0 && (
        <span className="absolute right-0.5 bottom-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none font-semibold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
};

export default Notifications;
