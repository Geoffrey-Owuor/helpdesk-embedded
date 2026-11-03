"use client";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Keep in step with the w-72 and w-32 classes below
const CALENDAR_WIDTH = 288;
const CALENDAR_HEIGHT = 360;
const LIST_WIDTH = 128;
const EDGE_MARGIN = 8;

type PopoverAlign = "start" | "end" | "center";

const POPOVER_ALIGN: Record<PopoverAlign, string> = {
  start: "left-0",
  end: "right-0",
  center: "left-1/2 -translate-x-1/2",
};

// The space a popover can use before it's cut off: the viewport, narrowed by
// every ancestor that clips or scrolls (#main-content, a modal)
function getClipBounds(element: HTMLElement) {
  const root = document.documentElement;
  let left = 0;
  let top = 0;
  let right = root.clientWidth;
  let bottom = root.clientHeight;
  for (
    let el = element.parentElement;
    el && el !== root;
    el = el.parentElement
  ) {
    const { overflowX, overflowY } = getComputedStyle(el);
    if (overflowX === "visible" && overflowY === "visible") continue;
    const rect = el.getBoundingClientRect();
    left = Math.max(left, rect.left + el.clientLeft);
    top = Math.max(top, rect.top + el.clientTop);
    right = Math.min(right, rect.left + el.clientLeft + el.clientWidth);
    bottom = Math.min(bottom, rect.top + el.clientTop + el.clientHeight);
  }
  return {
    left: left + EDGE_MARGIN,
    top: top + EDGE_MARGIN,
    right: right - EDGE_MARGIN,
    bottom: bottom - EDGE_MARGIN,
  };
}

// Which of the trigger's edges a wider popover should open from to stay inside
// the bounds: the preferred alignment if it fits, else the edge that overflows
// least
function getPopoverAlign(
  trigger: HTMLElement,
  width: number,
  preferred: "start" | "center",
): PopoverAlign {
  const rect = trigger.getBoundingClientRect();
  const bounds = getClipBounds(trigger);
  const center = rect.left + rect.width / 2;
  if (
    preferred === "center" &&
    center - width / 2 >= bounds.left &&
    center + width / 2 <= bounds.right
  ) {
    return "center";
  }
  const startOverflow = rect.left + width - bounds.right;
  if (startOverflow <= 0) return "start";
  const endOverflow = bounds.left - (rect.right - width);
  return endOverflow < startOverflow ? "end" : "start";
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface CustomDropdownProps {
  options: { label: string; value: number }[];
  value: number;
  onChange: (value: number) => void;
}

function CustomDropdown({ options, value, onChange }: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const [align, setAlign] = useState<PopoverAlign>("center");
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const toggleOpen = () => {
    if (!open && ref.current) {
      setAlign(getPopoverAlign(ref.current, LIST_WIDTH, "center"));
    }
    setOpen((o) => !o);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll selected item into view when dropdown opens
  useEffect(() => {
    if (open && listRef.current) {
      const selected = listRef.current.querySelector("[data-selected='true']");
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="flex items-center gap-1 rounded-lg px-1.5 py-1 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-blue-500 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        {selectedLabel}
        <ChevronDown
          size={12}
          className={`mt-px text-neutral-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          className={`default-scrollbar absolute top-full z-60 mt-1 max-h-48 w-32 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 ${POPOVER_ALIGN[align]}`}
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  data-selected={isActive}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                    isActive
                      ? "bg-blue-500 font-medium text-white"
                      : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [align, setAlign] = useState<PopoverAlign>("start");
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const [viewDate, setViewDate] = useState(() => {
    return value ? new Date(value + "T00:00:00") : new Date();
  });

  const ref = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const today = new Date();

  const toggleOpen = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const bounds = getClipBounds(ref.current);
      const below = bounds.bottom - rect.bottom;
      const above = rect.top - bounds.top;
      setPlacement(below < CALENDAR_HEIGHT && above > below ? "top" : "bottom");
      setAlign(getPopoverAlign(ref.current, CALENDAR_WIDTH, "start"));
    }
    setOpen((o) => !o);
  };

  // When the calendar fits neither above nor below the input (a short window),
  // slide it back inside the bounds rather than letting its header be cut off.
  // It may then cover the input. React doesn't own this style, so a re-render
  // (changing month) keeps it.
  useLayoutEffect(() => {
    const popover = popoverRef.current;
    if (!open || !popover) return;
    popover.style.transform = "";
    const bounds = getClipBounds(popover);
    const { top, bottom } = popover.getBoundingClientRect();
    let shift = 0;
    if (top < bounds.top) shift = bounds.top - top;
    else if (bottom > bounds.bottom) {
      shift = Math.max(bounds.bottom - bottom, bounds.top - top);
    }
    popover.style.transform = shift ? `translateY(${Math.round(shift)}px)` : "";
  }, [open, placement]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (value)
      Promise.resolve().then(() => setViewDate(new Date(value + "T00:00:00")));
  }, [value]);

  const selected = value ? new Date(value + "T00:00:00") : null;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthOptions = MONTHS.map((label, i) => ({ label, value: i }));
  const yearOptions = Array.from({ length: 101 }, (_, i) => {
    const y = today.getFullYear() - 50 + i;
    return { label: String(y), value: y };
  });

  const selectDay = (day: number) => {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(iso);
    setOpen(false);
  };

  const displayValue = selected
    ? selected.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const isSelected = (day: number) =>
    !!selected &&
    day === selected.getDate() &&
    month === selected.getMonth() &&
    year === selected.getFullYear();

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative flex items-center">
        <input
          readOnly
          value={displayValue}
          placeholder={placeholder}
          onClick={toggleOpen}
          className="h-10 w-full cursor-pointer rounded-xl border border-neutral-300 bg-white py-2 pr-10 pl-3 text-sm text-neutral-600 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-12 cursor-pointer rounded-full p-0.5 hover:bg-neutral-300 dark:hover:bg-neutral-700"
          >
            <X className="h-3 w-3 text-neutral-500" />
          </button>
        )}
        <button
          type="button"
          onClick={toggleOpen}
          className="absolute right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          tabIndex={-1}
        >
          <CalendarDays size={16} />
        </button>
      </div>

      {open && (
        <div
          ref={popoverRef}
          className={`absolute z-50 w-72 rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-950 ${POPOVER_ALIGN[align]} ${
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Custom dropdowns for Month and Year */}
            <div className="flex items-center gap-0.5">
              <CustomDropdown
                options={monthOptions}
                value={month}
                onChange={(m) => setViewDate(new Date(year, m, 1))}
              />
              <CustomDropdown
                options={yearOptions}
                value={year}
                onChange={(y) => setViewDate(new Date(y, month, 1))}
              />
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-xs font-medium text-neutral-400"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const sel = isSelected(day);
              const tod = isToday(day);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`flex h-8 w-full items-center justify-center rounded-lg text-sm transition ${
                    sel
                      ? "bg-blue-500 font-medium text-white"
                      : tod
                        ? "font-medium text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => {
                const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                onChange(iso);
                setOpen(false);
              }}
              className="w-full rounded-lg py-1.5 text-sm text-blue-500 transition hover:bg-blue-50 dark:hover:bg-blue-500/10"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
