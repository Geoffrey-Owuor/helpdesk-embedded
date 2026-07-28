import apiClient from "@/lib/AxiosClient";

export type CollaboratorRecord = {
  id: number;
  collaborator_id: string;
  collaborator_name: string;
  collaborator_email: string;
  inviter_name: string;
  inviter_email: string;
  invited_at: string;
};

export const fetchCollaborators = async (
  uuid: string,
): Promise<CollaboratorRecord[]> => {
  const response = await apiClient.get(`/collaborators/${uuid}`);
  return response.data;
};
