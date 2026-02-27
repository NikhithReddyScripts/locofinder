/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Leaflet requires transpilation to work with Next.js
  transpilePackages: ["leaflet", "react-leaflet"],
};

module.exports = nextConfig;
