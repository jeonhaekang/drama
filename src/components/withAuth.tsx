import { hasCookie, setCookie } from "cookies-next";
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getToken } from "~/server/auth";

const withAuth = <P extends Record<string, unknown>>(
  getServerSideProps: GetServerSideProps<P>
): GetServerSideProps<P> => {
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const { req, res, query } = context;
    const code = query.code as string;

    if (code) {
      const token = await getToken(code);
      if (token) {
        setCookie("token", `Bearer ${token}`, { req, res });
      }
      return {
        redirect: {
          destination: "/home",
          statusCode: 302,
        },
      };
    }

    if (!hasCookie("token", { req, res })) {
      return {
        redirect: {
          destination: "/",
          statusCode: 302,
        },
      };
    }

    return await getServerSideProps(context);
  };
};

export default withAuth;
