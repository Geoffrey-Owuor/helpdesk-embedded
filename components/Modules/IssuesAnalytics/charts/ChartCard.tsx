"use client";
import { useState } from "react";
import { LucideIcon, Table2, ChartColumn } from "lucide-react";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";

export interface ChartLegendItem {
  label: string;
  color: string;
}

export interface ChartTable {
  columns: string[];
  rows: (string | number)[][];
}

// Card shell for an analytics chart, in the same look as BreakdownListCard:
// title, a legend for multi-series charts (so identity never rests on colour
// alone) and a table view of the same numbers for anyone who can't read the
// chart. Children render the chart itself.
const ChartCard = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  iconBgColor,
  legend,
  table,
  isLoading,
  isEmpty,
  emptyMessage,
  className = "",
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  legend?: ChartLegendItem[];
  table: ChartTable;
  isLoading: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  className?: string;
  children: React.ReactNode;
}) => {
  const [showTable, setShowTable] = useState(false);

  return (
    <div
      className={`flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 px-6 pt-4">
        <div className="flex min-w-0 items-start gap-2">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBgColor} ${iconColor}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {title}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          </div>
        </div>
        {!isLoading && !isEmpty && (
          <button
            type="button"
            onClick={() => setShowTable((shown) => !shown)}
            aria-pressed={showTable}
            title={showTable ? "Show chart" : "Show as table"}
            aria-label={showTable ? "Show chart" : "Show as table"}
            className="shrink-0 rounded-xl p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
          >
            {showTable ? (
              <ChartColumn className="h-4 w-4" />
            ) : (
              <Table2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {legend && legend.length > 1 && !isLoading && !isEmpty && !showTable && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 px-6 pt-3">
          {legend.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </li>
          ))}
        </ul>
      )}

      <div className="flex-1 px-4 pt-3 pb-4">
        {isLoading ? (
          <SkeletonBox className="h-64 w-full rounded-xl" />
        ) : isEmpty ? (
          <p className="px-2 pb-2 text-sm text-neutral-400 italic dark:text-neutral-500">
            {emptyMessage}
          </p>
        ) : showTable ? (
          <div className="default-scrollbar max-h-72 overflow-auto px-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  {table.columns.map((column, i) => (
                    <th
                      key={column}
                      scope="col"
                      className={`py-2 font-medium text-neutral-500 dark:text-neutral-400 ${i > 0 ? "text-right" : ""}`}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {table.rows.map((row) => (
                  <tr key={String(row[0])}>
                    {row.map((cell, i) => (
                      <td
                        key={i}
                        className={`py-2 text-neutral-800 dark:text-neutral-200 ${i > 0 ? "text-right tabular-nums" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartCard;
