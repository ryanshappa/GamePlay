import Head from 'next/head';
import { GeistSans } from 'geist/font/sans';
import { type AppType } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import { api } from '~/utils/api';
import { AppProps } from 'next/app';
import '~/styles/globals.css';
import Layout from '~/components/layout';
import { ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import { dark, neobrutalism, shadesOfPurple } from '@clerk/themes';
type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType = ({ Component, pageProps }: AppPropsWithLayout) => {
  // Use the layout defined at the page level, if available
  const getLayout =
    Component.getLayout ||
    ((page: ReactElement) => (
      <Layout>
        {page}
      </Layout>
    ));

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
      </Head>
      <ClerkProvider
        {...pageProps}
        appearance={{
          baseTheme: neobrutalism,
          signIn: { baseTheme: neobrutalism },
        }}
      >
        <div className={GeistSans.className}>
          {getLayout(<Component {...pageProps} />)}
        </div>
      </ClerkProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
