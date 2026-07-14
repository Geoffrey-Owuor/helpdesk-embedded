import apiClient from "@/lib/AxiosClient";

export type AttachmentRecord = {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
};

export const fetchAttachments = async (
  uuid: string,
): Promise<AttachmentRecord[]> => {
  const response = await apiClient.get(`/attachments/${uuid}`);
  return response.data;
};
