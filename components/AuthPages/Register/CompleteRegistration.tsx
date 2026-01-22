"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { generateUserRoute } from "@/utils/Validators";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  User,
  Building2,
  ChevronDown,
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import AuthShell from "../AuthShell";
import { useRouter, useSearchParams } from "next/navigation";
import { useAlert } from "@/contexts/AlertContext";
import { ApiHandler } from "@/utils/ApiHandler";
import NameRulesCard from "@/components/Modules/NameRulesCard";
import { NameValidator, NameValidationResult } from "@/utils/Validators";

const CompleteRegistration = ({ email }: { email: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  //   Name Validation States
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [nameValidation, setNameValidation] = useState<NameValidationResult>({
    hasTwoNames: false,
    isCapitalized: false,
    singleSpace: true,
    isValid: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    department: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { alertInfo, setAlertInfo } = useAlert();

  // Derived State to check if passwords are matching
  const passwordsMatch =
    Boolean(formData.password) &&
    formData.password === formData.confirmPassword;

  const passwordsMismatch =
    Boolean(formData.confirmPassword) &&
    formData.password !== formData.confirmPassword;

  useEffect(() => {
    // Only trigger logic if the specific param exists
    if (searchParams.get("sent") === "true") {
      setAlertInfo({
        showAlert: true, // Hardcode true, don't rely on the param comparison anymore
        alertType: "success",
        alertMessage: "Your password has been reset successfully",
      });

      // Now clean the URL
      const newUrl = window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
    // If the param is NOT 'success', we do nothing.
    // This leaves the alert visible until the user manually closes it
    // or the AlertContext handles the timeout.
  }, [searchParams, setAlertInfo]);

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    //If the input changing is name, run the validator
    if (name === "name") {
      const validationResult = NameValidator(value);
      setNameValidation(validationResult);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle user information submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Add Name Validation Guard
    if (!nameValidation.isValid) {
      setAlertInfo({
        showAlert: true,
        alertType: "error",
        alertMessage: "Please fix the name format errors.",
      });
      return;
    }

    if (!passwordsMatch) {
      setAlertInfo({
        showAlert: true,
        alertType: "error",
        alertMessage: "Passwords do not match",
      });
      return;
    }

    setLoading(true);

    const payload = {
      email,
      name: formData.name,
      password: formData.password,
      department: formData.department,
    };

    try {
      const response = await ApiHandler(
        "/api/register/complete-registration",
        "POST",
        payload,
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      // response is ok - get username
      const username = generateUserRoute(data.username);
      // Push to protected dashboard
      router.push(`/${username}`);
      router.refresh(); //Refresh server components
    } catch (error) {
      if (error instanceof Error)
        setAlertInfo({
          showAlert: true,
          alertType: "error",
          alertMessage: error.message,
        });
      setLoading(false);
      console.error("Failed to register the user:", error);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-90 px-2 py-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-center text-3xl font-semibold text-neutral-900 dark:text-white">
            Complete Profile
          </h1>
          <p className="text-center text-neutral-600 dark:text-neutral-400">
            Finish setting up your account for <br />
            <span className="font-medium text-neutral-900 dark:text-white">
              {email}
            </span>
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
          {/* Name Input */}
          <div className="relative">
            {/* Name rules card component */}
            <NameRulesCard
              validation={nameValidation}
              isVisible={isNameFocused}
            />
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
                {nameValidation.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <User className="h-5 w-5 text-neutral-400" />
                )}
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                // 3. ADD FOCUS HANDLERS
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
                className={`w-full rounded-full border bg-white py-3 pr-3 pl-14 text-neutral-900 placeholder-neutral-400 focus:outline-none dark:bg-neutral-900/50 dark:text-white ${
                  !nameValidation.isValid &&
                  formData.name.length > 0 &&
                  !isNameFocused
                    ? "border-red-500 focus:border-red-500"
                    : "border-neutral-400 focus:border-neutral-600 dark:border-neutral-700 dark:focus:border-neutral-500"
                }`}
                placeholder="e.g. Jimmy Warthog"
                required
              />
            </div>
          </div>

          {/* Department Input */}
          <div>
            <label
              htmlFor="department"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              Department
            </label>
            <div className="relative">
              {/* Left Icon (Building) */}
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
                <Building2 className="h-5 w-5 text-neutral-400" />
              </div>

              {/* Select Element */}
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                // appearance-none removes default ugly arrow
                // Conditional text color makes the placeholder look grey
                className={`w-full appearance-none rounded-full border border-neutral-400 bg-white py-3 pr-12 pl-14 focus:border-neutral-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500 ${
                  formData.department === ""
                    ? "text-neutral-400" // Placeholder color
                    : "text-neutral-900 dark:text-white" // Selected value color
                }`}
                required
              >
                <option value="" disabled>
                  Select a department
                </option>
                <option value="Commercial">Commercial</option>
                <option value="IT & Projects">IT & Projects</option>
                <option value="Finance">Finance</option>
                <option value="HR & Admin">HR & Admin</option>
                <option value="Directorate">Directorate</option>
                <option value="Marketing">Marketing</option>
                <option value="B2B">B2B</option>
                <option value="Operations">Operations</option>
                <option value="Modern Trade">Modern Trade</option>
                <option value="Retail">Retail</option>
                <option value="Engineering & HVAC">Engineering & HVAC</option>
                <option value="Service Center">Service Center</option>
                <option value="Internal Audit">Internal Audit</option>
                <option value="Security">Security</option>
              </select>

              {/* Custom Right Icon (Chevron) */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              Create Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-full border border-neutral-400 bg-white py-3 pr-12 pl-14 text-neutral-900 placeholder-neutral-400 focus:border-neutral-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-white dark:focus:border-neutral-500"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center pr-4"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
                ) : (
                  <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
                {passwordsMatch ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : passwordsMismatch ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <Lock className="h-5 w-5 text-neutral-400" />
                )}
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-full border bg-white py-3 pr-3 pl-14 text-neutral-900 placeholder-neutral-400 focus:outline-none dark:bg-neutral-900/50 dark:text-white ${
                  passwordsMismatch
                    ? "border-red-500 focus:border-red-500"
                    : passwordsMatch
                      ? "border-green-500 focus:border-green-500"
                      : "border-neutral-400 focus:border-neutral-600 dark:border-neutral-700 dark:focus:border-neutral-500"
                }`}
                placeholder="••••••••"
                required
              />
            </div>
            {passwordsMismatch && (
              <p className="mt-1 ml-4 text-xs text-red-500">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || passwordsMismatch || !nameValidation.isValid}
            className={`flex w-full items-center ${alertInfo.alertType === "error" ? "bg-red-500 text-white hover:bg-red-400 focus:ring-red-500 dark:ring-offset-neutral-950" : "bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-600 dark:bg-white dark:text-neutral-950 dark:ring-offset-neutral-950 dark:hover:bg-neutral-200 dark:focus:ring-neutral-300"} justify-center gap-2 rounded-full px-4 py-3 font-semibold ring-offset-2 focus:ring-1 focus:outline-none disabled:opacity-50`}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Complete Registration"
            )}
          </button>

          {/* Footer */}
          <div className="flex items-center justify-center gap-1 text-sm text-neutral-700 dark:text-neutral-300">
            <span>Already have an account?</span>
            <Link href="/login" className="hover:underline">
              Sign in
            </Link>
          </div>
          <div className="flex items-center justify-center text-sm text-neutral-700 dark:text-neutral-300">
            <Link href="/register" className="hover:underline">
              Start over
            </Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
};

export default CompleteRegistration;
