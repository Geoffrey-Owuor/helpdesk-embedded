"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAttachments } from "@/queries/fetchAttachments";
import IssueAttachmentsSkeleton from "@/components/Skeletons/IssueAttachmentsSkeleton";
import {
  Paperclip,
  FileText,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

type Props = {
  uuid: string;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function IssueAttachmentsViewer({ uuid }: Props) {
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ["issueAttachments", uuid],
    queryFn: () => fetchAttachments(uuid),
    enabled: !!uuid,
  });

  if (isLoading) {
    return <IssueAttachmentsSkeleton />;
  }

  if (attachments.length === 0) {
    return null; // Don't render anything if there are no attachments
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <Paperclip className="h-4 w-4" />
          </div>
          Attachments
          <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            {attachments.length}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {attachments.map((attachment) => {
          const isImage = attachment.file_type.startsWith("image/");

          return (
            <Link
              key={attachment.id}
              href={attachment.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-blue-900/50 dark:hover:bg-blue-900/20"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {/* Icon Thumbnail */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-neutral-950">
                  {isImage ? (
                    <ImageIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  ) : (
                    <FileText className="h-5 w-5 text-red-500 dark:text-red-400" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium text-neutral-700 group-hover:text-blue-700 dark:text-neutral-200 dark:group-hover:text-blue-400">
                    {attachment.file_name}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-500">
                    {formatBytes(attachment.file_size)} •{" "}
                    {attachment.file_type.split("/")[1].toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Hover Actions */}
              <div className="ml-2 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-500">
                <ExternalLink className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
