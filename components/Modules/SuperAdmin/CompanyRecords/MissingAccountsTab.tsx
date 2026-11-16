"use client";
import { useState } from "react";
import { Building2, Mail, UserRoundCheck, UserRoundPlus } from "lucide-react";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import { indicatorChip, indicatorMuted } from "@/lib/indicatorStyles";
import {
  cardStyles,
  MissingAccount,
  plural,
  primaryButtonStyles,
} from "./shared";

type MissingAccountsTabProps = {
  accounts: MissingAccount[];
  isLoading: boolean;
  onAdd: (userIds: string[]) => void;
  isSaving: boolean;
};

// Active HelpDesk accounts with no staff record. Nothing is added without
// being ticked, so test or service accounts can be left out.
const MissingAccountsTab = ({
  accounts,
  isLoading,
  onAdd,
  isSaving,
}: MissingAccountsTabProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const eligible = accounts.filter((account) => account.departmentAvailable);
  // Accounts added since the last tick are gone from the list
  const chosen = eligible.filter((account) => selected.has(account.userId));
  const allChosen = eligible.length > 0 && chosen.length === eligible.length;

  const toggle = (userId: string) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (!next.delete(userId)) next.add(userId);
      return next;
    });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <SkeletonBox key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <UserRoundCheck className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Every active account has a staff record.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className={`text-sm ${indicatorMuted}`}>
        These active HelpDesk accounts have no staff record, so they
        aren&apos;t suggested when an issue is submitted for a user. Tick the
        ones to add - the record takes the account&apos;s name, email and
        department.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={allChosen}
            disabled={eligible.length === 0}
            onChange={() =>
              setSelected(
                allChosen
                  ? new Set()
                  : new Set(eligible.map((account) => account.userId)),
              )
            }
            className="h-4 w-4 accent-neutral-900 dark:accent-white"
          />
          Select all ({eligible.length})
        </label>
        <button
          type="button"
          disabled={isSaving || chosen.length === 0}
          onClick={() => onAdd(chosen.map((account) => account.userId))}
          className={primaryButtonStyles}
        >
          <UserRoundPlus className="h-4 w-4" />
          {chosen.length > 0
            ? `Add ${plural(chosen.length, "record")}`
            : "Add selected"}
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {accounts.map((account) => (
          <li key={account.userId}>
            <label
              className={`flex items-start gap-3 px-4 py-3 ${cardStyles} ${
                account.departmentAvailable
                  ? "cursor-pointer"
                  : "cursor-not-allowed"
              }`}
            >
              <input
                type="checkbox"
                checked={
                  account.departmentAvailable && selected.has(account.userId)
                }
                disabled={!account.departmentAvailable}
                onChange={() => toggle(account.userId)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-neutral-900 dark:accent-white"
              />
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                    {account.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${indicatorChip}`}
                  >
                    {account.role}
                  </span>
                </div>
                <div
                  className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${indicatorMuted}`}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{account.email}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    {account.department}
                  </span>
                </div>
                {!account.departmentAvailable && (
                  <p className="text-xs text-amber-700 dark:text-amber-500">
                    {account.department} isn&apos;t an active department. Change
                    this user&apos;s department in Edit User first.
                  </p>
                )}
              </div>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MissingAccountsTab;
