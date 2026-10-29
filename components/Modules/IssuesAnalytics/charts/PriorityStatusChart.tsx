"use client";
import { Gauge } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DataCounts } from "@/lib/assets";
import ChartCard from "./ChartCard";
import ChartTooltip from "./ChartTooltip";
import { axisProps, chartColors } from "./chartTheme";

const statuses = [
  { key: "open", label: "Open", color: chartColors.series[0] },
  { key: "inProgress", label: "In Progress", color: chartColors.series[1] },
  { key: "resolved", label: "Resolved", color: chartColors.series[2] },
  { key: "closed", label: "Closed", color: chartColors.series[3] },
] as const;

const priorities = [
  { key: "critical", label: "Critical" },
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
] as const;

// How many issues each priority has, split by where they are in the workflow
const PriorityStatusChart = ({
  statusCounts,
  isLoading,
  className,
}: {
  statusCounts: DataCounts;
  isLoading: boolean;
  className?: string;
}) => {
  const data = priorities.map(({ key, label }) => {
    const row = {
      priority: label,
      open: statusCounts.open[key],
      inProgress: statusCounts.inProgress[key],
      resolved: statusCounts.resolved[key],
      closed: statusCounts.closed[key],
    };
    return {
      ...row,
      total: row.open + row.inProgress + row.resolved + row.closed,
    };
  });

  return (
    <ChartCard
      title="Priority Breakdown"
      subtitle="Issues per priority, by status"
      icon={Gauge}
      iconColor="text-violet-600 dark:text-violet-400"
      iconBgColor="bg-violet-50 dark:bg-violet-900/20"
      legend={statuses.map(({ label, color }) => ({ label, color }))}
      table={{
        columns: ["Priority", ...statuses.map(({ label }) => label), "Total"],
        rows: data.map((row) => [
          row.priority,
          ...statuses.map(({ key }) => row[key]),
          row.total,
        ]),
      }}
      isLoading={isLoading}
      isEmpty={data.every((row) => row.total === 0)}
      emptyMessage="No priority data matches the current filters."
      className={className}
    >
      <ResponsiveContainer width="100%" height={256}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
          barCategoryGap="28%"
        >
          <CartesianGrid horizontal={false} stroke={chartColors.grid} />
          <XAxis type="number" allowDecimals={false} {...axisProps} />
          <YAxis
            type="category"
            dataKey="priority"
            {...axisProps}
            axisLine={false}
            width={64}
          />
          <Tooltip
            cursor={{ fill: chartColors.cursor }}
            content={<ChartTooltip hideZero />}
          />
          {statuses.map(({ key, label, color }, i) => (
            <Bar
              key={key}
              dataKey={key}
              name={label}
              stackId="status"
              fill={color}
              maxBarSize={24}
              // The surface-coloured stroke is the 2px gap between segments
              stroke={chartColors.surface}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {i === statuses.length - 1 && (
                <LabelList
                  dataKey="total"
                  position="right"
                  fill={chartColors.inkMuted}
                  fontSize={12}
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default PriorityStatusChart;
