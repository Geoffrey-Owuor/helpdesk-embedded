"use client";

import { Dispatch, SetStateAction, useState, ChangeEvent } from "react";
import { baseDepartments } from "@/public/assets";
import OptionsDropDown from "./OptionsDropDown";
import FormAsterisk from "../FormAsterisk";
import { UserRoundPlus } from "lucide-react";
import UserEmailAutocomplete from "./UserEmailAutocomplete";
import { UserRecord } from "@/serverActions/FetchUserRecords";

export type SubmitForUserData = {
  user_name: string;
  user_email: string;
  user_department: string;
};

type SubmitForAUserProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  onConfirm: (data: SubmitForUserData) => void;
};

const SubmitForAUser = ({
  setIsOpen,
  isOpen,
  onConfirm,
}: SubmitForAUserProps) => {
  const [formData, setFormData] = useState<SubmitForUserData>({
    user_name: "",
    user_email: "",
    user_department: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, user_department: value }));
  };

  // NEW: Handler for when a user is selected from the autocomplete dropdown
  const handleUserAutofill = (user: UserRecord) => {
    setFormData((prev) => ({
      ...prev,
      user_email: user.email,
      user_name: user.name,
      user_department: user.department,
    }));
  };

  const handleConfirm = () => {
    onConfirm(formData);
    setIsOpen(false);
  };

  const isValid =
    formData.user_name.trim() &&
    formData.user_email.trim() &&
    formData.user_department;

  if (!isOpen) return null;

  return (
    <div className="flex w-full flex-col rounded-2xl border border-neutral-300 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      {/* Form */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        {/* User Email (Replaced with Autocomplete Component) */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="user_email"
            className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
          >
            Email Address <FormAsterisk />
          </label>
          <UserEmailAutocomplete
            id="user_email"
            name="user_email"
            value={formData.user_email}
            onChange={handleChange}
            onBlur={handleBlur}
            onSelectUser={handleUserAutofill}
            placeholder="User's email..."
          />
        </div>

        {/* User Name */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="user_name"
            className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
          >
            Full Name <FormAsterisk />
          </label>
          <input
            type="text"
            id="user_name"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            placeholder="User's full name"
            className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>

        {/* User Department */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
            Department <FormAsterisk />
          </label>
          <OptionsDropDown
            value={formData.user_department}
            onChange={handleDepartmentChange}
            loading={false}
            options={baseDepartments}
            dropDownType="department"
            error={false}
          />
        </div>

        {/* Confirm Button */}
        <div className="pt-5">
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.25 text-sm text-white hover:bg-neutral-800 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <UserRoundPlus className="h-4 w-4" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitForAUser;
