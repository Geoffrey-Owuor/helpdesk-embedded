import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  /* config options here */
  // Enabled per-environment rather than globally: the test pipeline sets
  // NEXT_OUTPUT_STANDALONE=1 so production keeps its current output until the
  // standalone bundle is proven on helpdesk-test.
  output: process.env.NEXT_OUTPUT_STANDALONE === "1" ? "standalone" : undefined,
  allowedDevOrigins: ["192.0.2.10", "192.0.2.10"],
  basePath: basePath,
};

export default nextConfig;
