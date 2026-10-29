import { ShieldCheck } from "lucide-react";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { AnalyticsSla } from "../types";
import SlaMeter from "./SlaMeter";
import SlaStatus from "./SlaStatus";
import {
  compliancePercent,
  formatPercent,
  formatSlaMinutes,
} from "./slaFormat";

const headerCell =
  "py-2 pr-4 text-left text-xs font-medium whitespace-nowrap text-neutral-500 dark:text-neutral-400";
const cell = "py-3 pr-4 align-middle whitespace-nowrap";

// Compliance / target, with its status and meter
const WithinSlaCell = ({
  value,
  target,
}: {
  value: number | null;
  target: number | null;
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between gap-2">
      <span className="font-semibold text-neutral-900 tabular-nums dark:text-neutral-100">
        {formatPercent(value)}
        <span className="font-normal text-neutral-500 dark:text-neutral-400">
          {" "}
          / {formatPercent(target)}
        </span>
      </span>
      <SlaStatus value={value} target={target} compact />
    </div>
    <SlaMeter value={value} target={target} />
  </div>
);

// The SLA policy next to how the filtered issues did against it, per
// priority plus the change request target. Targets are edited in SQL
// (public.sla_policies, migrations/008).
const SlaPriorityTable = ({
  sla,
  isLoading,
  className = "",
}: {
  sla: AnalyticsSla | undefined;
  isLoading: boolean;
  className?: string;
}) => (
  <div
    className={`rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950 ${className}`}
  >
    <div className="flex items-start gap-2 px-6 pt-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
        <ShieldCheck className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          SLA by Priority
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Respond / resolve targets, calendar time
        </p>
      </div>
    </div>

    <div className="default-scrollbar overflow-x-auto px-6 pt-3 pb-4">
      {isLoading || !sla ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <SkeletonBox key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : (
        <table className="w-full min-w-160 text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th scope="col" className={headerCell}>
                Priority
              </th>
              <th scope="col" className={headerCell}>
                Respond / Resolve
              </th>
              <th scope="col" className={`${headerCell} text-right`}>
                Responded
              </th>
              <th scope="col" className={`${headerCell} text-right`}>
                Resolved
              </th>
              <th scope="col" className={`${headerCell} w-48`}>
                Within SLA
              </th>
              <th scope="col" className={`${headerCell} text-right`}>
                Breached
              </th>
              <th scope="col" className={`${headerCell} text-right`}>
                Pending
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {sla.priorities.map((row) => {
              const within = compliancePercent(row.sla);
              return (
                <tr key={row.priorityCode}>
                  <td className={cell}>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {row.priorityCode}
                    </span>{" "}
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {row.priority}
                    </span>
                  </td>
                  <td
                    className={`${cell} text-neutral-700 dark:text-neutral-300`}
                  >
                    ≤ {formatSlaMinutes(row.responseMinutes)} / ≤{" "}
                    {formatSlaMinutes(row.resolutionMinutes)}
                  </td>
                  <td
                    className={`${cell} text-right text-neutral-800 tabular-nums dark:text-neutral-200`}
                  >
                    {formatPercent(compliancePercent(row.response))}
                  </td>
                  <td
                    className={`${cell} text-right text-neutral-800 tabular-nums dark:text-neutral-200`}
                  >
                    {formatPercent(compliancePercent(row.resolution))}
                  </td>
                  <td className={cell}>
                    <WithinSlaCell value={within} target={row.targetPercent} />
                  </td>
                  <td
                    className={`${cell} text-right text-neutral-800 tabular-nums dark:text-neutral-200`}
                  >
                    {row.sla.breached}
                  </td>
                  <td
                    className={`${cell} text-right text-neutral-800 tabular-nums dark:text-neutral-200`}
                  >
                    {row.sla.pending}
                  </td>
                </tr>
              );
            })}
            {(() => {
              const within = compliancePercent(sla.changeRequests.sla);
              const target = sla.changeRequests.targetPercent;
              return (
                <tr>
                  <td className={cell}>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      Change requests
                    </span>
                  </td>
                  <td
                    className={`${cell} text-neutral-500 dark:text-neutral-400`}
                  >
                    Their priority&apos;s targets
                  </td>
                  <td className={`${cell} text-right text-neutral-400`}>–</td>
                  <td className={`${cell} text-right text-neutral-400`}>–</td>
                  <td className={cell}>
                    <WithinSlaCell value={within} target={target} />
                  </td>
                  <td
                    className={`${cell} text-right text-neutral-800 tabular-nums dark:text-neutral-200`}
                  >
                    {sla.changeRequests.sla.breached}
                  </td>
                  <td
                    className={`${cell} text-right text-neutral-800 tabular-nums dark:text-neutral-200`}
                  >
                    {sla.changeRequests.sla.pending}
                  </td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

export default SlaPriorityTable;
