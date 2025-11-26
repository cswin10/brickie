/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@brickie/lib", "@brickie/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
