"use client";
import { baseDepartments } from "@/public/assets";
import ClientPortal from "../../ClientPortal";
import { useState, useRef, FocusEvent } from "react";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { CheckCircle2, Mail, UserRound, X } from "lucide-react";
import CustomDropdown from "./CustomDropDown";

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
};

type EditUserModalProps = {
  isModalOpen: boolean;
  hideModal: () => void;
  userInfo: UserInfo;
};

const EditUserModal = ({
  hideModal,
  isModalOpen,
  userInfo,
}: EditUserModalProps) => {
  const [formData, setFormData] = useState<UserInfo>(userInfo);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useFocusTrapping(modalRef, isModalOpen, hideModal);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleDropdownChange = (field: keyof UserInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting updated user info:", formData);
    hideModal();
  };

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity dark:bg-black/60"
        onClick={hideModal}
      />

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
                Edit User Profile
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Update the user&apos;s details below
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
            onSubmit={handleSubmit}
            className="layout-scrollbar flex flex-col gap-4 overflow-y-auto px-6 py-5"
          >
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2">
                  {formData.name ? (
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
                  onBlur={handleBlur}
                  required
                  placeholder="User Name"
                  className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pr-3.5 pl-9 text-sm text-neutral-900 shadow-sm transition-all duration-150 placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email Address{" "}
                <span className="text-xs">(should be accurate)</span>
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
                disabled={formData === userInfo}
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

export default EditUserModal;
