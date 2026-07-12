"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ApiHandler } from "@/utils/ApiHandler";
import AuthShell from "./AuthShell";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { useIsEmbedd } from "@/hooks/useIsEmbedd";
import { useAlertStore } from "@/store/useAlertStore";

// Microsoft Icon Here
const MicrosoftIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEmbedded = useIsEmbedd();

  // useEffect that listens for window popups broadcast messages
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      // Security check (Defense in depth)
      if (event.origin !== window.location.origin) return;

      // Listen for the signal from the popup
      if (event.data?.type === "AUTH_SUCCESS" && event.data?.url) {
        // Sync tabs if needed (cross-tab checking)
        const authChannel = new BroadcastChannel("auth_session_sync");
        authChannel.postMessage({ action: "LOGIN" });
        authChannel.close();

        // Redirect the parent iframe to the URL dictated by the backend
        window.location.href = event.data.url;
      }
    };

    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, []);

  // Microsoft sso state
  const [ssoLoading, setSsoLoading] = useState(false);

  const searchParams = useSearchParams();

  const triggerAlert = useAlertStore((state) => state.triggerAlert);

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
        // Broadcast the new login to other tabs
        const authChannel = new BroadcastChannel("auth_session_sync");
        authChannel.postMessage({ action: "LOGIN", userId: data.id });
        authChannel.close();

        window.location.href = "/dashboard";
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
      triggerAlert("success", "Your password has been reset successfully");

      // Now clean the URL
      const newUrl = window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
    // If the param is NOT 'success', we do nothing.
    // This leaves the alert visible until the user manually closes it
    // or the AlertContext handles the timeout.
  }, [searchParams, triggerAlert]);

  // 2. Modify your handleLogin function
  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isEmbedded) {
      e.preventDefault();
      setSsoLoading(true);

      const width = 600;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      // Notice the ?popup=true flag
      const popup = window.open(
        "/api/sso/microsoft/login?popup=true",
        "MicrosoftAuthPopup",
        `width=${width},height=${height},top=${top},left=${left}`,
      );

      const checkPopupClosed = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkPopupClosed);
          setSsoLoading(false);
        }
      }, 1000);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-90 px-2">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-center text-3xl font-semibold text-neutral-900 dark:text-white">
            Welcome Back
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
                placeholder="you@hotpoint.co.ke"
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
                tabIndex={-1}
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
                tabIndex={-1}
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
            disabled={loading || ssoLoading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-3 font-semibold text-white ring-offset-2 hover:bg-neutral-800 focus:ring-1 focus:ring-neutral-600 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:ring-offset-neutral-950 dark:hover:bg-neutral-200 dark:focus:ring-neutral-300"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Just a moment...
              </>
            ) : (
              "Continue with Email"
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-4">
          <form
            action="/api/sso/microsoft/login"
            className="w-full"
            onSubmit={() => setSsoLoading(true)}
          >
            <button
              type="submit"
              onClick={handleLogin}
              disabled={ssoLoading || loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-100 px-4 py-3 font-semibold text-neutral-950 ring-offset-2 hover:bg-neutral-200/60 focus:ring-1 focus:ring-neutral-500 focus:outline-none disabled:opacity-50 dark:bg-neutral-900 dark:text-white dark:ring-offset-neutral-950 dark:hover:bg-neutral-800/60 dark:focus:ring-neutral-400"
            >
              <MicrosoftIcon />
              Continue with Microsoft 365
            </button>
          </form>

          <div className="flex items-center justify-center gap-1 text-sm text-neutral-700 dark:text-neutral-300">
            <span>Don&apos;t have an account?</span>
            <Link
              href="/register"
              className="text-blue-500 hover:underline dark:text-blue-400"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
