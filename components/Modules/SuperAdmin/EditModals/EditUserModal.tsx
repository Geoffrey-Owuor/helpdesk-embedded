"use client";

import { baseDepartments } from "@/public/assets";
import { useState, FocusEvent } from "react";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { NameValidationResult, NameValidator } from "@/utils/Validators";
import { validateHotpointEmail } from "@/utils/Validators";
import NameRulesCard from "../../NameRulesCard";
import CustomDropdown from "./CustomDropDown";
import FormAsterisk from "../../FormAsterisk";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/store/useAlertStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { UserRecord } from "../Users";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalForm,
  ModalHeader,
} from "../../Modal/Modal";

export const baseRoles = [
  { option: "User", value: "user" },
  { option: "Agent", value: "agent" },
  { option: "Admin", value: "admin" },
];

export const baseStatuses = [
  { option: "Active", value: "true" },
  { option: "Inactive", value: "false" },
];

export type UserInfo = {
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
  password: string;
  confirmPassword: string;
};

interface Payload extends UserInfo {
  userId: string;
}

type EditUserModalProps = {
  isModalOpen: boolean;
  hideModal: () => void;
  userId: string;
  userInfo: UserInfo;
};

const EditUserModal = ({
  hideModal,
  isModalOpen,
  userId,
  userInfo,
}: EditUserModalProps) => {
  const queryClient = useQueryClient();

  // The query key
  const activeQueryKey = ["UsersDataInfo"];
  const userCardsKey = ["UserCountsData"];

  const [formData, setFormData] = useState<UserInfo>(userInfo);
  const isEmailValid = validateHotpointEmail(formData.email);

  // Name validation states
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [nameValidation, setNameValidation] = useState<NameValidationResult>({
    hasTwoNames: true,
    isCapitalized: true,
    singleSpace: true,
    isValid: true,
  }); //Assumption that the received name is formatted in a way that follows our name validation rules

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  const passwordMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  // Store states
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "name") {
      const validationResult = NameValidator(value);
      setNameValidation(validationResult);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleDropdownChange = (field: keyof UserInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerDialog({
      title: "Edit User Info",
      description: "Confirm editing of user information",
      onConfirm: handleSubmit,
    });
  };

  const handleSubmit = async () => {
    // Our final data object
    const payload = { ...formData, userId };
    hideDialog();
    showOverlay("Updating");

    // The mutation function
    editMutation(payload);
  };

  // Mutation function
  const { mutate: editMutation, isPending: loading } = useMutation({
    mutationFn: async (payload: Payload) =>
      apiClient.put("/superadmin/edit-user", payload),

    onSuccess: (response, payload) => {
      // // Update the cache
      queryClient.setQueryData(activeQueryKey, (oldData: UserRecord[]) => {
        if (!oldData) return oldData;
        return oldData.map((user) => {
          if (user.user_id === payload.userId) {
            // Return a new object merging existing user data with the new payload
            return {
              ...user,
              username: payload.name, // Mapping 'name' to 'username'
              email: payload.email,
              department: payload.department,
              role: payload.role as "admin" | "user" | "agent",
              // Convert the string "true"/"false" from your dropdown back to boolean
              is_user_active: payload.status === "true",
            };
          }
          return user;
        });
      });

      // Hide the overlay
      hideOverlay();

      hideModal();

      triggerAlert("success", response.data.message);
    },

    onError: (error) => {
      hideOverlay();
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: userCardsKey }),
  });

  return (
    <Modal open={isModalOpen} onClose={hideModal} size="md">
      <ModalHeader
        title="Edit User Profile"
        description="Update the user's details below"
      />

      <ModalForm onSubmit={handleConfirmSubmit}>
        <ModalBody className="flex flex-col gap-4">
          {/* Name */}
          <div className="relative space-y-1.5">
            <NameRulesCard
              validation={nameValidation}
              isVisible={isNameFocused}
            />
            <label
              htmlFor="name"
              className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Full Name
              <FormAsterisk />
            </label>
            <div className="relative">
              <div className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2">
                {nameValidation.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <UserRound className="h-4 w-4 text-neutral-400" />
                )}
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setIsNameFocused(true)}
                onBlur={(e) => {
                  setIsNameFocused(false);
                  handleBlur(e);
                }}
                required
                placeholder="User Name"
                className={`w-full rounded-xl border bg-white py-2.5 pr-3.5 pl-9 text-sm text-neutral-900 shadow-sm transition-all duration-150 placeholder:text-neutral-400 focus:ring-2 focus:outline-none dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 ${
                  !nameValidation.isValid &&
                  formData.name.length > 0 &&
                  !isNameFocused
                    ? "border-red-400 focus:border-red-400 focus:ring-red-200 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-900"
                    : "border-neutral-300 focus:border-neutral-500 focus:ring-neutral-200 dark:border-neutral-700 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
                }`}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Email Address <FormAsterisk />
              <span
                className={`text-[10px] ${formData.email && !isEmailValid ? "text-red-500" : ""}`}
              >
                {formData.email && !isEmailValid
                  ? "invalid hotpoint email"
                  : "should be accurate"}
              </span>
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="example@hotpoint.co.ke"
                className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pr-3.5 pl-9 text-sm text-neutral-900 shadow-sm transition-all duration-150 placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
              />
            </div>
          </div>

          {/* Department */}
          <CustomDropdown
            label="Department"
            options={baseDepartments}
            value={formData.department}
            onChange={(val) => handleDropdownChange("department", val)}
          />

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-3">
            <CustomDropdown
              label="Role"
              options={baseRoles}
              value={formData.role}
              onChange={(val) => handleDropdownChange("role", val)}
            />
            <CustomDropdown
              label="Status"
              options={baseStatuses}
              value={formData.status}
              onChange={(val) => handleDropdownChange("status", val)}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Password
              <FormAsterisk />
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pr-10 pl-9 text-sm text-neutral-900 shadow-sm transition-all duration-150 placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Confirm Password
              <FormAsterisk />
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-white py-2.5 pr-3.5 pl-9 text-sm text-neutral-900 shadow-sm transition-all duration-150 placeholder:text-neutral-400 focus:ring-2 focus:outline-none dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 ${
                  passwordMismatch
                    ? "border-red-400 focus:border-red-400 focus:ring-red-200 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-900"
                    : "border-neutral-300 focus:border-neutral-500 focus:ring-neutral-200 dark:border-neutral-700 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
                }`}
              />
            </div>
            {passwordMismatch && (
              <span className="text-xs text-red-500 dark:text-red-400">
                Passwords do not match
              </span>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={hideModal}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-300 focus:outline-none sm:py-2 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              formData === userInfo ||
              loading ||
              passwordMismatch ||
              !nameValidation.isValid
            }
            className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none disabled:opacity-50 sm:py-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus:ring-white dark:focus:ring-offset-neutral-950"
          >
            Save Changes
          </button>
        </ModalFooter>
      </ModalForm>
    </Modal>
  );
};

export default EditUserModal;
