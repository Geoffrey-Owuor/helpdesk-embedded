"use client";

import { useSearchStore } from "@/store/useSearchStore";
import {
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RotateCw,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import DepartmentsDropDown from "../AutomationsPage/DepartmentsDropDown";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { fetchIssueCards } from "@/queries/fetchIssueCards";
import { fetchAutomationCards } from "@/queries/fetchAutomationCards";
import { useQuery } from "@tanstack/react-query";
import SuperAdminFilter from "./SuperAdminFilter";
import { defaultCounts } from "@/public/assets";
import PriorityCounts from "./PriorityCounts";

const IssuesCards = ({ type }: { type: string }) => {
  const isAutomations = type === "automations";

  const { role, department, isSuper } = useUser();
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);
  const selectedDepartment = useSearchStore(
    (state) => state.selectedDepartment,
  );

  const {
    data: issueCounts = defaultCounts,
    isLoading: loading,
    refetch: refetchIssueCounts,
  } = useQuery({
    queryKey: ["dashboardIssueCounts", agentAdminFilter, superAdminFilter],
    queryFn: fetchIssueCards,
    enabled: !isAutomations,
  });

  const {
    data: automationCounts = defaultCounts,
    isLoading: automationLoading,
    refetch: refetchAutomationCounts,
  } = useQuery({
    queryKey: ["dashboardAutomationCounts", selectedDepartment],
    queryFn: fetchAutomationCards,
    enabled: isAutomations,
  });

  // Call srolling top hook
  useScrollToTop();

  // Defining our card variables
  const cardCounts = isAutomations ? automationCounts : issueCounts;
  const refetchCardCounts = isAutomations
    ? refetchAutomationCounts
    : refetchIssueCounts;
  const cardLoading = isAutomations ? automationLoading : loading;

  // Configuration for the cards to keep the JSX clean
  // We map specific colors to each status to make them distinct but cohesive
  const statItems = [
    {
      label: "Pending",
      count: cardCounts.pending.total,
      breakdown: cardCounts.pending,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",

      borderColor: "border-amber-200 dark:border-amber-800/50",
    },
    {
      label: "In Progress",
      count: cardCounts.inProgress.total,
      breakdown: cardCounts.inProgress,
      icon: Activity,
      color: "text-blue-600 dark:text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800/50",
    },
    {
      label: "Resolved",
      count: cardCounts.resolved.total,
      breakdown: cardCounts.resolved,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-500",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      borderColor: "border-emerald-200 dark:border-emerald-800/50",
    },
    {
      label: "Unfeasible",
      count: cardCounts.unfeasible.total,
      breakdown: cardCounts.unfeasible,
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-500",
      bgColor: "bg-rose-100 dark:bg-rose-900/30",
      borderColor: "border-rose-200 dark:border-rose-800/50",
    },
  ];

  // subtitle role mapping
  const subtitleMapping: Record<string, string> = {
    user: "Submitted",
    agent: "Assigned",
    admin: agentAdminFilter === "agentAdminFilter" ? "Submitted" : department,
  };

  return (
    <div className="py-6 md:py-3.5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <div className="inline-flex flex-col">
            <span className="text-xl font-semibold">
              {isAutomations ? "Automations" : "Issues"} Summary
            </span>
            <span className="text-sm text-neutral-800 dark:text-neutral-400">
              {isAutomations
                ? "Department Automations"
                : superAdminFilter && isSuper
                  ? "All Submitted Issues"
                  : `${subtitleMapping[role]} Issues`}{" "}
              Overview
            </span>
          </div>
          {isAutomations && <DepartmentsDropDown />}
          {!isAutomations && isSuper && <SuperAdminFilter />}
        </div>
        <div className="flex items-center gap-4">
          {/* Refresh button */}
          <button
            onClick={() => refetchCardCounts()}
            title="Refresh"
            className="rounded-xl bg-neutral-100 p-2 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <RotateCw className="h-4.5 w-4.5" />
          </button>

          {/* Count badge */}
          {cardLoading ? (
            <SkeletonBox className="hidden h-8.5 w-18 md:inline-flex" />
          ) : (
            <div className="hidden items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 shadow-inner md:flex dark:bg-neutral-900">
              <TrendingUp className="h-4.5 w-4.5 text-neutral-700 dark:text-neutral-300" />
              <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                {cardCounts.totals}
              </span>
            </div>
          )}
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item, index) => (
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
                  {cardLoading ? (
                    <SkeletonBox className="h-9 w-9 rounded-full" />
                  ) : (
                    item.count
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
            <PriorityCounts
              cardLoading={cardLoading}
              priorityCounts={item.breakdown}
            />
          </div>
        ))}
      </section>
    </div>
  );
};

export default IssuesCards;
