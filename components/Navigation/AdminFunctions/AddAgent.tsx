"use client";

import {
  ChangeEvent,
  Dispatch,
  FocusEvent,
  SetStateAction,
  useState,
} from "react";
import {
  Mail,
  Building,
  Shield,
  Lock,
  Plus,
  AlertCircle,
  UserRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import FormAsterisk from "@/components/Modules/FormAsterisk";
import { useUser } from "@/contexts/UserContext";
import { useAlertStore } from "@/store/useAlertStore";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAgentsInfo } from "@/contexts/AgentsInfoContext";
import { NameValidator, NameValidationResult } from "@/utils/Validators";
import NameRulesCard from "@/components/Modules/NameRulesCard";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useConfirmStore } from "@/store/useConfirmStore";

type AddAgentProps = {
  showAgentModal: boolean;
  setShowAgentModal: Dispatch<SetStateAction<boolean>>;
};

const AddAgent = ({ setShowAgentModal, showAgentModal }: AddAgentProps) => {
  const { department } = useUser();

  // state data
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const { refetchAgentsInfo } = useAgentsInfo();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: department,
    role: "agent",
    password: "",
    confirmPassword: "",
  });

  // State for showing/hiding password
  const [showPassword, setShowPassword] = useState(false);

  //   Name Validation States
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [nameValidation, setNameValidation] = useState<NameValidationResult>({
    hasTwoNames: false,
    isCapitalized: false,
    singleSpace: true,
    isValid: false,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    //If the input changing is name, run the validator
    if (name === "name") {
      const validationResult = NameValidator(value);
      setNameValidation(validationResult);
    }
  };

  // Cleanup when a user clicks away
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(), // Final cleanup when they click away
    }));
  };

  // Derived states for checking password length and if the passwords match
  const shortPassword =
    formData.password && formData.password.length < 8
      ? "Password length should be atleast 8 characters"
      : null;
  const passwordsMismatch =
    formData.confirmPassword &&
    formData.password &&
    formData.password !== formData.confirmPassword
      ? "Passwords do not match"
      : null;

  const handleSubmit = async () => {
    hideDialog();

    //password validation logic
    if (
      formData.password.length < 8 ||
      formData.password !== formData.confirmPassword
    ) {
      triggerAlert("error", "Short password or mismatched passwords");
      return;
    }

    showOverlay("Adding");
    try {
      const response = await apiClient.post("/add-agent", formData);

      // On success, show toast alert
      triggerAlert("success", response.data.message);

      // refetch agents data
      refetchAgentsInfo();

      // close modal
      setShowAgentModal(false);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);

      // log the error
      console.error("Error while trying to add an agent:", errorMessage);
    } finally {
      hideOverlay();
    }
  };

  const handleConfirmationDialog = () => {
    triggerDialog({
      title: "Add Agent",
      description: "Confirm adding of new agent.",
      onConfirm: handleSubmit,
    });
  };

  if (!showAgentModal) return null;

  return (
    <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-6 transition-all dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Register New Agent
          </h3>
          <p className="text-xs text-neutral-500">
            Create a new account for a support team member.
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleConfirmationDialog();
        }}
        autoComplete="off"
        className="grid gap-5"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {/* Name */}
          <div className="relative space-y-1.5">
            {/* Name rules card component */}
            <NameRulesCard
              validation={nameValidation}
              isVisible={isNameFocused}
            />
            <label className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <span>Full Name</span>
              <FormAsterisk />
            </label>
            <div className="relative">
              <div className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2">
                {nameValidation.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <UserRound className="h-4 w-4 text-neutral-400" />
                )}
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                // Focus handler
                onFocus={() => setIsNameFocused(true)}
                onBlur={(e) => {
                  setIsNameFocused(false);
                  handleBlur(e);
                }}
                placeholder="Agent Name..."
                required
                className={`w-full rounded-lg border bg-white py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-1 ${
                  !nameValidation.isValid &&
                  formData.name.length > 0 &&
                  !isNameFocused
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-neutral-300 focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700"
                } focus:outline-none dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500`}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Email{" "}
              <span className="font-normal text-gray-500">
                (should be accurate)
              </span>
              <FormAsterisk />
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="username@hotpoint.co.ke"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <span>Department</span>
              <FormAsterisk />
            </label>
            <div className="relative">
              <Building className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="agent's department"
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-neutral-300 bg-neutral-100 py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <span>Role</span>
              <FormAsterisk />
            </label>
            <div className="relative">
              <Shield className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="agent's role"
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-neutral-300 bg-neutral-100 py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <span>Password</span>
              <FormAsterisk />
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300"
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
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <span>Confirm Password</span>
              <FormAsterisk />
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={`w-full rounded-lg border bg-white py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-1 focus:outline-none dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500 ${
                  shortPassword || passwordsMismatch
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-neutral-300 focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {(shortPassword || passwordsMismatch) && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle size={16} />
            <span>{shortPassword || passwordsMismatch}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={
              !!shortPassword || !!passwordsMismatch || !nameValidation.isValid
            }
            className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
          >
            <Plus size={16} />
            <span>Register</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAgent;
