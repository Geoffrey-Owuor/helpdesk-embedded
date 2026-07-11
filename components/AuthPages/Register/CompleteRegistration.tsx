"use client";

import {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  FocusEvent,
  useRef,
} from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Building2,
  ChevronDown,
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
  UserRound,
} from "lucide-react";
import AuthShell from "../AuthShell";
import { useSearchParams } from "next/navigation";
import { useAlertStore } from "@/store/useAlertStore";
import { ApiHandler } from "@/utils/ApiHandler";
import NameRulesCard from "@/components/Modules/NameRulesCard";
import { NameValidator, NameValidationResult } from "@/utils/Validators";
import { baseDepartments } from "@/public/assets";

const CompleteRegistration = ({ email }: { email: string }) => {
  const searchParams = useSearchParams();

  // Drop down state
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const departmentRef = useRef<HTMLDivElement | null>(null);

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

  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const alertType = useAlertStore((state) => state.alertType);

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
      triggerAlert("success", "Your email has been verified successfully");
      // Now clean the URL
      const newUrl = window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
    // If the param is NOT 'success', we do nothing.
    // This leaves the alert visible until the user manually closes it
    // or the AlertContext handles the timeout.
  }, [searchParams, triggerAlert]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        departmentRef.current &&
        !departmentRef.current.contains(e.target as Node)
      ) {
        setIsDepartmentOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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

  // Handle user information submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Add Name Validation Guard
    if (!nameValidation.isValid) {
      triggerAlert("error", "Please fix the name format errors.");
      return;
    }

    if (!passwordsMatch) {
      triggerAlert("error", "Passwords do not match");
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

      // Push to protected dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      if (error instanceof Error) triggerAlert("error", error.message);
      setLoading(false);
      console.error("Failed to register the user:", error);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-90 px-2">
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
                  <UserRound className="h-5 w-5 text-neutral-400" />
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
                onBlur={(e) => {
                  setIsNameFocused(false);
                  handleBlur(e);
                }}
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
            <div ref={departmentRef} className="relative">
              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsDepartmentOpen((prev) => !prev)}
                className={`flex w-full items-center rounded-full border border-neutral-400 bg-white py-3 pr-12 pl-14 focus:border-neutral-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500 ${
                  formData.department === ""
                    ? "text-neutral-400"
                    : "text-neutral-900 dark:text-white"
                }`}
              >
                {/* Left Icon */}
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
                  <Building2 className="h-5 w-5 text-neutral-400" />
                </div>

                <span className="flex-1 text-left">
                  {formData.department || "Select a department"}
                </span>

                {/* Right Chevron */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                      isDepartmentOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown List */}
              {isDepartmentOpen && (
                <ul className="default-scrollbar absolute z-10 mt-2 max-h-52 w-full overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                  {baseDepartments.map((dept) => (
                    <li
                      key={dept.value}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          department: dept.value,
                        }));
                        setIsDepartmentOpen(false);
                      }}
                      className={`cursor-pointer rounded-xl px-5 py-2.5 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                        formData.department === dept.value
                          ? "font-semibold text-neutral-900 dark:text-white"
                          : "text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {dept.option}
                    </li>
                  ))}
                </ul>
              )}
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
                onBlur={handleBlur}
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
            className={`flex w-full items-center ${alertType === "error" ? "bg-red-500 text-white hover:bg-red-400 focus:ring-red-500 dark:ring-offset-neutral-950" : "bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-600 dark:bg-white dark:text-neutral-950 dark:ring-offset-neutral-950 dark:hover:bg-neutral-200 dark:focus:ring-neutral-300"} justify-center gap-2 rounded-full px-4 py-3 font-semibold ring-offset-2 focus:ring-1 focus:outline-none disabled:opacity-50`}
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
            <Link
              href="/login"
              className="text-blue-500 hover:underline dark:text-blue-400"
            >
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
