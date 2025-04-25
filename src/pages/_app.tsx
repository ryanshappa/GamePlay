import Head from 'next/head';
import { GeistSans } from 'geist/font/sans';
import { type AppType } from 'next/app';
import { api } from '~/utils/api';
import { AppProps } from 'next/app';
import '~/styles/globals.css';
import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import { AuthProvider } from '~/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { LayoutDesktop } from '~/components/LayoutDesktop';
import { LayoutMobile } from '~/components/LayoutMobile';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
  disableLayout?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// Dynamically import ClerkProvider with no SSR
const ClerkProviderClient = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.ClerkProvider),
  { ssr: false }
);

const MyApp: AppType = ({ Component, pageProps }: AppPropsWithLayout) => {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  // Apply the page's layout if specified, otherwise use our responsive layouts
  const pageWithLayout = getLayout(<Component {...pageProps} />);

  return (
    <>
      <Head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Include the Press Start 2P font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
        {/* Add viewport meta tag with content-width=device-width */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <AuthProvider>
        {/* This provider only exists on the browser */}
        <ClerkProviderClient {...pageProps}>
          <div className={GeistSans.className}>
            {Component.disableLayout ? (
              pageWithLayout
            ) : (
              <>
                <LayoutMobile>{pageWithLayout}</LayoutMobile>
                <LayoutDesktop>{pageWithLayout}</LayoutDesktop>
              </>
            )}
          </div>
        </ClerkProviderClient>
      </AuthProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
