"use client";
import { Hourglass } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AGEING_BUCKET_LABELS } from "@/lib/analytics/ageingBuckets";
import { BacklogAgeingEntry } from "../types";
import ChartCard from "./ChartCard";
import ChartTooltip from "./ChartTooltip";
import { axisProps, chartColors, countAxisProps } from "./chartTheme";

// How long the open backlog has been waiting. The buckets are ordered, so
// they step along one hue - older stands out more
const BacklogAgeingChart = ({
  backlogAgeing,
  isLoading,
  className,
}: {
  backlogAgeing: BacklogAgeingEntry[];
  isLoading: boolean;
  className?: string;
}) => {
  const data = backlogAgeing.map((entry) => ({
    label: AGEING_BUCKET_LABELS[entry.bucket],
    count: entry.count,
  }));

  return (
    <ChartCard
      title="Backlog Ageing"
      subtitle="Open and in progress issues by age"
      icon={Hourglass}
      iconColor="text-orange-600 dark:text-orange-400"
      iconBgColor="bg-orange-50 dark:bg-orange-900/20"
      table={{
        columns: ["Age", "Issues"],
        rows: data.map((row) => [row.label, row.count]),
      }}
      isLoading={isLoading}
      isEmpty={data.every((row) => row.count === 0)}
      emptyMessage="No open or in progress issues match the current filters."
      className={className}
    >
      <ResponsiveContainer width="100%" height={256}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis dataKey="label" {...axisProps} interval={0} />
          <YAxis {...countAxisProps} />
          <Tooltip
            cursor={{ fill: chartColors.cursor }}
            content={<ChartTooltip />}
          />
          <Bar
            dataKey="count"
            name="Issues"
            maxBarSize={24}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          >
            {data.map((row, i) => (
              <Cell key={row.label} fill={chartColors.ramp[i]} />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              fill={chartColors.inkMuted}
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default BacklogAgeingChart;
