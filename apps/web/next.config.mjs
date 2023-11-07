/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: [
    "@1upsaas/core",
    "@1upsaas/db"
  ],
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: process.env.S3_MAX_SIZE
  },
};

export default config;
