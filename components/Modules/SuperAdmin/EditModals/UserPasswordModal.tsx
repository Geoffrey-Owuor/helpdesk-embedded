"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Send } from "lucide-react";
import FormAsterisk from "../../FormAsterisk";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/store/useAlertStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { UserRecord } from "../Users";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalForm,
  ModalHeader,
} from "../../Modal/Modal";

type UserPasswordModalProps = {
  isModalOpen: boolean;
  hideModal: () => void;
  user: UserRecord;
};

const inputStyles =
  "w-full rounded-xl border bg-white py-2.5 pl-9 text-sm text-neutral-900 shadow-sm transition-all duration-150 placeholder:text-neutral-400 focus:ring-2 focus:outline-none dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500";
const inputBorderStyles =
  "border-neutral-300 focus:border-neutral-500 focus:ring-neutral-200 dark:border-neutral-700 dark:focus:border-neutral-500 dark:focus:ring-neutral-700";
const inputErrorStyles =
  "border-red-400 focus:border-red-400 focus:ring-red-200 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-900";

// A super admin gets a user back into their account: email them the reset
// link (they choose the password), or set one for users without a working
// mailbox. Either way the account is unlocked once the password changes.
const UserPasswordModal = ({
  isModalOpen,
  hideModal,
  user,
}: UserPasswordModalProps) => {
  const queryClient = useQueryClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  // Store states
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);

  const { mutate: sendResetLink, isPending: sendingLink } = useMutation({
    mutationFn: () =>
      apiClient.post("/superadmin/send-reset-link", { userId: user.user_id }),
    onSuccess: (response) => {
      triggerAlert("success", response.data.message);
      hideModal();
    },
    onError: (error) => triggerAlert("error", getApiErrorMessage(error)),
  });

  const { mutate: setUserPassword, isPending: settingPassword } = useMutation(
    {
      mutationFn: () =>
        apiClient.put("/superadmin/set-password", {
          userId: user.user_id,
          password,
          confirmPassword,
        }),
      onSuccess: (response) => {
        // Setting a password also unlocks the account
        queryClient.setQueryData(["UsersDataInfo"], (oldData: UserRecord[]) =>
          oldData?.map((record) =>
            record.user_id === user.user_id
              ? { ...record, is_locked: false }
              : record,
          ),
        );
        queryClient.invalidateQueries({ queryKey: ["UserCountsData"] });
        triggerAlert("success", response.data.message);
        hideModal();
      },
      onError: (error) => triggerAlert("error", getApiErrorMessage(error)),
    },
  );

  const busy = sendingLink || settingPassword;

  const handleSendLink = () => {
    triggerDialog({
      title: "Send Reset Link",
      description: `Email a password reset link to ${user.email}? It expires in 10 minutes.`,
      onConfirm: async () => {
        hideDialog();
        sendResetLink();
      },
    });
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    triggerDialog({
      title: "Set Password",
      description: `Replace ${user.username}'s password? They will be signed out everywhere.`,
      onConfirm: async () => {
        hideDialog();
        setUserPassword();
      },
    });
  };

  return (
    <Modal open={isModalOpen} onClose={hideModal} size="md">
      <ModalHeader
        title="Password"
        description={`Get ${user.username} back into their account`}
      />

      <ModalForm onSubmit={handleSetPassword}>
        <ModalBody className="flex flex-col gap-5">
          {user.is_locked && (
            <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              This account is locked after too many failed sign-ins. A new
              password unlocks it.
            </p>
          )}

          {/* Reset link */}
          <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Send a reset link
            </span>
            <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="break-all">
                The user picks a new password from the link sent to{" "}
                {user.email}
              </span>
            </span>
            <button
              type="button"
              onClick={handleSendLink}
              disabled={busy}
              className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              <Send className="h-3.5 w-3.5" />
              Send Link
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            or set one for them
            <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* New password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="newPassword"
              className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              New Password
              <FormAsterisk />
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className={`${inputStyles} pr-10 ${inputBorderStyles}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmNewPassword"
              className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Confirm Password
              <FormAsterisk />
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className={`${inputStyles} pr-3.5 ${passwordMismatch ? inputErrorStyles : inputBorderStyles}`}
              />
            </div>
            {passwordMismatch && (
              <span className="text-xs text-red-500 dark:text-red-400">
                Passwords do not match
              </span>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={hideModal}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-300 focus:outline-none sm:py-2 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !password || passwordMismatch}
            className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none disabled:opacity-50 sm:py-2 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus:ring-white dark:focus:ring-offset-neutral-950"
          >
            Set Password
          </button>
        </ModalFooter>
      </ModalForm>
    </Modal>
  );
};

export default UserPasswordModal;
