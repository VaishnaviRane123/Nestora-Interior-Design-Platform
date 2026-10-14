/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Prefer Next's own optimizer at runtime
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 900, 1080, 1200, 1440, 1600, 1920],
    imageSizes: [240, 320, 420, 480, 560, 640, 720, 800],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
  webpack: (config) => {
    // Avoid the pg-native warning in the Edge runtime
    config.externals = [...(config.externals ?? []), 'pg-native'];
    return config;
  },
};

export default nextConfig;
