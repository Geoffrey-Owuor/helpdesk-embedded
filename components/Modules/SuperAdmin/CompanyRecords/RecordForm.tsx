"use client";
import { useState } from "react";
import { Mail, UserRound } from "lucide-react";
import FormAsterisk from "../../FormAsterisk";
import CustomDropdown from "../EditModals/CustomDropDown";
import { useDepartmentOptions } from "@/hooks/useDepartmentOptions";
import {
  cancelButtonStyles,
  cardStyles,
  inputStyles,
  labelStyles,
  primaryButtonStyles,
  RecordDetails,
  StaffRecord,
} from "./shared";

type RecordFormProps = {
  // The record being edited; absent when adding one
  record?: StaffRecord;
  onCancel: () => void;
  onSave: (details: RecordDetails) => void;
  isSaving: boolean;
};

// Same shape the server accepts (lib/companyRecords.ts)
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const RecordForm = ({ record, onCancel, onSave, isSaving }: RecordFormProps) => {
  const { departments } = useDepartmentOptions();
  const [name, setName] = useState(record?.name ?? "");
  const [email, setEmail] = useState(record?.email ?? "");
  const [department, setDepartment] = useState(record?.department ?? "");

  // A record may keep a department made inactive since, so offer it too
  const options =
    record && !departments.some((item) => item.value === record.department)
      ? [
          { option: record.department, value: record.department },
          ...departments,
        ]
      : departments;

  const fieldId = record ? `record-${record.id}` : "record-new";
  const cleanEmail = email.trim().toLowerCase();
  const emailInvalid = cleanEmail.length > 0 && !isEmail(cleanEmail);
  const unchanged =
    !!record &&
    name.trim() === record.name &&
    cleanEmail === record.email &&
    department === record.department;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name: name.trim(), email: cleanEmail, department });
      }}
      className={`flex flex-col gap-3 p-4 ${cardStyles}`}
    >
      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        {record ? "Edit Staff Record" : "New Staff Record"}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${fieldId}-name`} className={labelStyles}>
            Full Name
            <FormAsterisk />
          </label>
          <div className="relative">
            <UserRound className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id={`${fieldId}-name`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setName((value) => value.trim())}
              required
              maxLength={255}
              placeholder="e.g. Jane Wanjiru"
              className={inputStyles}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${fieldId}-email`} className={labelStyles}>
            Email Address
            <FormAsterisk />
            {emailInvalid && (
              <span className="text-[10px] text-red-500">invalid email</span>
            )}
          </label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id={`${fieldId}-email`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmail((value) => value.trim().toLowerCase())}
              required
              maxLength={255}
              placeholder="example@example.com"
              className={inputStyles}
            />
          </div>
        </div>
      </div>

      <CustomDropdown
        label="Department"
        options={options}
        value={department}
        onChange={setDepartment}
      />

      {record?.hasAccount && cleanEmail !== record.email && (
        <p className="text-xs text-amber-700 dark:text-amber-500">
          This person has a HelpDesk account under {record.email}. Changing the
          email here doesn&apos;t change that account.
        </p>
      )}

      <div className="flex items-center justify-end gap-2.5 pt-1">
        <button type="button" onClick={onCancel} className={cancelButtonStyles}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            isSaving ||
            !name.trim() ||
            !cleanEmail ||
            emailInvalid ||
            !department ||
            unchanged
          }
          className={primaryButtonStyles}
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default RecordForm;
