import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  transpilePackages: ["geist"],

  async headers() {
    return [
      // Serve compressed files correctly
      {
        source: "/games/:fileKey/:path*.js.gz",
        headers: [
          { key: "Content-Encoding", value: "gzip" },
          { key: "Content-Type", value: "application/javascript" },
        ],
      },
      {
        source: "/games/:fileKey/:path*.data.gz",
        headers: [
          { key: "Content-Encoding", value: "gzip" },
          { key: "Content-Type", value: "application/octet-stream" },
        ],
      },
      {
        source: "/games/:fileKey/:path*.wasm.gz",
        headers: [
          { key: "Content-Encoding", value: "gzip" },
          { key: "Content-Type", value: "application/wasm" },
        ],
      },
      // Serve uncompressed files with correct MIME types
      {
        source: "/games/:fileKey/:path*.wasm",
        headers: [{ key: "Content-Type", value: "application/wasm" }],
      },
      {
        source: "/games/:fileKey/:path*.js",
        headers: [{ key: "Content-Type", value: "application/javascript" }],
      },
      {
        source: "/games/:fileKey/:path*.data",
        headers: [{ key: "Content-Type", value: "application/octet-stream" }],
      },
      {
        source: "/games/:fileKey/:path*.css",
        headers: [{ key: "Content-Type", value: "text/css" }],
      },
      {
        source: "/games/:fileKey/:path*.html",
        headers: [{ key: "Content-Type", value: "text/html; charset=utf-8" }],
      },
      // Additional headers for game files
      {
        source: "/games/:fileKey/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
      // Content Security Policy for the post page
      {
        source: "/post/:id",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; frame-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

export default config;
