import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.34.234", "192.168.0.112"],
  basePath: basePath,
};

export default nextConfig;
