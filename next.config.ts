import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.0.5',
    '192.168.0.5:3000',
  ],
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://192.168.0.5:3000/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://192.168.0.5:3000/socket.io/:path*',
      },
    ];
  },
};

export default nextConfig;