"use client";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MonthlyTrendEntry } from "../types";
import ChartCard from "./ChartCard";
import ChartTooltip from "./ChartTooltip";
import {
  axisProps,
  chartColors,
  countAxisProps,
  formatMonth,
  formatMonthLong,
} from "./chartTheme";

const series = [
  { key: "created", label: "Created", color: chartColors.series[0] },
  { key: "resolved", label: "Resolved", color: chartColors.series[1] },
] as const;

// Issues created vs resolved per month - whether the desk is keeping up
const IssuesTrendChart = ({
  monthlyTrend,
  isLoading,
  className,
}: {
  monthlyTrend: MonthlyTrendEntry[];
  isLoading: boolean;
  className?: string;
}) => (
  <ChartCard
    title="Issues Trend"
    subtitle="Created vs resolved per month"
    icon={TrendingUp}
    iconColor="text-blue-600 dark:text-blue-400"
    iconBgColor="bg-blue-50 dark:bg-blue-900/20"
    legend={series.map(({ label, color }) => ({ label, color }))}
    table={{
      columns: ["Month", "Created", "Resolved"],
      rows: monthlyTrend.map((entry) => [
        formatMonthLong(entry.month),
        entry.created,
        entry.resolved,
      ]),
    }}
    isLoading={isLoading}
    isEmpty={monthlyTrend.length === 0}
    emptyMessage="No issues match the current filters."
    className={className}
  >
    <ResponsiveContainer width="100%" height={256}>
      <LineChart
        data={monthlyTrend}
        margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
      >
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          {...axisProps}
          minTickGap={16}
        />
        <YAxis {...countAxisProps} />
        <Tooltip
          cursor={{ stroke: chartColors.axis, strokeWidth: 1 }}
          content={<ChartTooltip formatLabel={formatMonthLong} />}
        />
        {series.map(({ key, label, color }) => (
          <Line
            key={key}
            type="linear"
            dataKey={key}
            name={label}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            // Ringed in the surface colour so crossing lines stay readable
            dot={{
              r: 4,
              fill: color,
              stroke: chartColors.surface,
              strokeWidth: 2,
            }}
            activeDot={{
              r: 5,
              fill: color,
              stroke: chartColors.surface,
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

export default IssuesTrendChart;
