/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    return config;
  },
  // Add output configuration
  output: "standalone",
};

export default nextConfig;
