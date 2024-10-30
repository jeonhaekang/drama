/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["brqlxasdxzxvyydvcauh.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img21.shop-pro.jp",
      },
    ],
  },
};

module.exports = nextConfig;
