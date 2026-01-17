"use client";
import { useState } from "react";
import AuthShell from "../AuthShell";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, ArrowRight } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/register/verify-code");
        router.refresh();
      } else {
        setError(data.message || "Email verification failed");
        setLoading(false);
      }
    } catch (error) {
      if (error instanceof Error) setError(error.message);
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-90">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-center text-3xl font-semibold text-neutral-900 dark:text-white">
            Create an Account
          </h1>
          <p className="text-center text-neutral-600 dark:text-neutral-400">
            Enter your email to get started
          </p>
        </div>

        {/* Register Fields */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
          {error && (
            <div className="flex justify-center rounded-full bg-red-50 px-4 py-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-400">
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
                className="w-full rounded-full border border-neutral-400 bg-white py-3 pr-3 pl-14 text-neutral-900 placeholder-neutral-400 focus:border-neutral-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500"
                placeholder="you@example.com"
                required
              />
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
                Sending Code...
              </>
            ) : (
              <>
                Continue <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1 text-sm text-neutral-700 dark:text-neutral-300">
            <span>Already have an account?</span>
            <Link href="/login" className="hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </AuthShell>
  );
};

export default Register;
