"use client";
import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { SubmissionSlotEntry } from "../types";
import ChartCard from "./ChartCard";
import { chartColors } from "./chartTheme";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const LEVELS = chartColors.ramp.length;

// Office hours for the "outside office hours" share: weekdays 08:00-17:00
const isOfficeHour = (weekday: number, hour: number) =>
  weekday <= 5 && hour >= 8 && hour < 17;

const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

// Which ramp step a count falls in: 0 for none, then 1..LEVELS in equal
// slices of the busiest slot
const levelFor = (count: number, max: number) =>
  count === 0 ? 0 : Math.max(1, Math.ceil((count / max) * LEVELS));

// The whole-number counts each ramp step covers, for the scale legend
const levelRanges = (max: number) =>
  Array.from({ length: LEVELS }, (_, i) => {
    const low = Math.floor((max * i) / LEVELS) + 1;
    const high = Math.floor((max * (i + 1)) / LEVELS);
    return { level: i + 1, low, high };
  }).filter(({ low, high }) => low <= high);

// When issues are raised - weekday by hour - to plan agent cover. One hue,
// darker for more issues; the hovered slot's numbers show above the grid.
const SubmissionHeatmap = ({
  submissions,
  isLoading,
  className,
}: {
  submissions: SubmissionSlotEntry[];
  isLoading: boolean;
  className?: string;
}) => {
  const [hovered, setHovered] = useState<{
    weekday: number;
    hour: number;
  } | null>(null);

  // counts[weekday - 1][hour]
  const counts = WEEKDAYS.map(() => HOURS.map(() => 0));
  for (const { weekday, hour, count } of submissions) {
    counts[weekday - 1][hour] = count;
  }

  const max = Math.max(1, ...submissions.map(({ count }) => count));
  const total = submissions.reduce((sum, { count }) => sum + count, 0);
  const dayTotals = counts.map((row) => row.reduce((a, b) => a + b, 0));
  const hourTotals = HOURS.map((hour) =>
    counts.reduce((sum, row) => sum + row[hour], 0),
  );
  const busiestDay = dayTotals.indexOf(Math.max(...dayTotals));
  const busiestHour = hourTotals.indexOf(Math.max(...hourTotals));
  const outsideOffice = submissions
    .filter(({ weekday, hour }) => !isOfficeHour(weekday, hour))
    .reduce((sum, { count }) => sum + count, 0);

  const hoveredText = hovered
    ? (() => {
        const count = counts[hovered.weekday - 1][hovered.hour];
        return `${WEEKDAYS_LONG[hovered.weekday - 1]}, ${formatHour(hovered.hour)}–${formatHour((hovered.hour + 1) % 24)}: ${count} ${count === 1 ? "issue" : "issues"}`;
      })()
    : "Hover or tap a slot for its count";

  const stats = [
    { label: "Busiest day", value: WEEKDAYS_LONG[busiestDay] },
    {
      label: "Busiest hour",
      value: `${formatHour(busiestHour)}–${formatHour((busiestHour + 1) % 24)}`,
    },
    {
      label: "Outside office hours",
      value:
        total === 0 ? "N/A" : `${Math.round((outsideOffice / total) * 100)}%`,
    },
  ];

  return (
    <ChartCard
      title="When Issues Come In"
      subtitle="Issues raised by weekday and hour (Nairobi time)"
      icon={CalendarRange}
      iconColor="text-sky-600 dark:text-sky-400"
      iconBgColor="bg-sky-50 dark:bg-sky-900/20"
      table={{
        columns: ["Day", ...HOURS.map(formatHour), "Total"],
        rows: WEEKDAYS_LONG.map((day, i) => [day, ...counts[i], dayTotals[i]]),
      }}
      isLoading={isLoading}
      isEmpty={total === 0}
      emptyMessage="No issues match the current filters."
      className={className}
    >
      <div className="flex flex-col gap-4 px-2">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col">
              <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                {label}
              </dt>
              <dd className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Fixed height so hovering never shifts the grid */}
        <p
          className="h-4 text-xs text-neutral-600 tabular-nums dark:text-neutral-300"
          aria-live="polite"
        >
          {hoveredText}
        </p>

        <div className="default-scrollbar overflow-x-auto pb-1">
          <div
            className="grid min-w-96 gap-0.5"
            style={{
              gridTemplateColumns: "2.25rem repeat(24, minmax(0.75rem, 1fr))",
            }}
            onMouseLeave={() => setHovered(null)}
            role="img"
            aria-label="Grid of issues raised by weekday and hour; use the table view for the numbers"
          >
            {WEEKDAYS.map((day, dayIndex) => (
              <div key={day} className="contents">
                <span className="self-center text-xs text-neutral-500 dark:text-neutral-400">
                  {day}
                </span>
                {HOURS.map((hour) => {
                  const count = counts[dayIndex][hour];
                  const level = levelFor(count, max);
                  const isHovered =
                    hovered?.weekday === dayIndex + 1 && hovered.hour === hour;
                  return (
                    <div
                      key={hour}
                      onMouseEnter={() =>
                        setHovered({ weekday: dayIndex + 1, hour })
                      }
                      title={`${WEEKDAYS_LONG[dayIndex]} ${formatHour(hour)}: ${count}`}
                      className={`h-6 rounded-sm ${level === 0 ? "bg-neutral-100 dark:bg-neutral-900" : ""} ${isHovered ? "ring-2 ring-neutral-900 ring-offset-1 ring-offset-white dark:ring-neutral-100 dark:ring-offset-neutral-950" : ""}`}
                      style={
                        level > 0
                          ? { backgroundColor: chartColors.ramp[level - 1] }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            ))}

            {/* Hour axis, every third hour */}
            <span />
            {HOURS.map((hour) => (
              <span
                key={hour}
                className="pt-1 text-[10px] text-neutral-500 tabular-nums dark:text-neutral-400"
              >
                {hour % 3 === 0 ? String(hour).padStart(2, "0") : ""}
              </span>
            ))}
          </div>
        </div>

        {/* Scale legend: what each step means in issues */}
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600 dark:text-neutral-400">
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-neutral-100 dark:bg-neutral-900" />
            0
          </li>
          {levelRanges(max).map(({ level, low, high }) => (
            <li key={level} className="flex items-center gap-1.5">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: chartColors.ramp[level - 1] }}
              />
              {low === high ? low : `${low}–${high}`}
            </li>
          ))}
          <li className="text-neutral-500 dark:text-neutral-500">
            issues per slot
          </li>
        </ul>
      </div>
    </ChartCard>
  );
};

export default SubmissionHeatmap;
