
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Reads NEXT_DIST_DIR from the environment (set via cross-env in your scripts).
  // Falls back to the default ".next" when not set — e.g. for `npm run dev` or `npm run build`.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

module.exports = nextConfig;