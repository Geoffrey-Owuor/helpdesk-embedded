// Quick date ranges for the analytics filter panel - the calendar-month view
// the monthly helpdesk dashboard reports on. Values are local yyyy-mm-dd
// strings, the same format the DatePicker produces.

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const DATE_PRESETS = [
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "last3Months", label: "Last 3 months" },
  { value: "last12Months", label: "Last 12 months" },
  { value: "thisYear", label: "This year" },
] as const;

export type DatePreset = (typeof DATE_PRESETS)[number]["value"];

export const datePresetRange = (
  preset: DatePreset,
  today = new Date(),
): { fromDate: string; toDate: string } => {
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayIso = toIsoDate(today);

  switch (preset) {
    case "thisMonth":
      return {
        fromDate: toIsoDate(new Date(year, month, 1)),
        toDate: todayIso,
      };
    case "lastMonth":
      return {
        fromDate: toIsoDate(new Date(year, month - 1, 1)),
        // Day 0 of this month is the last day of the previous one
        toDate: toIsoDate(new Date(year, month, 0)),
      };
    case "last3Months":
      return {
        fromDate: toIsoDate(new Date(year, month - 2, 1)),
        toDate: todayIso,
      };
    case "last12Months":
      return {
        fromDate: toIsoDate(new Date(year, month - 11, 1)),
        toDate: todayIso,
      };
    case "thisYear":
      return { fromDate: toIsoDate(new Date(year, 0, 1)), toDate: todayIso };
  }
};

// The preset a range matches, so the quick-range control can show it as selected
export const matchingDatePreset = (fromDate: string, toDate: string) =>
  DATE_PRESETS.find(({ value }) => {
    const range = datePresetRange(value);
    return range.fromDate === fromDate && range.toDate === toDate;
  })?.value ?? "";
