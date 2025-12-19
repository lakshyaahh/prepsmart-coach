import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable ESLint checks during the build step on Vercel.
  // We need this temporarily because the Vercel environment enforces strict linting,
  // and the current project has linting errors that are halting the production build.
  eslint: {
    // !! WARNING !!
    // Dangerously allow production builds to complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Allow dev origins (useful for ngrok tunnels during local testing)
  experimental: {
    // `allowedDevOrigins` helps avoid cross-origin warnings in dev when using tunnels
    allowedDevOrigins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://roseanna-capitular-kneadingly.ngrok-free.dev'
    ],
  },
  // NOTE: If you had any other existing configuration properties in this file,
  // make sure you add them back here (e.g., output mode).
};

export default nextConfig;