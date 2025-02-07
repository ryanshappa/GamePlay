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
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src
                'self'
                'unsafe-inline'
                'unsafe-eval'
                https://*.clerk.dev
                https://*.clerk.com
                https://*.clerk.accounts.dev;
              connect-src
                'self'
                https://*.algolia.net
                https://*.algolianet.com
                https://*.clerk.dev
                https://*.clerk.com
                https://*.clerk.accounts.dev
                https://gameplay-uploads.s3.us-east-2.amazonaws.com;
              worker-src
                'self'
                blob:;
              style-src
                'self'
                'unsafe-inline'
                https://fonts.googleapis.com;
              font-src
                'self'
                https://fonts.gstatic.com;
              frame-src
                'self'
                https://gameplay-uploads.s3.amazonaws.com
                https://gameplay-posts.s3.amazonaws.com;
              img-src
                'self'
                data:
                https://gameplay-uploads.s3.amazonaws.com
                https://img.clerk.com;
              object-src
                'none';
            `.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

export default config;