"use client";
import ClientPortal from "../../ClientPortal";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { X, KeyRound, Plus, Trash2, UserRound } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { useAlertStore } from "@/store/useAlertStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { dateFormatter } from "@/public/assets";
import { FEATURES, FeatureKey } from "@/lib/FeatureAccess";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { UserRecord } from "../Users";
import CustomDropdown from "../EditModals/CustomDropDown";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpecialAccessGrant {
  id: number;
  user_id: string;
  username: string;
  email: string;
  feature: string;
  granted_at: string;
}

interface GrantFormData {
  userId: string;
  feature: FeatureKey;
}

type SpecialAccessModalProps = {
  isModalOpen: boolean;
  closeModal: () => void;
};

const featureLabel = (feature: string) =>
  feature.charAt(0).toUpperCase() + feature.slice(1);

// ─── Grant Sub-form ───────────────────────────────────────────────────────────

type GrantFormProps = {
  users: UserRecord[];
  onCancel: () => void;
  onSave: (data: GrantFormData) => void;
  isSaving: boolean;
};

const GrantForm = ({ users, onCancel, onSave, isSaving }: GrantFormProps) => {
  const [formData, setFormData] = useState<GrantFormData>({
    userId: "",
    feature: FEATURES.ANALYTICS,
  });

  const userOptions = users.map((user) => ({
    option: `${user.username} (${user.email})`,
    value: user.user_id,
  }));

  const featureOptions = Object.values(FEATURES).map((feature) => ({
    option: featureLabel(feature),
    value: feature,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId) return;
    onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        New Grant
      </p>

      {/* User */}
      <CustomDropdown
        label="User"
        options={userOptions}
        value={formData.userId}
        onChange={(val) => setFormData((prev) => ({ ...prev, userId: val }))}
      />

      {/* Feature */}
      <CustomDropdown
        label="Feature"
        options={featureOptions}
        value={formData.feature}
        onChange={(val) =>
          setFormData((prev) => ({ ...prev, feature: val as FeatureKey }))
        }
      />

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

const SpecialAccessModal = ({
  isModalOpen,
  closeModal,
}: SpecialAccessModalProps) => {
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement | null>(null);

  // UI state
  const [showAddForm, setShowAddForm] = useState(false);

  // Zustand
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  useFocusTrapping(modalRef, isModalOpen, closeModal);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const { data: grants = [], isLoading } = useQuery<SpecialAccessGrant[]>({
    queryKey: ["specialAccessData"],
    queryFn: async () => {
      const res = await apiClient.get("/superadmin/special-access");
      return res.data;
    },
    enabled: isModalOpen,
  });

  const { data: users = [] } = useQuery<UserRecord[]>({
    queryKey: ["UsersDataInfo"],
    queryFn: async () => {
      const res = await apiClient.get("/get-users");
      return res.data;
    },
    enabled: isModalOpen,
  });

  // ── Grant ──────────────────────────────────────────────────────────────────

  const { mutate: addRecord, isPending: isAdding } = useMutation({
    mutationFn: (data: GrantFormData) =>
      apiClient.post("/superadmin/special-access/grant", data),
    onMutate: () => showOverlay("Adding"),
    onSuccess: (res) => {
      setShowAddForm(false);
      triggerAlert(
        "success",
        res.data.message ?? "Access granted successfully",
      );
    },
    onError: (err) => triggerAlert("error", getApiErrorMessage(err)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["specialAccessData"] });
      hideOverlay();
    },
  });

  // ── Revoke ─────────────────────────────────────────────────────────────────

  const { mutate: deleteRecord } = useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`/superadmin/special-access/revoke`, {
        params: { id: id },
      }),
    onMutate: () => showOverlay("Deleting"),
    onSuccess: (res, id) => {
      queryClient.setQueryData(
        ["specialAccessData"],
        (old: SpecialAccessGrant[]) =>
          old ? old.filter((r) => r.id !== id) : old,
      );
      triggerAlert(
        "success",
        res.data.message ?? "Access revoked successfully",
      );
    },
    onError: (err) => triggerAlert("error", getApiErrorMessage(err)),
    onSettled: () => {
      hideOverlay();
    },
  });

  const handleRevokeClick = (grant: SpecialAccessGrant) => {
    triggerDialog({
      title: "Revoke Access",
      description: `Confirm revoking "${featureLabel(grant.feature)}" access from ${grant.username}.`,
      onConfirm: async () => {
        hideDialog();
        deleteRecord(grant.id);
      },
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div className="custom-blur fixed inset-0 z-50 bg-black/50 transition-opacity dark:bg-black/60" />

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
                Special Access
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Grant individual features to specific users
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddForm((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
              >
                <Plus className="h-3.5 w-3.5" />
                Grant Access
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
              <GrantForm
                users={users}
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
            ) : grants.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <KeyRound className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No special access grants found.
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Click <span className="font-medium">Grant Access</span> to get
                  started.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {grants.map((grant) => (
                  <div
                    key={grant.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <UserRound className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                        <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                          {grant.username}
                        </span>
                        <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                          ({grant.email})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          <KeyRound className="h-3 w-3" />
                          {featureLabel(grant.feature)}
                        </span>
                        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                          Granted {dateFormatter(grant.granted_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => handleRevokeClick(grant)}
                        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        title="Revoke"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
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

export default SpecialAccessModal;
