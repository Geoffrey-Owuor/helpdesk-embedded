// Shared Recharts styling for the analytics charts. Colours are the CSS
// tokens in css/globals.css (--chart-*), so light and dark mode each get
// their own validated steps without the charts knowing the theme.

export const chartColors = {
  surface: "var(--chart-surface)",
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis)",
  inkMuted: "var(--chart-ink-muted)",
  cursor: "var(--chart-cursor)",
  statusGood: "var(--chart-status-good)",
  statusCritical: "var(--chart-status-critical)",
  target: "var(--chart-target)",
  series: [
    "var(--chart-series-1)",
    "var(--chart-series-2)",
    "var(--chart-series-3)",
    "var(--chart-series-4)",
  ],
  ramp: [
    "var(--chart-ramp-1)",
    "var(--chart-ramp-2)",
    "var(--chart-ramp-3)",
    "var(--chart-ramp-4)",
    "var(--chart-ramp-5)",
  ],
} as const;

// Recessive hairline axes: muted ticks, no tick marks
export const axisProps = {
  stroke: chartColors.axis,
  tick: { fill: chartColors.inkMuted, fontSize: 12 },
  tickLine: false,
  axisLine: { stroke: chartColors.axis },
} as const;

// Counts only - no 2.5 issues on an axis
export const countAxisProps = {
  ...axisProps,
  allowDecimals: false,
  axisLine: false,
  width: 32,
} as const;

// "2026-07" -> "Jul 26"
export const formatMonth = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex - 1, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "2-digit",
  });
};

// "2026-07" -> "July 2026", for tooltips and the table view
export const formatMonthLong = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
};
