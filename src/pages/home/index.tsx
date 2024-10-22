import { GetServerSideProps } from "next";
import withAuth from "~/components/withAuth";

const Home = () => {
  return <div>home</div>;
};

export default Home;

export const getServerSideProps: GetServerSideProps = withAuth(async () => {
  return {
    props: {},
  };
});
