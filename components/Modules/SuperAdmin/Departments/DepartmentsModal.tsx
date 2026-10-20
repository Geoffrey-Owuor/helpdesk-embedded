"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Building2,
  Hash,
  Pencil,
  Plus,
  Power,
  PowerOff,
  UsersRound,
} from "lucide-react";
import FormAsterisk from "../../FormAsterisk";
import apiClient from "@/lib/AxiosClient";
import { useAlertStore } from "@/store/useAlertStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../../Modal/Modal";

// ─── Types ────────────────────────────────────────────────────────────────────

// Staff departments (public.departments) - the ones users belong to. The
// departments issues are raised to are the group emails (GroupEmailsModal).
interface DepartmentRecord {
  id: number;
  name: string;
  prefix: string;
  isActive: boolean;
  userCount: number;
}

type DepartmentsModalProps = {
  isModalOpen: boolean;
  closeModal: () => void;
};

const queryKey = ["superadminDepartments"];

const inputStyles =
  "w-full rounded-xl border border-neutral-300 bg-white py-2.5 pr-3.5 pl-9 text-sm text-neutral-900 shadow-sm transition-all duration-150 placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700";

const cancelButtonStyles =
  "rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-300 focus:outline-none sm:py-2 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700";

const saveButtonStyles =
  "rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus:ring-white dark:focus:ring-offset-neutral-950";

// Matches the server rule: 1-10 letters or digits, stored uppercase
const toPrefix = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 10);

// ─── Prefix input ─────────────────────────────────────────────────────────────

const PrefixInput = ({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="relative">
    <div className="absolute top-1/2 left-3.5 -translate-y-1/2">
      <Hash className="h-4 w-4 text-neutral-400" />
    </div>
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(toPrefix(e.target.value))}
      required
      placeholder="e.g. RTL"
      className={`${inputStyles} font-mono uppercase`}
    />
  </div>
);

// ─── Add form ─────────────────────────────────────────────────────────────────

const AddDepartmentForm = ({
  onCancel,
  onSave,
  isSaving,
}: {
  onCancel: () => void;
  onSave: (data: { name: string; prefix: string }) => void;
  isSaving: boolean;
}) => {
  const [name, setName] = useState("");
  const [prefix, setPrefix] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name: name.trim(), prefix });
      }}
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        New Department
      </p>

      <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="departmentName"
            className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Name
            <FormAsterisk />
          </label>
          <div className="relative">
            <div className="absolute top-1/2 left-3.5 -translate-y-1/2">
              <Building2 className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              id="departmentName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setName((value) => value.trim())}
              required
              maxLength={255}
              placeholder="e.g. Retail Projects"
              className={inputStyles}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="departmentPrefix"
            className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Issue Prefix
            <FormAsterisk />
          </label>
          <PrefixInput
            id="departmentPrefix"
            value={prefix}
            onChange={setPrefix}
          />
        </div>
      </div>

      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        The name can&apos;t be changed later - users and issues store it. The
        prefix starts issue references, e.g.{" "}
        <span className="font-mono">{prefix || "RTL"}-042</span>.
      </p>

      <div className="flex items-center justify-end gap-2.5 pt-1">
        <button type="button" onClick={onCancel} className={cancelButtonStyles}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving || !name.trim() || !prefix}
          className={saveButtonStyles}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
};

// ─── Prefix edit form ─────────────────────────────────────────────────────────

const EditPrefixForm = ({
  department,
  onCancel,
  onSave,
  isSaving,
}: {
  department: DepartmentRecord;
  onCancel: () => void;
  onSave: (prefix: string) => void;
  isSaving: boolean;
}) => {
  const [prefix, setPrefix] = useState(department.prefix);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(prefix);
      }}
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        {department.name} - Issue Prefix
      </p>
      <PrefixInput
        id={`prefix-${department.id}`}
        value={prefix}
        onChange={setPrefix}
      />
      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        Applies to new issues only - existing references keep{" "}
        <span className="font-mono">{department.prefix}</span>.
      </p>
      <div className="flex items-center justify-end gap-2.5">
        <button type="button" onClick={onCancel} className={cancelButtonStyles}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving || !prefix || prefix === department.prefix}
          className={saveButtonStyles}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

