"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import AuthShell from "../AuthShell";
import Alert from "@/components/Modules/Alert";
import { ApiHandler } from "@/utils/ApiHandler";

const ResetPassword = ({ isValid }: { isValid: boolean }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [alertInfo, setAlertInfo] = useState({
    showAlert: false,
    alertType: "",
    alertMessage: "",
  });

  // Derived State to check if passwords are matching
  const passwordsMatch =
    Boolean(formData.password) &&
    formData.password === formData.confirmPassword;

  const passwordsMismatch =
    Boolean(formData.confirmPassword) &&
    formData.password !== formData.confirmPassword;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!passwordsMatch) {
      setAlertInfo({
        showAlert: true,
        alertType: "error",
        alertMessage: "Passwords do not match",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await ApiHandler("/api/reset-password", "POST", {
        token,
        password: formData.password,
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to reset password");

      // Redirect to login with success flag
      router.push("/login?reset=success");
    } catch (error) {
      if (error instanceof Error) {
        setAlertInfo({
          showAlert: true,
          alertType: "error",
          alertMessage: error.message,
        });
      }
      setLoading(false);
    }
  };

  // --- RENDER: INVALID TOKEN STATE ---
  if (!isValid) {
    return (
      <AuthShell>
        <div className="w-full max-w-90 px-2 text-center">
          <div className="mb-6 flex justify-center">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="mb-4 text-3xl font-semibold text-neutral-900 dark:text-white">
            Invalid or Expired Link
          </h1>
          <p className="mb-8 text-neutral-600 dark:text-neutral-400">
            This password reset link is invalid or has expired. <br />
            Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Forgot Password
          </Link>
        </div>
      </AuthShell>
    );
  }

  // --- RENDER: VALID FORM STATE ---
  return (
    <>
      {alertInfo.showAlert && (
        <Alert
          message={alertInfo.alertMessage}
          type={alertInfo.alertType as "success" | "error" | "warning" | "info"}
          onClose={() =>
            setAlertInfo({ showAlert: false, alertType: "", alertMessage: "" })
          }
        />
      )}

      <AuthShell>
        <div className="w-full max-w-90">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-center text-3xl font-semibold text-neutral-900 dark:text-white">
              Reset Password
            </h1>
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              Please enter your new password below.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-6"
          >
            {/* New Password Input */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                New Password
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
                Confirm New Password
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
              disabled={loading || passwordsMismatch || !formData.password}
              className={`flex w-full items-center ${
                alertInfo.alertType === "error"
                  ? "bg-red-500 text-white hover:bg-red-400 focus:ring-red-500 dark:ring-offset-neutral-950"
                  : "bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-600 dark:bg-white dark:text-neutral-950 dark:ring-offset-neutral-950 dark:hover:bg-neutral-200 dark:focus:ring-neutral-300"
              } justify-center gap-2 rounded-full px-4 py-3 font-semibold ring-offset-2 focus:ring-1 focus:outline-none disabled:opacity-50`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            {/* Footer */}
            <div className="flex items-center justify-center gap-1 text-sm text-neutral-700 dark:text-neutral-300">
              <Link
                href="/login"
                className="flex items-center gap-1 hover:underline"
              >
                <ArrowLeft className="h-3 w-3" /> Back to Login
              </Link>
            </div>
          </form>
        </div>
      </AuthShell>
    </>
  );
};

export default ResetPassword;
