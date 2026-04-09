"use client";
import ClientPortal from "../../ClientPortal";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, FocusEvent } from "react";
import { X, Mail, Plus, Building2, Trash2, Pencil } from "lucide-react";
import FormAsterisk from "../../FormAsterisk";
import apiClient from "@/lib/AxiosClient";
import { useAlertStore } from "@/store/useAlertStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroupEmail {
  id: number;
  emails: string;
  department: string;
}

interface GroupEmailFormData {
  emails: string;
  department: string;
}

type GroupEmailsModalProps = {
  isModalOpen: boolean;
  closeModal: () => void;
};

// ─── Add / Edit Sub-form ──────────────────────────────────────────────────────

type RecordFormProps = {
  initial?: GroupEmailFormData;
  onCancel: () => void;
  onSave: (data: GroupEmailFormData) => void;
  isSaving: boolean;
};

const RecordForm = ({
  initial,
  onCancel,
  onSave,
  isSaving,
}: RecordFormProps) => {
  const [formData, setFormData] = useState<GroupEmailFormData>(
    initial ?? { emails: "", department: "" },
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        {initial ? "Edit Record" : "New Record"}
      </p>

      {/* Department */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="department"
          className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Department
          <FormAsterisk />
        </label>
        <div className="relative">
          <div className="absolute top-1/2 left-3.5 -translate-y-1/2">
            <Building2 className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            id="department"
            name="department"
            type="text"
            value={formData.department}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            placeholder="e.g. Engineering"
            className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pr-3.5 pl-9 text-sm text-neutral-900 shadow-sm transition-all duration-150 placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
          />
        </div>
      </div>

      {/* Emails */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="emails"
          className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Email(s)
          <FormAsterisk />
        </label>
        <div className="relative">
          <div className="absolute top-1/2 left-3.5 -translate-y-1/2">
            <Mail className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            id="emails"
            name="emails"
            type="text"
            value={formData.emails}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            placeholder="email1@hotpoint.co.ke, email2@hotpoint.co.ke"
            className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pr-3.5 pl-9 text-sm text-neutral-900 shadow-sm transition-all duration-150 placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
          />
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Separate multiple emails with a comma
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-300 focus:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus:ring-white dark:focus:ring-offset-neutral-950"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

const GroupEmailsModal = ({
  isModalOpen,
  closeModal,
}: GroupEmailsModalProps) => {
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement | null>(null);

  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Zustand
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  useFocusTrapping(modalRef, isModalOpen, closeModal);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const { data: groupEmails = [], isLoading } = useQuery<GroupEmail[]>({
    queryKey: ["groupEmailsData"],
    queryFn: async () => {
      const res = await apiClient.get("/superadmin/group-emails"); // TODO: implement
      return res.data;
    },
    enabled: isModalOpen,
  });

  // ── Add ────────────────────────────────────────────────────────────────────

  const { mutate: addRecord, isPending: isAdding } = useMutation({
    mutationFn: (data: GroupEmailFormData) =>
      apiClient.post("/superadmin/group-emails/post-email", data),
    onMutate: () => showOverlay("Adding"),
    onSuccess: (res, data) => {
      const optimistic: GroupEmail = { id: Date.now(), ...data };
      queryClient.setQueryData(["groupEmailsData"], (old: GroupEmail[]) =>
        old ? [optimistic, ...old] : [optimistic],
      );
      setShowAddForm(false);
      triggerAlert("success", res.data.message ?? "Record added successfully");
    },
    onError: (err) => triggerAlert("error", getApiErrorMessage(err)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["groupEmailsData"] });
      hideOverlay();
    },
  });

  // ── Edit ───────────────────────────────────────────────────────────────────

  const { mutate: editRecord, isPending: isEditing } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: GroupEmailFormData }) =>
      apiClient.patch(`/superadmin/group-emails/edit-email`, { id, data }), // TODO: implement - was here
    onMutate: () => showOverlay("Updating"),
    onSuccess: (res, { id, data }) => {
      queryClient.setQueryData(["groupEmailsData"], (old: GroupEmail[]) =>
        old ? old.map((r) => (r.id === id ? { ...r, ...data } : r)) : old,
      );
      setEditingId(null);
      triggerAlert(
        "success",
        res.data.message ?? "Record updated successfully",
      );
    },
    onError: (err) => triggerAlert("error", getApiErrorMessage(err)),
    onSettled: () => {
      hideOverlay();
    },
  });

  // ── Delete ─────────────────────────────────────────────────────────────────

  const { mutate: deleteRecord } = useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/superadmin/group-emails/delete-email`, {
        params: { id: id },
      }), // TODO: implement
    onMutate: () => showOverlay("Deleting"),
    onSuccess: (res, id) => {
      queryClient.setQueryData(["groupEmailsData"], (old: GroupEmail[]) =>
        old ? old.filter((r) => r.id !== id) : old,
      );
      triggerAlert(
        "success",
        res.data.message ?? "Record deleted successfully",
      );
    },
    onError: (err) => triggerAlert("error", getApiErrorMessage(err)),
    onSettled: () => {
      hideOverlay();
    },
  });

  const handleDeleteClick = (id: number) => {
    triggerDialog({
      title: "Delete Group Email",
      description: "Confirm deletion of the selected record.",
      onConfirm: async () => {
        hideDialog();
        deleteRecord(id);
      },
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity dark:bg-black/60" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4"
      >
        <div className="flex max-h-[85vh] w-full flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Departments
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Manage departments info
              </p>
            </div>
            <div className="flex items-center gap-2">
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
              <button
                onClick={closeModal}
                className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="layout-scrollbar flex flex-col gap-4 overflow-y-auto px-6 py-5">
            {/* Add form */}
            {showAddForm && (
              <RecordForm
                onCancel={() => setShowAddForm(false)}
                onSave={(data) => addRecord(data)}
                isSaving={isAdding}
              />
            )}

            {/* Records list */}
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[...Array(3)].map((_, i) => (
                  <SkeletonBox key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : groupEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Mail className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No group emails found.
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Click <span className="font-medium">Add New</span> to get
                  started.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {groupEmails.map((record) =>
                  editingId === record.id ? (
                    <RecordForm
                      key={record.id}
                      initial={{
                        emails: record.emails,
                        department: record.department,
                      }}
                      onCancel={() => setEditingId(null)}
                      onSave={(data) => editRecord({ id: record.id, data })}
                      isSaving={isEditing}
                    />
                  ) : (
                    <div
                      key={record.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                          <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                            {record.department}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                          <span className="text-xs break-all text-neutral-500 dark:text-neutral-400">
                            {record.emails}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingId(record.id);
                            setShowAddForm(false);
                          }}
                          className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(record.id)}
                          className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-neutral-100 px-6 py-4 dark:border-neutral-800">
            <button
              onClick={closeModal}
              className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-300 focus:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

export default GroupEmailsModal;
