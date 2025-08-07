/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    nextDevTools: false,
  },
  devtools: false,
  images: {
    domains: ['randomuser.me'], // ✅ This is the correct domain
  },
};

module.exports = nextConfig;
