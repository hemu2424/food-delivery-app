/** @type {import('next').NextConfig} */

const isVercel = Boolean(process.env.VERCEL);

const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Standalone output is needed for Docker, but Vercel requires its default serverless packaging
  ...(isVercel ? {} : { output: "standalone" }),

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;