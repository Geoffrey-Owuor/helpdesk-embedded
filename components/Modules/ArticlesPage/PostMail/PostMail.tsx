"use client";

import { useState, useRef, FormEvent } from "react";
import ClientPortal from "../../ClientPortal";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { X, Send, Eye, Code } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import DocumentUpload from "../../IssueModals/DocumentUpload";
import FormAsterisk from "../../FormAsterisk";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useAlertStore } from "@/store/useAlertStore";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import DynamicEmailInput from "./DynamicEmailInput"; // TODO: Adjust import path

type PostMailProps = {
  closeModal: () => void;
  isOpen: boolean;
};

const PostMail = ({ closeModal, isOpen }: PostMailProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrapping(modalRef, isOpen, closeModal);

  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);

  // Form States
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [toEmails, setToEmails] = useState<string[]>([""]);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);
  const [htmlTemplate, setHtmlTemplate] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // UI States
  const [isPreview, setIsPreview] = useState(false);

  // Array handlers
  const handleArrayChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string,
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addArrayField = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter((prev) => [...prev, ""]);
  };

  const removeArrayField = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async () => {
    hideDialog();
    showOverlay("Loading");

    try {
      const submitData = new FormData();

      // Append text fields
      submitData.append("from", from);
      submitData.append("subject", subject);
      submitData.append("html", htmlTemplate);

      // Clean and append array fields as JSON strings
      const cleanTo = toEmails.filter((e) => e.trim() !== "");
      const cleanCc = ccEmails.filter((e) => e.trim() !== "");
      const cleanBcc = bccEmails.filter((e) => e.trim() !== "");

      submitData.append("to", JSON.stringify(cleanTo));
      submitData.append("cc", JSON.stringify(cleanCc));
      submitData.append("bcc", JSON.stringify(cleanBcc));

      // Append files
      files.forEach((file) => {
        submitData.append("attachments", file);
      });

      // TODO: Ensure this matches your API route path below
      const response = await apiClient.post("/send-custom-email", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      hideOverlay();
      triggerAlert("success", response.data.message);

      // Reset form and close
      setFrom("");
      setSubject("");
      setToEmails([""]);
      setCcEmails([]);
      setBccEmails([]);
      setHtmlTemplate("");
      setFiles([]);
      closeModal();
    } catch (error) {
      hideOverlay();
      triggerAlert("error", getApiErrorMessage(error));
    }
  };

  const handleConfirmSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (
      !from ||
      toEmails.filter((e) => e.trim() !== "").length === 0 ||
      !htmlTemplate
    ) {
      triggerAlert("error", "Missing required fields");
      return;
    }

    triggerDialog({
      title: "Send Custom Email",
      description: "Are you sure you want to dispatch this email?",
      onConfirm: handleFormSubmit,
    });
  };

  if (!isOpen) return null;

  return (
    <ClientPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 dark:bg-black/80">
        <div
          ref={modalRef}
          className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-neutral-300 bg-neutral-50 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200/50 p-4 dark:border-neutral-900">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Custom Email Dispatch
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Compose and send raw HTML emails.
              </p>
            </div>
            <button
              onClick={closeModal}
              className="rounded-full p-2 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Body */}
          <div className="layout-scrollbar flex-1 overflow-y-auto p-6">
            <form
              onSubmit={handleConfirmSubmit}
              autoComplete="off"
              className="space-y-6"
            >
              {/* From & Subject Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                    From Address <FormAsterisk />
                  </label>
                  <input
                    type="email"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    required
                    placeholder="e.g. admin@yourdomain.com"
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                    Subject <FormAsterisk />
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="Email subject..."
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              {/* Dynamic Email Fields */}
              <div className="grid grid-cols-1 gap-6 rounded-xl border border-neutral-200 bg-neutral-100/50 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/50">
                <DynamicEmailInput
                  label="To"
                  emails={toEmails}
                  onChange={(idx, val) =>
                    handleArrayChange(setToEmails, idx, val)
                  }
                  onAdd={() => addArrayField(setToEmails)}
                  onRemove={(idx) => removeArrayField(setToEmails, idx)}
                  required
                />
                <DynamicEmailInput
                  label="CC"
                  emails={ccEmails}
                  onChange={(idx, val) =>
                    handleArrayChange(setCcEmails, idx, val)
                  }
                  onAdd={() => addArrayField(setCcEmails)}
                  onRemove={(idx) => removeArrayField(setCcEmails, idx)}
                />
                <DynamicEmailInput
                  label="BCC"
                  emails={bccEmails}
                  onChange={(idx, val) =>
                    handleArrayChange(setBccEmails, idx, val)
                  }
                  onAdd={() => addArrayField(setBccEmails)}
                  onRemove={(idx) => removeArrayField(setBccEmails, idx)}
                />
              </div>

              {/* HTML Area with Preview Toggle */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                    HTML Template <FormAsterisk />
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPreview(!isPreview)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    {isPreview ? (
                      <>
                        <Code size={14} /> Edit HTML
                      </>
                    ) : (
                      <>
                        <Eye size={14} /> Preview
                      </>
                    )}
                  </button>
                </div>

                {isPreview ? (
                  <div className="min-h-200 overflow-hidden rounded-xl border border-neutral-300 bg-white dark:border-neutral-700">
                    <iframe
                      srcDoc={
                        htmlTemplate ||
                        "<p style='color: gray; font-family: sans-serif; padding: 20px;'>Preview will appear here...</p>"
                      }
                      title="Email Preview"
                      className="h-full min-h-200 w-full border-none bg-white"
                      sandbox="allow-same-origin" // Restricts scripts from running automatically
                    />
                  </div>
                ) : (
                  <textarea
                    value={htmlTemplate}
                    onChange={(e) => setHtmlTemplate(e.target.value)}
                    required
                    rows={20}
                    placeholder="<h1>Insert your raw HTML here...</h1>"
                    className="resize-y rounded-xl border border-neutral-300 bg-slate-50 px-3 py-3 font-mono text-sm text-slate-800 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-100"
                  />
                )}
              </div>

              {/* Attachments */}
              <DocumentUpload
                files={files}
                setFiles={setFiles}
                maxTotalSizeMB={10}
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-end border-t border-neutral-200/50 pt-6 dark:border-neutral-900">
                <button
                  type="submit"
                  disabled={!from || !toEmails[0] || !htmlTemplate}
                  className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Send Custom Email
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

export default PostMail;
