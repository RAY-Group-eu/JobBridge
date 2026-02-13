import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/assets/jury/flyer.png',
        destination: '/assets/jury/flyer_v2.png',
        permanent: true,
      },
      {
        source: '/assets/jury/JobBridge - Flyer 1.png',
        destination: '/assets/jury/flyer_v2.png',
        permanent: true,
      },
      {
        source: '/assets/jury/JobBridge - Flyer.png',
        destination: '/assets/jury/flyer_v2.png',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
