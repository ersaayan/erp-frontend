/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    return config;
  },
  env: {
    BASE_URL: process.env.BASE_URL,
  },
  // Add output configuration
  output: "standalone",
};

export default nextConfig;
