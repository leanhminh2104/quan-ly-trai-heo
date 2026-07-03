import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    '192.168.1.22', 
    'localhost', 
    'dalymmo.nport.link', 
    'dalymmo.nport.link:443',
    'dalymmo.loca.lt',
    '*.loca.lt',
    '*.vercel.app'
  ],
};

export default nextConfig;
