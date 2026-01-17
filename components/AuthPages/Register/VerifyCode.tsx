"use client";
import Alert from "@/components/Modules/Alert";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiHandler } from "@/utils/ApiHandler";
import AuthShell from "../AuthShell";
import { useState, useEffect, useRef, useCallback } from "react";

const VerifyCode = ({ email }: { email: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // code states
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coolDown, setCoolDown] = useState(0);

  // Refs to control focus
  const inputRefs = useRef([]);

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
  const submitCode = useCallback(async (codeToSubmit: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await ApiHandler("/api/verify-code", "POST", {
        email,
        code: codeToSubmit,
      });
    } catch (error) {}
  }, []);

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
        <div></div>
      </AuthShell>
    </>
  );
};

export default VerifyCode;
