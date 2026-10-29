"use client";
import { useQuery } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useAnalyticsFilterStore } from "@/store/useAnalyticsFilterStore";
import { fetchAnalyticsSla } from "@/queries/analytics/fetchAnalyticsSla";
import SlaKpiTiles from "./SlaKpiTiles";
import SlaPriorityTable from "./SlaPriorityTable";
import SlaTrendChart from "./SlaTrendChart";
import SlaAgentTable from "./SlaAgentTable";

// SLA performance of the filtered issues against the helpdesk SLA policy
// (public.sla_policies). Fetched separately from the summary so it follows
// the same filters but can fail on its own.
const SlaSection = () => {
  const committedFilters = useAnalyticsFilterStore(
    (state) => state.committedFilters,
  );

  const {
    data: sla,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["analyticsSla", committedFilters],
    queryFn: () => fetchAnalyticsSla(committedFilters),
  });

  return (
    <section className="flex flex-col gap-4" aria-labelledby="sla-heading">
      <div className="flex flex-col">
        <h2
          id="sla-heading"
          className="text-lg font-semibold text-neutral-900 dark:text-white"
        >
          SLA Performance
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Against the helpdesk SLA policy. Issues still inside their target are
          pending; ones closed without resolution aren&apos;t counted.
        </p>
      </div>

      {isError ? (
        <p className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
          <CircleAlert className="h-4 w-4 shrink-0 text-neutral-400" />
          SLA compliance couldn&apos;t be loaded. Try refreshing.
        </p>
      ) : (
        <>
          <SlaKpiTiles sla={sla} isLoading={isLoading} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <SlaPriorityTable
              sla={sla}
              isLoading={isLoading}
              className="lg:col-span-3"
            />
            <SlaTrendChart
              monthly={sla?.monthly ?? []}
              isLoading={isLoading}
              className="lg:col-span-2"
            />
          </div>

          <SlaAgentTable sla={sla} isLoading={isLoading} />
        </>
      )}
    </section>
  );
};

export default SlaSection;
