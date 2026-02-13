import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
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
