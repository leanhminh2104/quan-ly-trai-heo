import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverActions: {
    allowedOrigins: [
      'localhost:3000',
      'dalymmo.loca.lt',
      '*.loca.lt',
      '*.vercel.app'
    ],
  },
};

export default nextConfig;
