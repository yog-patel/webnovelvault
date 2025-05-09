/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'assets.mvlempyr.com',
      'localhost',
      '127.0.0.1'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig 