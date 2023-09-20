/** @type {import('next').NextConfig} */
const nextConfig = {
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
