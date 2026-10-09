import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
      // or your custom media domain:
      // { protocol: "https", hostname: "media.narangalainfor.lk" },
    ],
  },
};

export default nextConfig;
