import { NextUIProvider } from "@nextui-org/system";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextPage } from "next";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { DefaultLayout } from "~/layouts";
import "~/styles/globals.css";

const queryClient = new QueryClient();

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <NextUIProvider>
      <NextThemesProvider>
        <QueryClientProvider client={queryClient}>
          <div className="max-w-5xl mx-auto">
            {getLayout(<Component {...pageProps} />)}
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
