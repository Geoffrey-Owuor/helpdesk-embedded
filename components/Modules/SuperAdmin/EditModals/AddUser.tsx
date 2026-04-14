"use client";

import { fetchedBaseDepartments } from "@/serverActions/GetBaseDepartments";
import ClientPortal from "../../ClientPortal";
import { useState, useRef, FocusEvent, FormEvent } from "react";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import {
  X,
  Mail,
  Lock,
  UserRound,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import CustomDropdown from "./CustomDropDown";
import { UserInfo } from "./EditUserModal";
import { NameValidationResult, NameValidator } from "@/utils/Validators";
import NameRulesCard from "../../NameRulesCard";
import FormAsterisk from "../../FormAsterisk";
import { baseRoles, baseStatuses } from "./EditUserModal";
import apiClient from "@/lib/AxiosClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAlertStore } from "@/store/useAlertStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { UserRecord } from "../Users";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";

type AddUserModalProps = {
  hideModal: () => void;
  isModalOpen: boolean;
};

interface AddUserData {
  name: string;
  email: string;
  department: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "user" | "agent";
  status: string;
}

const AddUser = ({ hideModal, isModalOpen }: AddUserModalProps) => {
  const queryClient = useQueryClient();

  // Fetch the departments
  const { data: baseDepartments = [], isPending: loading } = useQuery({
    queryKey: ["BaseDepartmentsData"],
    queryFn: fetchedBaseDepartments,
    enabled: isModalOpen,
  });

  const [formData, setFormData] = useState<AddUserData>({
    name: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
    role: "user", //default to user
    status: "",
  });

  // Name validation states
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [nameValidation, setNameValidation] = useState<NameValidationResult>({
    hasTwoNames: false,
    isCapitalized: false,
    singleSpace: true,
    isValid: false,
  });

  // Store states
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  const modalRef = useRef<HTMLDivElement | null>(null);

  useFocusTrapping(modalRef, isModalOpen, hideModal);

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

  const handleConfirmSubmit = (e: FormEvent) => {
    e.preventDefault();
    triggerDialog({
      title: "Add New User",
      description: "Confirm adding of the new user",
      onConfirm: handleSubmit,
    });
  };

  const handleSubmit = async () => {
    const payload = { ...formData };
    hideDialog();
    showOverlay("Adding");
    addUserMutation(payload);
  };

  const { mutate: addUserMutation, isPending: adding } = useMutation({
    mutationFn: (payload: AddUserData) =>
      apiClient.post("/superadmin/add-user", payload),
    onSuccess: (response, payload) => {
      //  Creating the new user object
      const newUser: UserRecord = {
        username: payload.name,
        email: payload.email,
        department: payload.department,
        role: payload.role,
        user_id: Date.now().toLocaleString(), //Get a random generic id
        is_user_active: payload.status === "true",
        created_at: new Date().toLocaleString(),
      };
      queryClient.setQueryData(["UsersDataInfo"], (oldData: UserRecord[]) => {
        if (!oldData) return oldData;
        return [newUser, ...oldData];
      });

      // Hide overlay on success
      hideOverlay();

      setFormData({
        name: "",
        email: "",
        department: "",
        password: "",
        confirmPassword: "",
        role: "user", //default to user
        status: "",
      });

      hideModal();

      triggerAlert("success", response.data.message);
    },
    onError: (error) => {
      hideOverlay();
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["UserCountsData"] }); //Card counts data
      queryClient.invalidateQueries({ queryKey: ["UsersDataInfo"] }); //Card counts data
    },
  });

  const passwordMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div className="custom-blur fixed inset-0 z-50 bg-black/50 transition-opacity dark:bg-black/60" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4"
      >
        <div className="flex max-h-[80vh] w-full flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Add User
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Fill in the user&apos;s details below
              </p>
            </div>
            <button
              onClick={hideModal}
              className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleConfirmSubmit}
            autoComplete="off"
            className="layout-scrollbar flex flex-col gap-4 overflow-y-auto px-6 py-5"
          >
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
                Email Address{" "}
                <span className="text-xs">(should be accurate)</span>
                <FormAsterisk />
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
              loading={loading}
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

            {/* Footer */}
            <div className="mt-1 flex items-center justify-end gap-2.5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
              <button
                type="button"
                onClick={hideModal}
                className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-300 focus:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  adding ||
                  !formData ||
                  passwordMismatch ||
                  !nameValidation.isValid
                }
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus:ring-white dark:focus:ring-offset-neutral-950"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </ClientPortal>
  );
};

export default AddUser;
