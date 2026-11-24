// The sub-path the app is served under (e.g. "/helpdesk"), "" at the root.
// Read in lib/config.ts, which next.config.ts also uses to set `basePath`.
// <Link>, router.push/replace, redirect() and static imports add it automatically;
// fetch, window.location, window.open, <form action>, <a href> and Response.redirect do not.
import { basePath, baseUrl, hubUrl } from "@/lib/config";

export { basePath, hubUrl };

// Public origin of the app (e.g. "https://apps.example.com"). NEXT_PUBLIC_BASE_URL should be
// the origin only, but a value that already ends with the base path is still accepted.
const appOrigin = (() => {
  const url = baseUrl.replace(/\/+$/, "");
  return basePath && url.endsWith(basePath)
    ? url.slice(0, -basePath.length)
    : url;
})();

// Absolute URL to an app path, for links that leave the browser (emails): appUrl("/login")
export const appUrl = (path = "") => `${appOrigin}${basePath}${path}`;

// The home page URL as window.location.href reports it ("https://host/helpdesk" or "https://host/")
export const homeUrl = appOrigin ? `${appOrigin}${basePath || "/"}` : "";
