import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// 1. The Type Definition
let refreshPromise: Promise<unknown> | null = null;

const apiClient = axios.create({
  baseURL: "/api",
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
          .post("/api/refresh-token", {}, { withCredentials: true })
          .then((res) => res.data) // This returns Promise<any>
          .catch((err) => {
            throw err;
          })
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
        console.error("Session expired, redirecting to login");
        // Optional: Use window.location.href or a Next.js router if available
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
