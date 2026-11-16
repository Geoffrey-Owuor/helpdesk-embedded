"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { useAlertStore } from "@/store/useAlertStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../../Modal/Modal";
import RecordsTab from "./RecordsTab";
import MissingAccountsTab from "./MissingAccountsTab";
import {
  cancelButtonStyles,
  RecordDetails,
  recordsQueryKey,
  StaffRecord,
  StaffRecordsData,
} from "./shared";

type CompanyRecordsModalProps = {
  isModalOpen: boolean;
  closeModal: () => void;
};

type Tab = "records" | "missing";

// Staff records (public.company_user_records): the people an issue can be
// submitted for. Records are added, edited and deactivated here - never
// deleted - and none of it touches a HelpDesk account the person has.
const CompanyRecordsModal = ({
  isModalOpen,
  closeModal,
}: CompanyRecordsModalProps) => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("records");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  const { data, isLoading } = useQuery<StaffRecordsData>({
    queryKey: recordsQueryKey,
    queryFn: async () => {
      const res = await apiClient.get("/superadmin/company-records");
      return res.data;
    },
    enabled: isModalOpen,
  });

  const records = data?.records ?? [];
  const missingAccounts = data?.missingAccounts ?? [];

  // Every change reloads the list, and the "submit for a user" autocomplete
  // (UserEmailAutocomplete) that reads the same records
  const mutationHandlers = (
    overlay: "Adding" | "Updating",
    onDone?: () => void,
  ) => ({
    onMutate: () => showOverlay(overlay),
    onSuccess: (res: { data: { message: string } }) => {
      onDone?.();
      triggerAlert("success", res.data.message);
    },
    onError: (err: unknown) => triggerAlert("error", getApiErrorMessage(err)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: recordsQueryKey });
      queryClient.invalidateQueries({ queryKey: ["CompanyUserRecordsData"] });
      hideOverlay();
    },
  });

  const { mutate: addRecord, isPending: isAdding } = useMutation({
    mutationFn: (details: RecordDetails) =>
      apiClient.post("/superadmin/company-records/add-record", details),
    ...mutationHandlers("Adding", () => setShowAddForm(false)),
  });

  const { mutate: editRecord, isPending: isEditing } = useMutation({
    mutationFn: (
      changes: { id: number } & (RecordDetails | { isActive: boolean }),
    ) => apiClient.patch("/superadmin/company-records/edit-record", changes),
    ...mutationHandlers("Updating", () => setEditingId(null)),
  });

  const { mutate: addMissing, isPending: isAddingMissing } = useMutation({
    mutationFn: (userIds: string[]) =>
      apiClient.post("/superadmin/company-records/add-missing", { userIds }),
    ...mutationHandlers("Adding"),
  });

  const handleToggle = (record: StaffRecord) => {
    const isActive = !record.isActive;
    triggerDialog({
      title: isActive ? "Activate Staff Record" : "Deactivate Staff Record",
      description: isActive
        ? `${record.name} will be suggested again when an issue is submitted for a user.`
        : `${record.name} will no longer be suggested when an issue is submitted for a user, and no account will be created from this record.${
            record.hasAccount
              ? " Their HelpDesk account is not affected - deactivate it from the Users table if needed."
              : ""
          }`,
      onConfirm: async () => {
        hideDialog();
        editRecord({ id: record.id, isActive });
      },
    });
  };

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "records", label: "Records", count: records.length },
    {
      value: "missing",
      label: "Missing from records",
      count: missingAccounts.length,
    },
  ];

  return (
    <Modal open={isModalOpen} onClose={closeModal} size="3xl" fixedHeight>
      <ModalHeader
        title="Staff Records"
        description="The people an issue can be submitted for"
        actions={
          tab === "records" && (
            <button
              type="button"
              onClick={() => {
                setShowAddForm((value) => !value);
                setEditingId(null);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              <Plus className="h-3.5 w-3.5" />
              Add New
            </button>
          )
        }
      />

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Staff records sections"
        className="flex shrink-0 gap-1 overflow-x-auto overflow-y-hidden border-b border-neutral-200 px-4 sm:px-6 dark:border-neutral-800"
      >
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => setTab(item.value)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              tab === item.value
                ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {item.label}
            {!isLoading && (
              <span className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <ModalBody>
        {tab === "records" && (
          <RecordsTab
            records={records}
            isLoading={isLoading}
            showAddForm={showAddForm}
            closeAddForm={() => setShowAddForm(false)}
            editingId={editingId}
            setEditingId={(id) => {
              setEditingId(id);
              setShowAddForm(false);
            }}
            onAdd={(details) => addRecord(details)}
            onEdit={(id, details) => editRecord({ id, ...details })}
            onToggle={handleToggle}
            isSaving={isAdding || isEditing}
          />
        )}
        {tab === "missing" && (
          <MissingAccountsTab
            accounts={missingAccounts}
            isLoading={isLoading}
            onAdd={(userIds) => addMissing(userIds)}
            isSaving={isAddingMissing}
          />
        )}
      </ModalBody>

      <ModalFooter>
        <button type="button" onClick={closeModal} className={cancelButtonStyles}>
          Close
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default CompanyRecordsModal;
