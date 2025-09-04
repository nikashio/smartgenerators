/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle WASM files for heic-decode
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    
    // Ensure WASM files are properly handled
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    })

    // Copy WASM files to public directory during build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      }
    }

    return config
  },
}

export default nextConfig