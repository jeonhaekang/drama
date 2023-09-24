import { getCookie, hasCookie } from "cookies-next";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";

type GSSPWrapper = (
  context: GetServerSidePropsContext,
  token: string
) => Promise<GetServerSidePropsResult<{ token: string }>>;

export const requiredSession = (gssp: GSSPWrapper): GetServerSideProps => {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<{ token: string }>> => {
    const hasToken = hasCookie("token", { req: context.req, res: context.res });

    if (!hasToken) {
      return {
        redirect: {
          destination: "/",
          statusCode: 302,
        },
      };
    }

    const token = getCookie("token", {
      req: context.req,
      res: context.res,
    }) as string;

    const response = await gssp(context, token);

    return response;
  };
};
