import { TooltipContentProps } from "recharts";

// Tooltip content shared by the analytics charts: the hovered label, then one
// row per series with its colour key beside (never on) the text.
const ChartTooltip = ({
  active,
  payload,
  label,
  formatLabel,
  formatValue = (value) => String(value),
  hideZero = false,
}: Partial<TooltipContentProps<number, string>> & {
  formatLabel?: (label: string) => string;
  formatValue?: (value: number) => string;
  // Stacked charts leave out empty segments so the list matches what's drawn
  hideZero?: boolean;
}) => {
  if (!active || !payload?.length) return null;

  const rows = payload.filter(
    (item) => !hideZero || Number(item.value ?? 0) > 0,
  );
  const heading =
    label === undefined
      ? ""
      : formatLabel
        ? formatLabel(String(label))
        : String(label);

  return (
    <div className="min-w-36 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
      {heading && (
        <p className="mb-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
          {heading}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {rows.map((item) => (
          <div
            key={String(item.dataKey ?? item.name)}
            className="flex items-center justify-between gap-4"
          >
            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
            <span className="font-semibold text-neutral-900 tabular-nums dark:text-neutral-100">
              {formatValue(Number(item.value))}
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <span className="text-neutral-500 dark:text-neutral-400">
            No issues
          </span>
        )}
      </div>
    </div>
  );
};

export default ChartTooltip;
