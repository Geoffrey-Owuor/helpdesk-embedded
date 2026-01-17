"use client";
import Alert from "@/components/Modules/Alert";
import { useState } from "react";

const VerifyCode = () => {
  const [alertInfo, setAlertInfo] = useState({
    showAlert: true,
    alertType: "success",
    alertMessage: "Verifcation Code Sent",
  });
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
