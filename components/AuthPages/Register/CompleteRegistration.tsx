"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
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
import Alert from "@/components/Modules/Alert";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiHandler } from "@/utils/ApiHandler";

const CompleteRegistration = ({ email }: { email: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    department: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [alertInfo, setAlertInfo] = useState({
    showAlert: searchParams.get("sent") === "true",
    alertType: "success",
    alertMessage: "Email verified successfully",
  });

  // Derived State to check if passwords are matching
  const passwordsMatch =
    Boolean(formData.password) &&
    formData.password === formData.confirmPassword;

  const passwordsMismatch =
    Boolean(formData.confirmPassword) &&
    formData.password !== formData.confirmPassword;

  // UseEffect for cleaning the url after alert is shown
  useEffect(() => {
    if (searchParams.get("sent") === "true") {
      const newUrl = window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
  }, [searchParams]);

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle user information submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordsMatch) {
      setError("Passwords do not match");
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
      router.push("/testroute");
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      setLoading(false);
      console.error("Failed to register the user:", error);
    }
  };

  return (
    <>
      {alertInfo.showAlert && (
        <Alert
          message={alertInfo.alertMessage}
          type={alertInfo.alertType}
          onClose={() =>
            setAlertInfo({ showAlert: false, alertType: "", alertMessage: "" })
          }
        />
      )}

      <AuthShell>
        <div className="w-full max-w-90 py-20">
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
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-6"
          >
            {/* Global Error */}
            {error && (
              <div className="flex justify-center rounded-full bg-red-50 px-4 py-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
                  <User className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-full border border-neutral-400 bg-white py-3 pr-3 pl-14 text-neutral-900 placeholder-neutral-400 focus:border-neutral-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-white dark:focus:border-neutral-500"
                  placeholder="Your Name"
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
              disabled={loading || passwordsMismatch}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-3 font-semibold text-white ring-offset-2 hover:bg-neutral-800 focus:ring-1 focus:ring-neutral-600 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:ring-offset-neutral-950 dark:hover:bg-neutral-200 dark:focus:ring-neutral-300"
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
          </form>
        </div>
      </AuthShell>
    </>
  );
};

export default CompleteRegistration;
