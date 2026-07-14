import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.0.2.10", "192.0.2.10"],
  basePath: basePath,
};

export default nextConfig;
