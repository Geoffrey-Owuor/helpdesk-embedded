"use client";
import Alert from "@/components/Modules/Alert";
import { useSearchParams, useRouter } from "next/navigation";
import AuthShell from "../AuthShell";
import { useState, useEffect } from "react";

const VerifyCode = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

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

      <div>This is the verify code component</div>
    </>
  );
};

export default VerifyCode;
