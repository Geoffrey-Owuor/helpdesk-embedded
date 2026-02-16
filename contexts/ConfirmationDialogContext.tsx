"use client";

import {
  useState,
  createContext,
  useContext,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";

interface ConfirmationDialogValues {
  title: string;
  description: string;
  onConfirm: (() => Promise<void>) | undefined;
  showDialog: boolean;
}

type ConfirmationDialogProviderValues = {
  confirmationDialogInfo: ConfirmationDialogValues;
  setConfirmationDialogInfo: Dispatch<SetStateAction<ConfirmationDialogValues>>;
};

const ConfirmationDialogContext =
  createContext<ConfirmationDialogProviderValues | null>(null);

export const ConfirmationDialogProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [confirmationDialogInfo, setConfirmationDialogInfo] =
    useState<ConfirmationDialogValues>({
      title: "",
      description: "",
      onConfirm: undefined,
      showDialog: false,
    });

  //Our values
  const values = useMemo(
    () => ({
      confirmationDialogInfo,
      setConfirmationDialogInfo,
    }),
    [confirmationDialogInfo],
  );

  return (
    <ConfirmationDialogContext.Provider value={values}>
      {children}
    </ConfirmationDialogContext.Provider>
  );
};

export const useConfirmationDialog = () => {
  const context = useContext(ConfirmationDialogContext);

  if (!context)
    throw new Error(
      "useConfirmationDialog must be used within a ConfirmationDialogProvider",
    );

  return context;
};
