"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  AlertCircle,
} from "lucide-react";

export type AllowedFileType =
  | "application/pdf"
  | "image/jpeg"
  | "image/png"
  | "image/webp";

type DocumentUploadProps = {
  files: File[];
  setFiles: (files: File[]) => void;
  maxTotalSizeMB?: number;
};

const DocumentUpload = ({
  files,
  setFiles,
  maxTotalSizeMB = 2,
}: DocumentUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const MAX_BYTES = maxTotalSizeMB * 1024 * 1024;
  const ALLOWED_TYPES: AllowedFileType[] = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  // --- Helpers ---
  const calculateTotalSize = (currentFiles: File[]) => {
    return currentFiles.reduce((total, file) => total + file.size, 0);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // --- Validation ---
  const handleFilesAdded = (newFiles: File[]) => {
    setError(null);

    // 1. Filter out invalid file types
    const validFiles = newFiles.filter((file) =>
      ALLOWED_TYPES.includes(file.type as AllowedFileType),
    );

    if (validFiles.length < newFiles.length) {
      setError(
        "Some files were rejected. Only PDFs, JPGs, PNGs, and WebP are allowed.",
      );
    }

    // 2. Check total size limit
    const currentTotalSize = calculateTotalSize(files);
    const newFilesSize = calculateTotalSize(validFiles);

    if (currentTotalSize + newFilesSize > MAX_BYTES) {
      setError(`Total attachment size cannot exceed ${maxTotalSizeMB}MB.`);
      return; // Reject the batch if it pushes us over the limit
    }

    // 3. Add to state
    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
    }
  };

  // --- Event Handlers ---
  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(Array.from(e.target.files));
    }
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
    setError(null); // Clear errors when a user removes a file
  };

  const totalCurrentSize = calculateTotalSize(files);

  return (
    <div className="flex w-full flex-col gap-2">
      <label className="text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
        Attachments{" "}
        <span className="font-normal normal-case opacity-70">
          (Optional, Max 2MB)
        </span>
      </label>

      {/* Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
            : "border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
        }`}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={onFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
        />
        <div className="rounded-full bg-neutral-200 p-3 text-neutral-600 transition-colors group-hover:bg-neutral-300 group-hover:text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-neutral-700 dark:group-hover:text-neutral-200">
          <UploadCloud className="h-6 w-6" />
        </div>
        <p className="mt-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Click to upload or drag and drop
        </p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          PDF, PNG, JPG or WebP (max {maxTotalSizeMB}MB total)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-2.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="rounded-md bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {file.type === "application/pdf" ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {file.name}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-500">
                    {formatBytes(file.size)}
                  </span>
                </div>
              </div>
              <button
                type="button" // Important so it doesn't submit the form
                onClick={() => removeFile(index)}
                className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Size Tracker indicator */}
          <div className="mt-1 flex items-center justify-end text-xs font-medium">
            <span
              className={
                totalCurrentSize > MAX_BYTES * 0.9
                  ? "text-orange-500"
                  : "text-neutral-500"
              }
            >
              {formatBytes(totalCurrentSize)} / {maxTotalSizeMB} MB
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
