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
      {
        source: "/post/:id",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' https://*.clerk.dev;
              style-src 'self' 'unsafe-inline';
              frame-src 'self' https://gameplay-uploads.s3.amazonaws.com;
              connect-src 'self' https://*.clerk.dev;
              img-src 'self' data: https://gameplay-uploads.s3.amazonaws.com;
            `.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

export default config;