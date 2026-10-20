"use client";

import { useState, ChangeEvent } from "react";
import { useDepartmentOptions } from "@/hooks/useDepartmentOptions";
import { NameValidationResult, NameValidator } from "@/utils/Validators";
import { validateHotpointEmail } from "@/utils/Validators";
import NameRulesCard from "../NameRulesCard";
import OptionsDropDown from "./OptionsDropDown";
import FormAsterisk from "../FormAsterisk";
import { CheckCircle2, UserRound, UserRoundCheck } from "lucide-react";
import UserEmailAutocomplete from "./UserEmailAutocomplete";
import { UserRecord } from "@/serverActions/GetCachedUsers";

export type SubmitForUserData = {
  user_name: string;
  user_email: string;
  user_department: string;
};

type SubmitForAUserProps = {
  isOpen: boolean;
  // Called on every edit - data is set once all the details are valid, and
  // hasInput says whether anything has been entered at all
  onChange: (data: SubmitForUserData | null, hasInput: boolean) => void;
};

const SubmitForAUser = ({ isOpen, onChange }: SubmitForAUserProps) => {
  // Staff departments (public.departments)
  const { departments: baseDepartments } = useDepartmentOptions();

  const [formData, setFormData] = useState<SubmitForUserData>({
    user_name: "",
    user_email: "",
    user_department: "",
  });

  const isValidEmail = validateHotpointEmail(formData.user_email);

  // Name validation states
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [nameValidation, setNameValidation] = useState<NameValidationResult>({
    hasTwoNames: true,
    isCapitalized: true,
    singleSpace: true,
    isValid: true,
  });

  // Stores the edit and tells the parent - the user is selected as soon as
  // every detail is valid, so there's no separate confirm step to forget
  const update = (
    next: SubmitForUserData,
    validation: NameValidationResult = nameValidation,
  ) => {
    setFormData(next);

    const trimmed = {
      user_name: next.user_name.trim(),
      user_email: next.user_email.trim(),
      user_department: next.user_department,
    };
    const isComplete =
      Boolean(trimmed.user_name && trimmed.user_department) &&
      validateHotpointEmail(trimmed.user_email) &&
      validation.isValid;
    const hasInput = Boolean(
      trimmed.user_name || trimmed.user_email || trimmed.user_department,
    );

    onChange(isComplete ? trimmed : null, hasInput);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "user_name") {
      const validationResult = NameValidator(value);
      setNameValidation(validationResult);
      update({ ...formData, user_name: value }, validationResult);
    } else {
      update({ ...formData, [name]: value });
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    update({ ...formData, [name]: value.trim() });
  };

  const handleDepartmentChange = (value: string) => {
    update({ ...formData, user_department: value });
  };

  // Picking an existing user from the autocomplete fills in their record,
  // whose name is trusted as-is
  const handleUserAutofill = (user: UserRecord) => {
    const validName: NameValidationResult = {
      hasTwoNames: true,
      isCapitalized: true,
      singleSpace: true,
      isValid: true,
    };
    setNameValidation(validName);
    update(
      {
        user_email: user.email,
        user_name: user.name,
        user_department: user.department,
      },
      validName,
    );
  };

  const isComplete =
    Boolean(formData.user_name.trim() && formData.user_department) &&
    isValidEmail &&
    nameValidation.isValid;

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
            Email Address <FormAsterisk />{" "}
            {formData.user_email && !isValidEmail && (
              <span className="text-[10px] font-normal text-red-500 lowercase">
                Invalid hotpoint email.
              </span>
            )}
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
        <div className="relative flex flex-col gap-1">
          <NameRulesCard
            validation={nameValidation}
            isVisible={isNameFocused}
          />
          <label
            htmlFor="user_name"
            className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
          >
            Full Name <FormAsterisk />
          </label>
          <div className="relative">
            <div className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2">
              {formData.user_name && nameValidation.isValid ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <UserRound className="h-4 w-4 text-neutral-400" />
              )}
            </div>
            <input
              type="text"
              id="user_name"
              name="user_name"
              value={formData.user_name}
              onFocus={() => setIsNameFocused(true)}
              onChange={handleChange}
              onBlur={(e) => {
                setIsNameFocused(false);
                handleBlur(e);
              }}
              required
              placeholder="User's full name"
              className={`w-full rounded-xl border bg-white py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-1 focus:outline-none dark:bg-neutral-900 dark:text-neutral-100 ${
                !nameValidation.isValid &&
                formData.user_name.length > 0 &&
                !isNameFocused
                  ? "border-red-400 focus:border-red-400 focus:ring-red-200 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-900"
                  : "border-neutral-300 focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700"
              }`}
            />
          </div>
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

        {/* Selection status - replaces the old confirm button */}
        <div className="flex items-end">
          <div
            aria-live="polite"
            className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.25 text-sm ${
              isComplete
                ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300"
                : "border-dashed border-neutral-300 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400"
            }`}
          >
            {isComplete ? (
              <UserRoundCheck className="h-4 w-4 shrink-0" />
            ) : (
              <UserRound className="h-4 w-4 shrink-0" />
            )}
            <span className="truncate">
              {isComplete
                ? `Submitting for ${formData.user_name.trim()}`
                : "Fill in all details to select the user"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitForAUser;
