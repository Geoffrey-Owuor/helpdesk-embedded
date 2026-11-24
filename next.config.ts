import type { NextConfig } from "next";
import { basePath, devAllowedOrigins } from "./lib/config";

const nextConfig: NextConfig = {
  /* config options here */
  // Enabled per-environment rather than globally: the test pipeline sets
  // NEXT_OUTPUT_STANDALONE=1 so production keeps its current output until the
  // standalone bundle is proven on the test environment.
  output: process.env.NEXT_OUTPUT_STANDALONE === "1" ? "standalone" : undefined,
  // Identifies this build to components/Modules/useUpdateAvailable.ts. GitHub
  // Actions sets GITHUB_SHA, so a local build or dev server has no version and
  // never offers an update.
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.GITHUB_SHA ?? "",
  },
  // A tab on an older build gets a full page load on its next navigation that
  // reaches the server, rather than a client-side one against this build.
  deploymentId: process.env.GITHUB_SHA,
  allowedDevOrigins: devAllowedOrigins,
  basePath: basePath,
};

export default nextConfig;
