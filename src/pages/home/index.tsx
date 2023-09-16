import { setCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { getToken } from "~/apis/auth";

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
  }

  return { props: {} };
};
