import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { AnalyticsSla, SlaStateCounts } from "../types";
import SlaMeter from "./SlaMeter";
import SlaStatus from "./SlaStatus";
import { compliancePercent, formatPercent } from "./slaFormat";

const SlaKpiTile = ({
  label,
  counts,
  target,
  targetNote,
  isLoading,
}: {
  label: string;
  counts: SlaStateCounts;
  target: number | null;
  targetNote: string;
  isLoading: boolean;
}) => {
  const value = compliancePercent(counts);
  const judged = counts.met + counts.breached;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white px-6 py-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          {label}
        </span>
        {!isLoading && <SlaStatus value={value} target={target} />}
      </div>

      {isLoading ? (
        <SkeletonBox className="h-9 w-20 rounded-xl" />
      ) : (
        <span className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          {formatPercent(value)}
        </span>
      )}

      <SlaMeter value={isLoading ? null : value} target={target} />

      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          Target {formatPercent(target)}
          {targetNote && ` · ${targetNote}`}
        </span>
        {!isLoading && (
          <span>
            {counts.met} of {judged} met
            {counts.pending > 0 && ` · ${counts.pending} pending`}
          </span>
        )}
      </div>
    </div>
  );
};

// Headline SLA compliance for the filtered issues. Response and resolution
// each have their own target per priority; "Within SLA" needs both met.
const SlaKpiTiles = ({
  sla,
  isLoading,
}: {
  sla: AnalyticsSla | undefined;
  isLoading: boolean;
}) => {
  const empty = { met: 0, breached: 0, pending: 0 };
  // Priorities have different targets, so a mixed set is held to the
  // average target of the issues in it
  const blendedTarget = sla?.overall.blendedTarget ?? null;
  const blendedNote =
    sla &&
    new Set(
      sla.priorities
        .filter((p) => p.sla.met + p.sla.breached > 0)
        .map((p) => p.targetPercent),
    ).size > 1
      ? "by priority mix"
      : "";

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SlaKpiTile
        label="Within SLA"
        counts={sla?.overall.sla ?? empty}
        target={blendedTarget}
        targetNote={blendedNote}
        isLoading={isLoading}
      />
      <SlaKpiTile
        label="Response On Time"
        counts={sla?.overall.response ?? empty}
        target={blendedTarget}
        targetNote={blendedNote}
        isLoading={isLoading}
      />
      <SlaKpiTile
        label="Resolved On Time"
        counts={sla?.overall.resolution ?? empty}
        target={blendedTarget}
        targetNote={blendedNote}
        isLoading={isLoading}
      />
      <SlaKpiTile
        label="Change Requests"
        counts={sla?.changeRequests.sla ?? empty}
        target={sla?.changeRequests.targetPercent ?? null}
        targetNote=""
        isLoading={isLoading}
      />
    </section>
  );
};

export default SlaKpiTiles;
