import { hasCookie, setCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { getToken } from "~/server/auth";

const Home = () => {
  return <div>home</div>;
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
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

  return {
    props: {},
  };
};
