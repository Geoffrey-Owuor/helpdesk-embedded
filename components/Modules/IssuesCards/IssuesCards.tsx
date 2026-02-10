"use client";

import IssuesCardsSkeleton from "@/components/Skeletons/IssuesCardsSkeleton";
import { useIssuesCards } from "@/contexts/IssuesCardsContext";
import { useAutomations } from "@/contexts/AutomationCardsContext";
import { useSearchLogic } from "@/contexts/SearchLogicContext";
import {
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import DepartmentsDropDown from "../AutomationsPage/DepartmentsDropDown";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const IssuesCards = ({ type }: { type: string }) => {
  const { issuesCounts, refetchIssuesCounts, loading } = useIssuesCards();
  const {
    automationCounts,
    refetchAutomationCounts,
    loading: automationLoading,
  } = useAutomations();
  const { role, department } = useUser();
  const { agentAdminFilter } = useSearchLogic();

  // Call srolling top hook
  useScrollToTop();

  // Defining our card variables
  let cardCounts;
  let refetchCardCounts;
  let cardLoading;

  switch (type) {
    case "automations":
      cardCounts = automationCounts;
      refetchCardCounts = refetchAutomationCounts;
      cardLoading = automationLoading;
      break;
    default:
      cardCounts = issuesCounts;
      refetchCardCounts = refetchIssuesCounts;
      cardLoading = loading;
      break;
  }

  // Configuration for the cards to keep the JSX clean
  // We map specific colors to each status to make them distinct but cohesive
  const statItems = [
    {
      label: "Pending",
      count: cardCounts.pending,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      borderColor: "border-amber-200 dark:border-amber-800/50",
    },
    {
      label: "In Progress",
      count: cardCounts.inProgress,
      icon: Activity,
      color: "text-blue-600 dark:text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      borderColor: "border-blue-200 dark:border-blue-800/50",
    },
    {
      label: "Resolved",
      count: cardCounts.resolved,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-500",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      borderColor: "border-emerald-200 dark:border-emerald-800/50",
    },
    {
      label: "Unfeasible",
      count: cardCounts.unfeasible,
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
    <div className="py-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex flex-col">
          <span className="text-xl font-semibold">
            {type === "automations" ? "Automations" : "Issues"} Summary
          </span>
          <span className="text-sm text-neutral-800 dark:text-neutral-400">
            {type === "automations"
              ? "Department Automations"
              : `${subtitleMapping[role]} Issues`}{" "}
            Overview
          </span>
          {type === "automations" && <DepartmentsDropDown />}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={refetchCardCounts}
            className="rounded-full bg-neutral-100 p-2 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <RotateCcw />
          </button>

          {cardLoading ? (
            <SkeletonBox className="hidden h-11 w-20 md:inline-flex" />
          ) : (
            <div className="hidden items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 md:flex dark:bg-neutral-900">
              <TrendingUp />
              <span className="text-lg font-semibold">{cardCounts.totals}</span>
            </div>
          )}
        </div>
      </div>

      {cardLoading ? (
        <IssuesCardsSkeleton />
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="group relative flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                    {item.label}
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    {item.count}
                  </h3>
                </div>

                {/* Icon Container with dynamic colors */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border ${item.bgColor} ${item.borderColor} ${item.color}`}
                >
                  <item.icon className="h-6 w-6" strokeWidth={2} />
                </div>
              </div>

              {/* Optional: Subtle decorative element or "View details" link could go here */}
              <div className="mt-4 flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                <span className="font-semibold">
                  Total {item.label}{" "}
                  {type === "automations" ? "Automations" : "Issues"}
                </span>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default IssuesCards;
