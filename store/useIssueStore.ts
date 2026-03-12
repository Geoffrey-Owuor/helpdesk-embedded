import { create } from "zustand";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { IssueValueTypes } from "./useIssuesStore";

interface IssueStore {
  loading: boolean;
  issueData: Record<string, IssueValueTypes>;
  fetchIssueData: (uuid: string) => Promise<void>;
}

export const useIssueStore = create<IssueStore>()((set) => ({
  loading: true,
  issueData: {},
  fetchIssueData: async (uuid) => {
    set({ loading: true });
    try {
      const response = await apiClient.get("/get-issue", {
        params: {
          uuid: uuid,
        },
      });

      set({ issueData: response.data });
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      console.error(errorMessage);
      set({ issueData: {} });
    } finally {
      set({ loading: false });
    }
  },
}));
