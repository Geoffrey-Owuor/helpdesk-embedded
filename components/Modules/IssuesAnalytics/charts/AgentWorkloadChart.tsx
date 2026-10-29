"use client";
import { Headset } from "lucide-react";
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
import { AgentBreakdownEntry } from "../types";
import ChartCard from "./ChartCard";
import ChartTooltip from "./ChartTooltip";
import { axisProps, chartColors } from "./chartTheme";

const series = [
  { key: "active", label: "Open & in progress", color: chartColors.series[1] },
  { key: "done", label: "Resolved & closed", color: chartColors.series[0] },
] as const;

const ROW_HEIGHT = 36;

// Each agent's share of the filtered issues (assigned or collaborating),
// split into what they still have open and what they've finished
const AgentWorkloadChart = ({
  agentBreakdown,
  isLoading,
  className,
}: {
  agentBreakdown: AgentBreakdownEntry[];
  isLoading: boolean;
  className?: string;
}) => {
  const data = agentBreakdown.map((entry) => ({
    agent: entry.agentName,
    active: entry.activeCount,
    done: entry.count - entry.activeCount,
    total: entry.count,
  }));

  return (
    <ChartCard
      title="Agent Workload"
      subtitle="Issues per agent, including ones they collaborate on"
      icon={Headset}
      iconColor="text-emerald-600 dark:text-emerald-400"
      iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
      legend={series.map(({ label, color }) => ({ label, color }))}
      table={{
        columns: ["Agent", ...series.map(({ label }) => label), "Total"],
        rows: data.map((row) => [row.agent, row.active, row.done, row.total]),
      }}
      isLoading={isLoading}
      isEmpty={data.length === 0}
      emptyMessage="No agent data matches the current filters."
      className={className}
    >
      {/* Long agent lists scroll inside the card instead of squeezing the bars */}
      <div className="default-scrollbar max-h-64 overflow-y-auto">
        <ResponsiveContainer
          width="100%"
          height={Math.max(data.length * ROW_HEIGHT + 32, 120)}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
            barCategoryGap="30%"
          >
            <CartesianGrid horizontal={false} stroke={chartColors.grid} />
            <XAxis type="number" allowDecimals={false} {...axisProps} />
            <YAxis
              type="category"
              dataKey="agent"
              {...axisProps}
              axisLine={false}
              width={150}
              interval={0}
              tickFormatter={(name: string) =>
                name.length > 18 ? `${name.slice(0, 17)}…` : name
              }
            />
            <Tooltip
              cursor={{ fill: chartColors.cursor }}
              content={<ChartTooltip hideZero />}
            />
            {series.map(({ key, label, color }, i) => (
              <Bar
                key={key}
                dataKey={key}
                name={label}
                stackId="workload"
                fill={color}
                maxBarSize={20}
                stroke={chartColors.surface}
                strokeWidth={2}
                isAnimationActive={false}
              >
                {i === series.length - 1 && (
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
      </div>
    </ChartCard>
  );
};

export default AgentWorkloadChart;
