import { UserRoundCheck } from "lucide-react";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { AnalyticsSla, SlaStateCounts } from "../types";
import { formatMonth, formatMonthLong } from "../charts/chartTheme";
import SlaStatus from "./SlaStatus";
import { compliancePercent, formatPercent } from "./slaFormat";

// Months shown as columns, most recent last
const MAX_MONTHS = 12;

const headerCell =
  "py-2 pr-4 text-xs font-medium whitespace-nowrap text-neutral-500 dark:text-neutral-400";
const cell = "py-2.5 pr-4 whitespace-nowrap tabular-nums";
// The agent column stays put while the months scroll sideways
const stickyCell = "sticky left-0 z-10 bg-white pr-4 dark:bg-neutral-950";

// A compliance figure with its status icon; "–" when nothing was judged
const ComplianceCell = ({
  counts,
  target,
  label,
}: {
  counts: SlaStateCounts;
  target: number | null;
  label: string;
}) => {
  const value = compliancePercent(counts);
  if (value === null)
    return (
      <span className="text-neutral-400" title={`${label}: nothing judged yet`}>
        –
      </span>
    );

  return (
    <span
      className="inline-flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200"
      title={`${label}: ${counts.met} of ${counts.met + counts.breached} met, target ${formatPercent(target)}`}
    >
      {formatPercent(value)}
      <SlaStatus value={value} target={target} compact />
    </span>
  );
};

// Each assigned agent's SLA compliance overall and month by month (by the
// month an issue was raised). Each agent is held to the target of their own
// priority mix.
const SlaAgentTable = ({
  sla,
  isLoading,
}: {
  sla: AnalyticsSla | undefined;
  isLoading: boolean;
}) => {
  const months = [
    ...new Set((sla?.monthly ?? []).map((entry) => entry.month)),
  ].slice(-MAX_MONTHS);

  const monthlyFor = (agentEmail: string, month: string) =>
    sla?.monthly.find(
      (entry) => entry.agentEmail === agentEmail && entry.month === month,
    );

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-start gap-2 px-6 pt-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400">
          <UserRoundCheck className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            SLA by Agent
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Within SLA per assigned agent, overall and by month raised
          </p>
        </div>
      </div>

      <div className="default-scrollbar overflow-x-auto px-6 pt-3 pb-4">
        {isLoading || !sla ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <SkeletonBox key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : sla.agents.length === 0 ? (
          <p className="text-sm text-neutral-400 italic dark:text-neutral-500">
            No assigned issues match the current filters.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th
                  scope="col"
                  className={`${headerCell} ${stickyCell} text-left`}
                >
                  Agent
                </th>
                <th scope="col" className={`${headerCell} text-left`}>
                  Within SLA
                </th>
                <th scope="col" className={`${headerCell} text-left`}>
                  Responded
                </th>
                <th scope="col" className={`${headerCell} text-left`}>
                  Resolved
                </th>
                <th scope="col" className={`${headerCell} text-right`}>
                  Breached
                </th>
                <th scope="col" className={`${headerCell} text-right`}>
                  Pending
                </th>
                {months.map((month) => (
                  <th
                    key={month}
                    scope="col"
                    className={`${headerCell} border-l border-neutral-100 pl-4 text-left dark:border-neutral-800/60`}
                    title={formatMonthLong(month)}
                  >
                    {formatMonth(month)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {sla.agents.map((agent) => (
                <tr key={agent.agentEmail}>
                  <th
                    scope="row"
                    className={`${cell} ${stickyCell} text-left font-medium text-neutral-900 dark:text-neutral-100`}
                  >
                    {agent.agentName}
                  </th>
                  <td className={cell}>
                    <ComplianceCell
                      counts={agent.sla}
                      target={agent.blendedTarget}
                      label="Within SLA"
                    />
                  </td>
                  <td className={cell}>
                    <ComplianceCell
                      counts={agent.response}
                      target={agent.blendedTarget}
                      label="Responded on time"
                    />
                  </td>
                  <td className={cell}>
                    <ComplianceCell
                      counts={agent.resolution}
                      target={agent.blendedTarget}
                      label="Resolved on time"
                    />
                  </td>
                  <td
                    className={`${cell} text-right text-neutral-800 dark:text-neutral-200`}
                  >
                    {agent.sla.breached}
                  </td>
                  <td
                    className={`${cell} text-right text-neutral-800 dark:text-neutral-200`}
                  >
                    {agent.sla.pending}
                  </td>
                  {months.map((month) => {
                    const entry = monthlyFor(agent.agentEmail, month);
                    return (
                      <td
                        key={month}
                        className={`${cell} border-l border-neutral-100 pl-4 dark:border-neutral-800/60`}
                      >
                        {entry ? (
                          <ComplianceCell
                            counts={entry.sla}
                            target={entry.blendedTarget}
                            label={formatMonthLong(month)}
                          />
                        ) : (
                          <span className="text-neutral-300 dark:text-neutral-700">
                            ·
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SlaAgentTable;
