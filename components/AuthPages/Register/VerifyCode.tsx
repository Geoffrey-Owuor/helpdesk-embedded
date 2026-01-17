"use client";
import Alert from "@/components/Modules/Alert";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiHandler } from "@/utils/ApiHandler";
import AuthShell from "../AuthShell";
import { useState, useEffect, useRef, useCallback, ChangeEvent } from "react";

const VerifyCode = ({ email }: { email: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // code states
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coolDown, setCoolDown] = useState(0);

  // Refs to control focus
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Derived state to check if the code is full
  const isCodeFull = otp.join("").length === 6;

  // Alert info state
  const [alertInfo, setAlertInfo] = useState({
    showAlert: searchParams.get("sent") === "true",
    alertType: "success",
    alertMessage: "Verification code sent!",
  });

  //UseEffect for cleaning the url after alert is shown
  useEffect(() => {
    // Check if we were redirected with success
    if (searchParams.get("sent") === "true") {
      // clean url so that a refresh does not show the url again
      const newUrl = window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
  }, [searchParams]);

  // Memoize the submitcode function so that it does not run every time
  const submitCode = useCallback(
    async (codeToSubmit: string) => {
      setLoading(true);
      setError("");

      try {
        const response = await ApiHandler("/api/register/verify-code", "POST", {
          email,
          code: codeToSubmit,
        });

        const data = await response.json();

        // throw an error if the response is not ok (not status: 200)
        if (!response.ok)
          throw new Error(data.message || "Verification failed");

        // Response is ok - push user to complete registration
        router.push("/register/complete-registration?sent=true");
      } catch (error) {
        if (error instanceof Error)
          setError(error.message || "Unknown Error Occurred");
        setLoading(false);
      }
    },
    [email, router],
  );

  // UseEffect for auto-submission
  useEffect(() => {
    if (isCodeFull) {
      submitCode(otp.join(""));
    }
  }, [isCodeFull, submitCode, otp]);

  // Function to handle typing and auto-focus next
  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target?.value;

    // Only allow single digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); //get only the last character
    setOtp(newOtp);

    // Move focus to the next input if a digit was entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handling backspace pressing
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // If backspace is pressed on empty input, focus previous one
      inputRefs.current[index - 1]?.focus();

      // Clear previous input value
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  //Handle pasting a six digit code
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const paste = e.clipboardData?.getData("text") || "";

    if (/^\d{6}$/.test(paste)) {
      setOtp(paste.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const resendCode = async () => {
    if (coolDown > 0) return;
    setCoolDown(60);
    // Clear the previous code and reset focus on clicking code resend
    setOtp(new Array(6).fill("")); //Clear otp on error
    inputRefs.current[0]?.focus();

    try {
      await ApiHandler("/api/register", "POST", { email });

      //  Show alert
      setAlertInfo({
        showAlert: true,
        alertType: "success",
        alertMessage: "Verification Code Resent",
      });
    } catch (error) {
      console.error("Resend failed", error);
    }
  };

  // Click handler when a user clicks next boxes without filling in the previous boxes
  const handleInputClick = (index: number) => {
    // Find the first empty index
    const firstEmptyIndex = otp.indexOf("");

    // If the user clicks a box ahead of the current progress,
    // redirect them to the first empty box.
    if (index > firstEmptyIndex && firstEmptyIndex !== -1) {
      inputRefs.current[firstEmptyIndex]?.focus();
    }
  };

  // Add a useEffect to manage the timer
  useEffect(() => {
    if (coolDown <= 0) return;
    const timer = setTimeout(() => {
      setCoolDown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [coolDown]);

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
        <div className="flex items-center justify-center">
          <div className="w-full max-w-sm space-y-6">
            {/* Title and Subtitle Section */}
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                Verification Code
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                If the email exists, a 6-digit verification code has been sent
                to{" "}
                <span className="font-medium text-neutral-900 dark:text-white">
                  {email}
                </span>
              </p>
            </div>

            {/* Global Error Message */}
            {error && (
              <div className="rounded-full bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Form Section */}
            <form className="space-y-6" autoComplete="off">
              {/* 6 box input layout */}
              <div
                className="flex justify-center space-x-3"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    onClick={() => handleInputClick(index)}
                    inputMode="numeric"
                    pattern="\d{1}"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    required
                    disabled={loading}
                    // Styling updated to match input fields and use focus rings
                    className={`h-15 w-14 rounded-lg text-neutral-900 dark:text-white ${error ? "border-red-500 focus:ring-red-500" : "border-neutral-400 focus:ring-neutral-400 dark:border-neutral-700 dark:focus:ring-neutral-700"} border bg-white text-center text-xl font-semibold focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-950`}
                  />
                ))}
              </div>
            </form>

            {/* Resend Code Link */}
            <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              Didn&apos;t receive a code?{" "}
              <button
                type="button"
                onClick={resendCode}
                // Updated resend button styling for consistency
                className={`${coolDown > 0 ? "cursor-default" : "cursor-pointer hover:underline"} font-semibold text-neutral-900 dark:text-white`}
                disabled={coolDown > 0}
              >
                {coolDown > 0 ? `Resend code in ${coolDown}s` : "Resend code"}
              </button>
            </div>
          </div>
        </div>
      </AuthShell>
    </>
  );
};

export default VerifyCode;
