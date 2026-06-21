/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
    "http://192.168.0.201:3000",
  ],
  outputFileTracingRoot: process.cwd(),
};

module.exports = nextConfig;
