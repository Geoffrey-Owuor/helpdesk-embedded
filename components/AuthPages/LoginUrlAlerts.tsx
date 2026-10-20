"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAlertStore } from "@/store/useAlertStore";

// Shows the one-off alerts other pages hand to /login through the URL.
// Kept apart from the form (and wrapped in its own Suspense) because
// useSearchParams opts its Suspense boundary out of prerendering - wrapping
// the whole form would leave the login card blank until the JS hydrates.
export default function LoginUrlAlerts() {
  const searchParams = useSearchParams();

  const triggerAlert = useAlertStore((state) => state.triggerAlert);

  useEffect(() => {
    const reset = searchParams.get("reset");
    const disabled = searchParams.get("disabled");
    const ssoError = searchParams.get("sso_error");

    let shouldCleanUrl = false;

    if (reset === "success") {
      triggerAlert("success", "Your password has been reset successfully");
      shouldCleanUrl = true;
    } else if (disabled === "true") {
      triggerAlert(
        "error",
        "Your account has been disabled, please contact your administrator",
      );
      shouldCleanUrl = true;
    } else if (ssoError) {
      // Set by app/api/sso/microsoft/callback when sign-in doesn't complete
      triggerAlert(
        "error",
        ssoError === "unreachable"
          ? "We couldn't reach Microsoft to complete your sign-in. Please try again in a moment."
          : "Microsoft sign-in didn't complete. Please try again.",
      );
      shouldCleanUrl = true;
    }

    // Clean the URL once if any alert was triggered
    if (shouldCleanUrl) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [searchParams, triggerAlert]);

  return null;
}
