"use client";
import { CalendarClock } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SlaMonthlyEntry } from "../types";
import ChartCard from "../charts/ChartCard";
import ChartTooltip from "../charts/ChartTooltip";
import {
  axisProps,
  chartColors,
  formatMonth,
  formatMonthLong,
} from "../charts/chartTheme";
import { compliancePercent, formatPercent } from "./slaFormat";

// Within SLA % per month of creation for the filtered issues, against the
// target for that month's priority mix. Both are percentages on one axis.
const SlaTrendChart = ({
  monthly,
  isLoading,
  className,
}: {
  monthly: SlaMonthlyEntry[];
  isLoading: boolean;
  className?: string;
}) => {
  const data = monthly
    .filter((entry) => entry.agentEmail === null)
    .map((entry) => ({
      month: entry.month,
      // null leaves a gap for a month with nothing judged yet
      within: compliancePercent(entry.sla),
      target: entry.blendedTarget,
      met: entry.sla.met,
      judged: entry.sla.met + entry.sla.breached,
    }));

  const series = [
    { key: "within", label: "Within SLA", color: chartColors.series[0] },
    { key: "target", label: "Target", color: chartColors.target },
  ] as const;

  return (
    <ChartCard
      title="SLA Trend"
      subtitle="Within SLA by month raised"
      icon={CalendarClock}
      iconColor="text-blue-600 dark:text-blue-400"
      iconBgColor="bg-blue-50 dark:bg-blue-900/20"
      legend={series.map(({ label, color }) => ({ label, color }))}
      table={{
        columns: ["Month", "Within SLA", "Target", "Met / judged"],
        rows: data.map((row) => [
          formatMonthLong(row.month),
          formatPercent(row.within),
          formatPercent(row.target),
          `${row.met} / ${row.judged}`,
        ]),
      }}
      isLoading={isLoading}
      isEmpty={data.every((row) => row.within === null)}
      emptyMessage="No issues have been judged against the SLA yet."
      className={className}
    >
      <ResponsiveContainer width="100%" height={256}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            {...axisProps}
            minTickGap={16}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value: number) => `${value}%`}
            {...axisProps}
            axisLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: chartColors.axis, strokeWidth: 1 }}
            content={
              <ChartTooltip
                formatLabel={formatMonthLong}
                formatValue={(value) => formatPercent(value)}
              />
            }
          />
          {/* The target steps between months as the priority mix changes */}
          <Line
            type="stepAfter"
            dataKey="target"
            name="Target"
            stroke={chartColors.target}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="within"
            name="Within SLA"
            stroke={chartColors.series[0]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={{
              r: 4,
              fill: chartColors.series[0],
              stroke: chartColors.surface,
              strokeWidth: 2,
            }}
            activeDot={{
              r: 5,
              fill: chartColors.series[0],
              stroke: chartColors.surface,
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default SlaTrendChart;
