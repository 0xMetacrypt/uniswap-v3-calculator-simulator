import NextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
  basePath: "/uniswap-v3-calculator-simulator",
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {},
  poweredByHeader: false,
});

export default nextConfig;
