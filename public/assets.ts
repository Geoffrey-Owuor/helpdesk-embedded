import issue_desk_logo from "./web-app-manifest-512x512.png";
import issue_desk_image from "./issue_desk_light.png";
import { issueValueTypes } from "@/contexts/IssuesDataContext";

export const assets = {
  issue_desk_logo,
  issue_desk_image,
};

// get current year value and export it
const currentYear = new Date().getFullYear();

export { currentYear };

// Function that receives username
// And generates a capitalized abbreviation from it
// Using a simple regex version
export const abbreviateUserName = (username: string | undefined) => {
  if (!username) return;
  return username.replace(/[^A-Z]/g, "");
};

// Title helper for converting values to string
export const titleHelper = (value: issueValueTypes) => {
  if (!value) return "";

  return value.toString();
};
