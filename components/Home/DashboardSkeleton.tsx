import {
  LayoutDashboard,
  Settings,
  Bell,
  Bot,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";

// ─── Pulse skeleton primitive ─────────────────────────────────────────────────

interface SkProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: "slow" | "mid" | "fast";
}

function Sk({ className, speed = "mid", style, ...props }: SkProps) {
  const durationMap = {
    slow: "2.4s",
    mid: "2s",
    fast: "1.5s",
  };
  const delayMap = {
    slow: "0s",
    mid: "0.3s",
    fast: "0.6s",
  };

  return (
    <div
      className={`rounded bg-neutral-200 dark:bg-neutral-700 ${className || ""}`}
      style={{
        animation: `pulse ${durationMap[speed]} ease-in-out ${delayMap[speed]} infinite`,
        ...style,
      }}
      {...props}
    />
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const navIcons = [
  { Icon: LayoutDashboard, active: true },
  { Icon: PlusCircle },
  { Icon: Bot },
  { Icon: ShieldCheck },
];

function Sidebar() {
  return (
    <aside className="flex w-14 min-w-14 flex-col items-center border-r border-neutral-200 bg-neutral-50 py-4 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Brand mark */}
      <Sk
        speed="slow"
        className="mb-6 h-7 w-7 rounded-lg bg-neutral-300 dark:bg-neutral-600"
      />

      {/* Nav icons */}
      <nav className="flex flex-1 flex-col items-center gap-4">
        {navIcons.map(({ Icon, active }, i) => (
          <div
            key={i}
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              active
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            <Icon size={16} strokeWidth={1.75} />
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex flex-col items-center gap-3">
        <Bell
          size={16}
          strokeWidth={1.75}
          className="text-neutral-400 dark:text-neutral-500"
        />
        <Settings
          size={16}
          strokeWidth={1.75}
          className="text-neutral-400 dark:text-neutral-500"
        />
        <Sk speed="slow" className="h-8 w-8 rounded-full" />
      </div>
    </aside>
  );
}

function StatCard({ speed }: { speed: SkProps["speed"] }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Sk speed={speed} className="h-2 w-14" />
        <Sk speed={speed} className="h-5 w-5 rounded-full" />
      </div>
      {/* Value */}
      <Sk speed={speed} className="h-5 w-20" />
      {/* Badge + label */}
      <div className="flex items-center gap-1.5">
        <Sk speed={speed} className="h-2 w-4 rounded-sm" />
        <Sk speed={speed} className="h-2 w-12" />
      </div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

const TABLE_ROWS: Array<[SkProps["speed"], string[], string[], string[]]> = [
  ["slow", ["85%", "70%", "60%"], ["65%"], ["40%"]],
  ["mid", ["60%", "80%", "50%"], ["45%"], ["55%"]],
  ["fast", ["75%", "55%", "70%"], ["80%"], ["35%"]],
  ["slow", ["50%", "65%", "45%"], ["50%"], ["60%"]],
  ["slow", ["50%", "65%", "45%"], ["50%"], ["60%"]],
];

function TableSection() {
  return (
    <div className="flex flex-1 flex-col gap-2.5 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <Sk speed="slow" className="h-2.5 w-20" />
        <div className="flex gap-2">
          <Sk speed="mid" className="h-6 w-12 rounded-lg" />
          <Sk speed="fast" className="h-6 w-12 rounded-lg" />
        </div>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr] border-b border-neutral-200 p-2 dark:border-neutral-800">
        {["70%", "60%", "50%", "55%", "45%"].map((w, i) => (
          <Sk key={i} speed="slow" className="h-2" style={{ width: w }} />
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {TABLE_ROWS.map(([speed], i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr] items-center border-b border-neutral-200 py-2.5 last:border-0 dark:border-neutral-800"
          >
            {/* Col 1 — avatar + label */}
            <div className="flex items-center gap-2">
              <Sk speed={speed} className="h-6 w-6 min-w-6 rounded-full" />
              <Sk
                speed={speed}
                className="h-2"
                style={{ width: ["85%", "60%", "75%", "50%", "90%", "65%"][i] }}
              />
            </div>
            {/* Col 2 */}
            <Sk
              speed={speed}
              className="h-2"
              style={{ width: ["70%", "80%", "55%", "65%", "75%", "50%"][i] }}
            />
            {/* Col 3 */}
            <Sk
              speed={speed}
              className="h-2"
              style={{ width: ["60%", "50%", "70%", "45%", "55%", "80%"][i] }}
            />
            {/* Col 4 — pill / status */}
            <Sk
              speed={speed}
              className="h-5 rounded-full"
              style={{ width: ["65%", "45%", "80%", "50%", "70%", "40%"][i] }}
            />
            {/* Col 5 */}
            <Sk
              speed={speed}
              className="h-2"
              style={{ width: ["40%", "55%", "35%", "60%", "45%", "50%"][i] }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function DashboardSkeleton() {
  return (
    <div className="mx-auto mt-16 max-w-4xl">
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        {/* Window chrome */}
        <div className="flex h-9 items-center gap-1.5 border-b border-neutral-100 bg-neutral-50 px-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          <div className="ml-auto flex gap-2">
            <Sk speed="slow" className="h-4 w-16 rounded-md" />
            <Sk speed="mid" className="h-4 w-4 rounded-md" />
          </div>
        </div>

        {/* Body */}
        <div className="flex" style={{ height: 480 }}>
          <Sidebar />

          {/* Main content */}
          <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard speed="slow" />
              <StatCard speed="mid" />
              <StatCard speed="slow" />
              <StatCard speed="fast" />
            </div>

            {/* Table */}
            <TableSection />
          </div>
        </div>
      </div>
    </div>
  );
}
