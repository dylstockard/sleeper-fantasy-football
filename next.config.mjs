/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sleepercdn.com",
        port: "",
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
