import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
    "http://192.168.0.201:3000",
  ],
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
