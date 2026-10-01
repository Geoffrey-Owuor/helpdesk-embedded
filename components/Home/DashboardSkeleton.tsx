import {
  LayoutDashboard,
  Settings,
  Bell,
  Bot,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";

// ─── Skeleton primitive ───────────────────────────────────────────────────────

// Deliberately static: this preview is decorative and always on screen, and ~66
// infinite pulse animations kept the GPU busy and cost fps while scrolling on 4K.
function Sk({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded bg-neutral-200 dark:bg-neutral-700 ${className || ""}`}
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
      <Sk className="mb-6 h-7 w-7 rounded-lg bg-neutral-300 dark:bg-neutral-600" />

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
        <Sk className="h-8 w-8 rounded-full" />
      </div>
    </aside>
  );
}

function StatCard() {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <Sk className="h-2 w-14" />
        <Sk className="h-5 w-5 rounded-full" />
      </div>
      {/* Value */}
      <Sk className="h-5 w-20" />
      {/* Badge + label */}
      <div className="flex items-center gap-1.5">
        <Sk className="h-2 w-4 rounded-sm" />
        <Sk className="h-2 w-12" />
      </div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

const TABLE_ROW_COUNT = 5;

function TableSection() {
  return (
    <div className="flex flex-1 flex-col gap-2.5 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <Sk className="h-2.5 w-20" />
        <div className="flex gap-2">
          <Sk className="h-6 w-12 rounded-lg" />
          <Sk className="h-6 w-12 rounded-lg" />
        </div>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr] border-b border-neutral-200 p-2 dark:border-neutral-800">
        {["70%", "60%", "50%", "55%", "45%"].map((w, i) => (
          <Sk key={i} className="h-2" style={{ width: w }} />
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        {Array.from({ length: TABLE_ROW_COUNT }, (_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1.2fr_1fr_1fr_0.8fr] items-center border-b border-neutral-200 py-2.5 last:border-0 dark:border-neutral-800"
          >
            {/* Col 1 — avatar + label */}
            <div className="flex items-center gap-2">
              <Sk className="h-6 w-6 min-w-6 rounded-full" />
              <Sk
                className="h-2"
                style={{ width: ["85%", "60%", "75%", "50%", "90%", "65%"][i] }}
              />
            </div>
            {/* Col 2 */}
            <Sk
              className="h-2"
              style={{ width: ["70%", "80%", "55%", "65%", "75%", "50%"][i] }}
            />
            {/* Col 3 */}
            <Sk
              className="h-2"
              style={{ width: ["60%", "50%", "70%", "45%", "55%", "80%"][i] }}
            />
            {/* Col 4 — pill / status */}
            <Sk
              className="h-5 rounded-full"
              style={{ width: ["65%", "45%", "80%", "50%", "70%", "40%"][i] }}
            />
            {/* Col 5 */}
            <Sk
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
            <Sk className="h-4 w-16 rounded-md" />
            <Sk className="h-4 w-4 rounded-md" />
          </div>
        </div>

        {/* Body */}
        <div className="flex" style={{ height: 480 }}>
          <Sidebar />

          {/* Main content */}
          <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard />
              <StatCard />
              <StatCard />
              <StatCard />
            </div>

            {/* Table */}
            <TableSection />
          </div>
        </div>
      </div>
    </div>
  );
}
