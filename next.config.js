const path = require("path");

// When deploying to GitHub Pages under https://<user>.github.io/<repo>/
// we serve from a sub-path. Set BASE_PATH in CI (e.g. "/fora") so all
// internal links and static assets are prefixed correctly. Locally
// (`npm run dev`) BASE_PATH is unset so the app serves at "/".
const basePath = process.env.BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this folder (silences multi-lockfile inference warning).
  outputFileTracingRoot: path.join(__dirname),

  // Static HTML export — required for GitHub Pages (no Node server).
  output: "export",

  // Serve under /<basePath>/ on Pages; empty in local dev.
  basePath,
  assetPrefix: basePath || undefined,

  // Pages serves directories as <name>/index.html, so use trailing slashes
  // to keep links consistent.
  trailingSlash: true,

  // next/image's optimizer needs a Node server; disable for static export.
  images: { unoptimized: true },

  // Expose the basePath to the client so any code that needs to build
  // absolute URLs can read it. (next/link handles basePath automatically.)
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = nextConfig;