const DepartmentsModal = ({ isModalOpen, closeModal }: DepartmentsModalProps) => {
  const queryClient = useQueryClient();
  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Zustand
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const { data: departments = [], isLoading } = useQuery<DepartmentRecord[]>({
    queryKey,
    queryFn: async () => {
      const res = await apiClient.get("/superadmin/departments");
      return res.data;
    },
    enabled: isModalOpen,
  });

  // The department dropdowns across the app (hooks/useDepartmentOptions.ts)
  const refreshDepartments = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["DepartmentOptions"] });
    queryClient.invalidateQueries({ queryKey: ["AllDepartmentOptions"] });
  };

  // ── Add ────────────────────────────────────────────────────────────────────

  const { mutate: addDepartment, isPending: isAdding } = useMutation({
    mutationFn: (data: { name: string; prefix: string }) =>
      apiClient.post("/superadmin/departments/add-department", data),
    onMutate: () => showOverlay("Adding"),
    onSuccess: (res) => {
      setShowAddForm(false);
      triggerAlert("success", res.data.message);
    },
    onError: (err) => triggerAlert("error", getApiErrorMessage(err)),
    onSettled: () => {
      refreshDepartments();
      hideOverlay();
    },
  });

  // ── Edit ───────────────────────────────────────────────────────────────────

  const { mutate: editDepartment, isPending: isEditing } = useMutation({
    mutationFn: (data: { id: number; prefix?: string; isActive?: boolean }) =>
      apiClient.patch("/superadmin/departments/edit-department", data),
    onMutate: () => showOverlay("Updating"),
    onSuccess: (res, data) => {
      queryClient.setQueryData(queryKey, (old: DepartmentRecord[]) =>
        old?.map((record) =>
          record.id === data.id ? { ...record, ...data } : record,
        ),
      );
      setEditingId(null);
      triggerAlert("success", res.data.message);
    },
    onError: (err) => triggerAlert("error", getApiErrorMessage(err)),
    onSettled: () => {
      refreshDepartments();
      hideOverlay();
    },
  });

  const handleToggle = (department: DepartmentRecord) => {
    const isActive = !department.isActive;
    const users = `${department.userCount} active user${department.userCount === 1 ? "" : "s"}`;
    triggerDialog({
      title: isActive ? "Activate Department" : "Deactivate Department",
      description: isActive
        ? `${department.name} will be offered in department dropdowns again.`
        : `${department.name} won't be offered for new users or edits. Its ${users} keep it, and filters still list it.`,
      onConfirm: async () => {
        hideDialog();
        editDepartment({ id: department.id, isActive });
      },
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Modal open={isModalOpen} onClose={closeModal} size="lg">
      <ModalHeader
        title="Departments"
        description="Staff departments and their issue reference prefixes"
        actions={
          <button
            onClick={() => {
              setShowAddForm((v) => !v);
              setEditingId(null);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New
          </button>
        }
      />

      <ModalBody className="flex flex-col gap-4">
        {showAddForm && (
          <AddDepartmentForm
            onCancel={() => setShowAddForm(false)}
            onSave={(data) => addDepartment(data)}
            isSaving={isAdding}
          />
        )}

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <SkeletonBox key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Building2 className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No departments found.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {departments.map((department) =>
              editingId === department.id ? (
                <EditPrefixForm
                  key={department.id}
                  department={department}
                  onCancel={() => setEditingId(null)}
                  onSave={(prefix) =>
                    editDepartment({ id: department.id, prefix })
                  }
                  isSaving={isEditing}
                />
              ) : (
                <div
                  key={department.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900 ${
                    department.isActive ? "" : "opacity-60"
                  }`}
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                        {department.name}
                      </span>
                      <span className="rounded-md bg-neutral-200 px-1.5 py-0.5 font-mono text-[11px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        {department.prefix}
                      </span>
                      {!department.isActive && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <UsersRound className="h-3.5 w-3.5 shrink-0" />
                      {department.userCount} active user
                      {department.userCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(department.id);
                        setShowAddForm(false);
                      }}
                      className="rounded-lg p-2.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 sm:p-1.5 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                      title="Edit prefix"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggle(department)}
                      className={`rounded-lg p-2.5 text-neutral-400 transition-colors sm:p-1.5 ${
                        department.isActive
                          ? "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          : "hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                      }`}
                      title={department.isActive ? "Deactivate" : "Activate"}
                    >
                      {department.isActive ? (
                        <PowerOff className="h-3.5 w-3.5" />
                      ) : (
                        <Power className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <button onClick={closeModal} className={cancelButtonStyles}>
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default DepartmentsModal;
