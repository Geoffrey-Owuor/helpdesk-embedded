"use client";
import { useMemo, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Pencil,
  Power,
  PowerOff,
  Search,
  UserRoundSearch,
  X,
} from "lucide-react";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { indicatorChip, indicatorMuted } from "@/lib/indicatorStyles";
import RecordForm from "./RecordForm";
import { cardStyles, plural, RecordDetails, StaffRecord } from "./shared";

type StatusFilter = "all" | "active" | "inactive";

const PAGE_SIZE = 25;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

type RecordsTabProps = {
  records: StaffRecord[];
  isLoading: boolean;
  showAddForm: boolean;
  closeAddForm: () => void;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  onAdd: (details: RecordDetails) => void;
  onEdit: (id: number, details: RecordDetails) => void;
  onToggle: (record: StaffRecord) => void;
  isSaving: boolean;
};

const RecordsTab = ({
  records,
  isLoading,
  showAddForm,
  closeAddForm,
  editingId,
  setEditingId,
  onAdd,
  onEdit,
  onToggle,
  isSaving,
}: RecordsTabProps) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter(
      (record) =>
        (status === "all" || record.isActive === (status === "active")) &&
        (!term ||
          record.name.toLowerCase().includes(term) ||
          record.email.includes(term) ||
          record.department.toLowerCase().includes(term)),
    );
  }, [records, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // A deactivation or a narrower search can leave the page past the end
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(firstIndex, firstIndex + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      {showAddForm && (
        <RecordForm onCancel={closeAddForm} onSave={onAdd} isSaving={isSaving} />
      )}

      {/* Search and status filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email or department"
            aria-label="Search staff records"
            className="h-10 w-full rounded-xl border border-neutral-300 bg-white pr-9 pl-9 text-sm transition-all outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Filter by status"
          className="inline-flex items-center gap-1 rounded-2xl border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-950"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={status === filter.value}
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                status === filter.value
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonBox key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <UserRoundSearch className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {records.length === 0
              ? "No staff records yet."
              : "No staff records match."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((record) =>
            editingId === record.id ? (
              <li key={record.id}>
                <RecordForm
                  record={record}
                  onCancel={() => setEditingId(null)}
                  onSave={(details) => onEdit(record.id, details)}
                  isSaving={isSaving}
                />
              </li>
            ) : (
              <li
                key={record.id}
                className={`flex items-center justify-between gap-3 px-4 py-3 ${cardStyles} ${
                  record.isActive ? "" : "opacity-60"
                }`}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      {record.name}
                    </span>
                    {!record.isActive && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        Inactive
                      </span>
                    )}
                    {record.hasAccount && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${indicatorChip}`}
                      >
                        Has account
                      </span>
                    )}
                  </div>
                  <div
                    className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${indicatorMuted}`}
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{record.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      {record.department}
                      {!record.departmentKnown && (
                        <span className="text-amber-700 dark:text-amber-500">
                          (not in Departments)
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingId(record.id)}
                    className="rounded-lg p-2.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 sm:p-1.5 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                    title="Edit"
                    aria-label={`Edit ${record.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggle(record)}
                    className={`rounded-lg p-2.5 text-neutral-400 transition-colors sm:p-1.5 ${
                      record.isActive
                        ? "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        : "hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                    }`}
                    title={record.isActive ? "Deactivate" : "Activate"}
                    aria-label={`${record.isActive ? "Deactivate" : "Activate"} ${record.name}`}
                  >
                    {record.isActive ? (
                      <PowerOff className="h-3.5 w-3.5" />
                    ) : (
                      <Power className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {/* Pages */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className={`text-xs ${indicatorMuted}`}>
            {firstIndex + 1}-{firstIndex + visible.length} of{" "}
            {plural(filtered.length, "record")}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordsTab;
