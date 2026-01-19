"use client";
import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import Alert from "@/components/Modules/Alert";
import { Loader2, ArrowRight, Mail } from "lucide-react";
import AuthShell from "../AuthShell";
import { ApiHandler } from "@/utils/ApiHandler";
import { validateHotpointEmail } from "@/utils/Validators";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //   Control which parts of the ui to show based on the step
  const [step, setStep] = useState(1);
  const [alertInfo, setAlertInfo] = useState({
    alertType: "",
    showAlert: false,
    alertMessage: "",
  });
  const [popUpAlert, setPopUpAlert] = useState({
    alertType: "",
    showAlert: false,
    alertMessage: "",
  });
  const [coolDown, setCoolDown] = useState(0);

  //   Submit Email
  const submitRequest = async () => {
    // clear alerts
    setAlertInfo({
      alertType: "",
      showAlert: false,
      alertMessage: "",
    });

    if (!validateHotpointEmail(email)) {
      setAlertInfo({
        alertType: "error",
        showAlert: true,
        alertMessage: "Email provided is not a valid Hotpoint email",
      });

      return;
    }
    setIsLoading(true);

    try {
      const response = await ApiHandler("/api/forgot-password", "POST", {
        email,
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Error while sending a reset link");

      setAlertInfo({
        alertType: "success",
        showAlert: true,
        alertMessage: data.message,
      });

      // Set step to 2
      setStep(2);
    } catch (error) {
      if (error instanceof Error) {
        setAlertInfo({
          alertType: "error",
          showAlert: true,
          alertMessage: error.message,
        });
      }
      console.error("Error while sending the reset link", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    await submitRequest();
  };

  const handleResendLink = async () => {
    if (coolDown > 0) return;
    setCoolDown(60);

    await submitRequest();

    // Show pop up alert
    setPopUpAlert({
      alertType: "success",
      showAlert: true,
      alertMessage: "Reset Link Resent!",
    });
  };

  // Cooldown timer
  useEffect(() => {
    if (coolDown <= 0) return;
    const timer = setTimeout(() => {
      setCoolDown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [coolDown]);

  return (
    <>
      {popUpAlert.showAlert && (
        <Alert
          type={popUpAlert.alertType}
          message={popUpAlert.alertMessage}
          onClose={() =>
            setPopUpAlert({ alertType: "", showAlert: false, alertMessage: "" })
          }
        />
      )}
      <AuthShell>
        <div className="w-full max-w-90 px-2">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-center text-3xl font-semibold text-neutral-900 dark:text-white">
              {step === 1 ? "Forgot Password" : "Check Your Email"}
            </h1>
            <p className="text-center text-neutral-600 dark:text-neutral-400">
              {step === 1 ? (
                "Enter your email to get a reset link"
              ) : (
                <span>
                  Check your email at{" "}
                  <span className="text-blue-500">{email}</span> for the reset
                  link
                </span>
              )}
            </p>
          </div>

          {/* Register Fields */}
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-6"
          >
            {alertInfo.showAlert && (
              <div
                className={`rounded-full ${alertInfo.alertType === "error" ? "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400" : "bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400"} px-4 py-3 text-center text-sm`}
              >
                {alertInfo.alertMessage}
              </div>
            )}

            {/* Email Input */}
            {step === 1 && (
              <>
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-3 font-semibold text-white ring-offset-2 hover:bg-neutral-800 focus:ring-1 focus:ring-neutral-600 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:ring-offset-neutral-950 dark:hover:bg-neutral-200 dark:focus:ring-neutral-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </>
            )}

            {step === 2 && (
              <div className="flex items-center justify-center gap-1 text-sm text-neutral-700 dark:text-neutral-300">
                <span>Didn&apos;t get the link?</span>
                <button
                  type="button"
                  disabled={!email || isLoading || coolDown > 0}
                  onClick={handleResendLink}
                  className="cursor-pointer hover:underline disabled:cursor-default disabled:opacity-50 disabled:hover:no-underline"
                >
                  {coolDown > 0 ? `Resend in ${coolDown}s` : "Resend"}
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-1 text-sm text-neutral-700 dark:text-neutral-300">
              <span>Back to login?</span>
              <Link href="/login" className="hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </AuthShell>
    </>
  );
};

export default ForgotPassword;
