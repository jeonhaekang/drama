import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextPage } from "next";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import { DefaultLayout } from "~/layouts";

import { useIsSSR } from "@react-aria/ssr";
import "react-toastify/dist/ReactToastify.css";
import "~/styles/globals.css";

const queryClient = new QueryClient();

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const isSSR = useIsSSR();

  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <QueryClientProvider client={queryClient}>
          <div className="max-w-5xl mx-auto">
            {!isSSR && getLayout(<Component {...pageProps} />)}
          </div>

          <ToastContainer
            theme="dark"
            pauseOnFocusLoss={false}
            autoClose={2000}
          />
        </QueryClientProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
