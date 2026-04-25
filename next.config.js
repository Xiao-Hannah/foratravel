const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this folder (silences multi-lockfile inference warning).
  outputFileTracingRoot: path.join(__dirname),
};

module.exports = nextConfig;
