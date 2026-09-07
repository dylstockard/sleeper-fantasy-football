/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sleepercdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sleeper.app",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
