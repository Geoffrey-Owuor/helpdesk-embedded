"use client";
import {
  createContext,
  SetStateAction,
  useContext,
  useState,
  Dispatch,
  useMemo,
} from "react";

type AlertInfo = {
  showAlert: boolean;
  alertType: string;
  alertMessage: string;
};
type AlertProviderValues = {
  alertInfo: AlertInfo;
  setAlertInfo: Dispatch<SetStateAction<AlertInfo>>;
};

const AlertContext = createContext<AlertProviderValues | null>(null);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alertInfo, setAlertInfo] = useState<AlertInfo>({
    showAlert: false,
    alertType: "",
    alertMessage: "",
  });

  const value = useMemo(
    () => ({
      alertInfo,
      setAlertInfo,
    }),
    [alertInfo],
  );

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);

  // Optional: Throw error if used outside provider to ensure type safety
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }

  return context;
};
