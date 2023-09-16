import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";

export default function Root() {
  return <div>redirect</div>;
}

export const getServerSideProps: GetServerSideProps = async () => {
  const token = getCookie("token");

  if (token) {
    return {
      redirect: {
        destination: "/home",
        statusCode: 302,
      },
    };
  }

  return {
    redirect: {
      destination: `https://api.shop-pro.jp/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_COLOR_ME_CLIENT_ID}&redirect_uri=http://localhost:3000/home&response_type=code&scope=read_products%20write_products%20read_sales%20write_sales%20read_shop_coupons`,
      statusCode: 302,
    },
  };
};
