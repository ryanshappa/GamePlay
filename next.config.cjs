// next.config.cjs
/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: { locales: ["en"], defaultLocale: "en" },
  transpilePackages: ["geist"],
  async headers() {
    return [
      {
        // Apply these headers to all routes.
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
          // You can include your Content-Security-Policy as needed:
          { 
            key: 'Content-Security-Policy', 
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev; connect-src 'self'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self'; img-src 'self' data:; object-src 'none';"
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
