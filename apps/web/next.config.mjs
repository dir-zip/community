/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: [
    "@dir/core",
    "@dir/db"
  ],
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: process.env.S3_MAX_SIZE,
    serverComponentsExternalPackages: ["better-sqlite3"],
  },
};

export default config;
