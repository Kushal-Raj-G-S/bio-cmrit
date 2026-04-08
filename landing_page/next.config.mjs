/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Skip during dev for speed
  },
  images: {
    unoptimized: true,
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-accordion', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-dialog', '@radix-ui/react-label', '@radix-ui/react-slot'],
  },
  turbopack: {},
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  reactStrictMode: false,
  poweredByHeader: false,
  // Remove 'standalone' for faster dev builds
  // output: 'standalone',
  webpack: (config, { isServer }) => {
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          lib: {
            name: 'lib',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            minChunks: 1,
            reuseExistingChunk: true,
          },
        },
      },
    }
    return config
  },
}

export default nextConfig