import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all external images for flexibility
      },
    ],
  },
};

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
  },
});

export default withPWAConfig(withNextIntl(nextConfig));
