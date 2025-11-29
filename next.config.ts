import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: __dirname,
    rules: {
      "*.md": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
  allowedDevOrigins: ["*.ngrok-free.app"],
  experimental: {
    authInterrupts: true,
  },
  cacheComponents: true,
};

export default nextConfig;
