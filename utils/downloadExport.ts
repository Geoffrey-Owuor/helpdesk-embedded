import { isAxiosError } from "axios";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";

// Today's date for an export's file name, e.g. 2026-11-07. Slashes (what
// toLocaleDateString gives) aren't allowed in file names.
export const exportFileDate = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Keeps a value safe to put in a file name
export const fileNamePart = (value: string) =>
  value
    .trim()
    .replace(/[^\p{L}\p{N}._-]+/gu, "_")
    .replace(/^_+|_+$/g, "");

// An export asks for a blob, so an error's JSON body arrives as a Blob too and
// getApiErrorMessage can't see its message. Read it back first.
const exportErrorMessage = async (error: unknown) => {
  if (isAxiosError(error) && error.response?.data instanceof Blob) {
    try {
      const body = JSON.parse(await error.response.data.text());
      if (typeof body?.message === "string") return body.message as string;
    } catch {
      // Not JSON - fall through to the generic message
    }
  }
  return getApiErrorMessage(error);
};

// Downloads an export route's file. Returns the response headers on success
// (routes report extra details in them), or throws an Error carrying the
// server's message.
export const downloadExport = async (
  path: string,
  params: Record<string, string>,
  fileName: string,
) => {
  try {
    const response = await apiClient.get<Blob>(path, {
      params,
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoking straight away can cancel the download in some browsers
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    return response.headers;
  } catch (error) {
    throw new Error(await exportErrorMessage(error));
  }
};
