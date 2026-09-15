import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/Login/Login',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const backendUrl = (process.env.BACKEND_PROXY_URL
      || (process.env.NODE_ENV === 'production' ? 'https://backend-xe.onrender.com' : 'http://localhost:5000'))
      .replace(/\/$/, '');

    return [
      {
        source: '/api/backend/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
