import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-neon",
    "@prisma/adapter-pg",
    "twilio",
  ],
};

export default nextConfig;
