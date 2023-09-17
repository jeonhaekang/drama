/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img21.shop-pro.jp",
      },
    ],
  },
};

module.exports = nextConfig;
