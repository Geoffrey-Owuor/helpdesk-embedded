// utils/errorHelpers.ts
import { isAxiosError } from "axios";

export const getApiErrorMessage = (error: unknown): string => {
  // Default fallback
  let message = "Something went wrong. Please try again.";

  if (isAxiosError(error)) {
    // 1. Server returned a specific error message (400, 404, 500, etc.)
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    // 2. No response received (Network error, Server down)
    else if (!error.response) {
      message = "Network error. Please check your internet connection.";
    }
  }
  // 3. Generic JavaScript Error
  else if (error instanceof Error) {
    message = error.message;
  }

  return message;
};
