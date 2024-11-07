import crypto from "crypto";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports
  output: "standalone",

  // Optimize module resolution
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "lucide-react"],
  },

  // Transpile specific modules
  transpilePackages: [
    "lucide-react",
    "@radix-ui/react-icons",
    "devextreme-react",
    "devextreme",
  ],

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Optimize chunk loading
    config.optimization.splitChunks = {
      chunks: "all",
      minSize: 20000,
      maxSize: 100000,
      cacheGroups: {
        default: false,
        vendors: false,
        framework: {
          chunks: "all",
          name: "framework",
          test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-sync-external-store)[\\/]/,
          priority: 40,
          enforce: true,
        },
        commons: {
          name: "commons",
          minChunks: 2,
          priority: 20,
        },
        shared: {
          name: (module, chunks) => {
            return `shared-${crypto
              .createHash("sha1")
              .update(
                Array.from(chunks).reduce((acc, chunk) => acc + chunk.name, "")
              )
              .digest("hex")
              .substring(0, 8)}`;
          },
          priority: 10,
          minChunks: 2,
          reuseExistingChunk: true,
        },
      },
    };

    return config;
  },
};

export default nextConfig;
