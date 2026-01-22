"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ApiHandler } from "@/utils/ApiHandler";
import { generateUserRoute } from "@/utils/Validators";
import AuthShell from "./AuthShell";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAlertInfo } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Standard fetch for login
      const response = await ApiHandler("/api/login", "POST", {
        email,
        password,
      });

      const data = await response.json();
      //   Successfull login
      if (response.ok) {
        const username = generateUserRoute(data.username);
        router.push(`/${username}`);
        router.refresh(); //refresh server components
      } else {
        setError(data.message || "Login Failed");
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only trigger logic if the specific param exists
    if (searchParams.get("reset") === "success") {
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

  return (
    <AuthShell>
      <div className="w-full max-w-90 px-2">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-center text-3xl font-semibold text-neutral-900 dark:text-white">
            Welcome back
          </h1>
          <p className="text-center text-neutral-600 dark:text-neutral-400">
            Please enter your credentials to continue
          </p>
        </div>

        {/* Login Fields */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
          {error && (
            <div className="rounded-full bg-red-50 px-4 py-3 text-center text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
            >
              Email address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
                <Mail className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-neutral-400 bg-white py-3 pr-3 pl-14 text-neutral-900 placeholder-neutral-400 focus:border-neutral-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-white dark:focus:border-neutral-500"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="mr-2 text-sm text-neutral-700 hover:underline dark:text-neutral-300"
              >
                forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-neutral-400 bg-white py-3 pr-3 pl-14 text-neutral-900 placeholder-neutral-400 focus:border-neutral-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-white dark:focus:border-neutral-500"
                placeholder="••••••••"
                required
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-3 font-semibold text-white ring-offset-2 hover:bg-neutral-800 focus:ring-1 focus:ring-neutral-600 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:ring-offset-neutral-950 dark:hover:bg-neutral-200 dark:focus:ring-neutral-300"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>

          <div className="flex items-center justify-center gap-1 text-sm text-neutral-700 dark:text-neutral-300">
            <span>No Account?</span>
            <Link href="/register" className="hover:underline">
              Register
            </Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
}
