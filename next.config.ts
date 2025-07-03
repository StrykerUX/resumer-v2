import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily disable ESLint during builds to avoid blocking development
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure external packages for serverless compatibility
  serverExternalPackages: ['pdf2pic', 'tesseract.js', 'puppeteer', 'sharp'],
  webpack: (config, { isServer }) => {
    // Fix for NextAuth.js UUID module issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        canvas: false,
        encoding: false,
      };
    }

    // Fix for uuid module and OCR libraries
    config.externals = config.externals || [];
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
      'canvas': 'commonjs canvas',
    });

    return config;
  },
  // experimental: {
  //   // Disable turbopack temporarily to fix the issue
  //   turbo: false,
  // },
};

export default nextConfig;
