"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import ClientPortal from "../../ClientPortal";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { X, Send, Eye, Code, Keyboard, AlertCircle } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import DocumentUpload from "../../IssueModals/DocumentUpload";
import FormAsterisk from "../../FormAsterisk";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useAlertStore } from "@/store/useAlertStore";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import DynamicEmailInput from "./DynamicEmailInput"; // TODO: Adjust import path
import dynamic from "next/dynamic";
import "@uiw/react-textarea-code-editor/dist.css";

type PostMailProps = {
  closeModal: () => void;
  isOpen: boolean;
};

// Dynamically import the editor and disable Server-Side Rendering
const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-800" />
    ),
  },
);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setIsPreview((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
            {/* Email Accuracy Disclaimer */}
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 dark:border-amber-900/30 dark:bg-amber-900/10">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300/90">
                <strong className="font-semibold text-amber-900 dark:text-amber-200">
                  Delivery Notice:{" "}
                </strong>
                Please double-check all typed email addresses. Invalid,
                inactive, or incorrectly spelled emails will result in delivery
                failures.
              </p>
            </div>

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
                    className="group relative inline-flex items-center gap-1.5 rounded-lg bg-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
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

                    {/* ── TOOLTIP ── */}
                    <div className="pointer-events-none absolute -top-8 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100 dark:bg-white dark:text-neutral-900">
                      <Keyboard
                        size={14}
                        className="shrink-0 text-neutral-400 dark:text-neutral-500"
                      />
                      <span>Alt + S</span>

                      {/* Tooltip Tail/Arrow (Centered) */}
                      <div className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-sm bg-neutral-900 dark:bg-white" />
                    </div>
                  </button>
                </div>

                {isPreview ? (
                  <div className="min-h-200 overflow-hidden rounded-xl border border-neutral-300 bg-white dark:border-neutral-700">
                    <iframe
                      srcDoc={
                        htmlTemplate ||
                        "<p style='color: gray; font-family: sans-serif; padding-left: 6px;'>Preview will appear here...</p>"
                      }
                      title="Email Preview"
                      className="h-full min-h-200 w-full border-none"
                      sandbox="allow-same-origin" // Restricts scripts from running automatically
                    />
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-neutral-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-neutral-700 dark:bg-[#0d1117]">
                    <CodeEditor
                      value={htmlTemplate}
                      language="html"
                      placeholder="<h1>Insert your raw HTML here...</h1>"
                      onChange={(e) => setHtmlTemplate(e.target.value)}
                      padding={16}
                      minHeight={250}
                      style={{
                        fontSize: 13,
                        fontFamily:
                          "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                        backgroundColor: "transparent", // Let the wrapper div handle the background color
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Attachments */}
              <DocumentUpload
                files={files}
                setFiles={setFiles}
                maxTotalSizeMB={2}
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-end border-t border-neutral-200/50 pt-6 dark:border-neutral-900">
                <button
                  type="submit"
                  disabled={!from || !toEmails[0] || !htmlTemplate}
                  className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
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
