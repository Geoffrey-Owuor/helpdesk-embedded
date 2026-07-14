import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useDbStore } from "@/store/useDbStore";
import { basePath } from "@/public/assets";

// 1. The Type Definition
let refreshPromise: Promise<unknown> | null = null;

const apiClient = axios.create({
  baseURL: `${basePath}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    // 2. Type Assertion for the config
    // We cast to InternalAxiosRequestConfig and add the custom _retry flag
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 1. If the error is a 500, DON'T refresh. Just fail.
    if (error.response?.status === 503) {
      // Trigger Healthcheck
      useDbStore.getState().triggerCheck();

      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes("refresh-token")
    ) {
      originalRequest._retry = true;

      // 3. Logic using the type
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${basePath}/api/refresh-token`, {}, { withCredentials: true })
          .then((res) => res.data) // This returns Promise<any>
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        // We await the generic promise
        await refreshPromise;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Use Axios's built-in type guard
        if (axios.isAxiosError(refreshError)) {
          // Now 'err' is typed as AxiosError
          if (refreshError.response?.status === 503) {
            // Trigger Healthcheck
            useDbStore.getState().triggerCheck();

            return Promise.reject(refreshError);
          }
        }
        // A 401 error - token probably expired redirect to login
        window.location.href = `${basePath}/login`;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
