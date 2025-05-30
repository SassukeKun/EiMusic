/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/ddyuofu2d/image/upload/**',
      },
    ],
  },
  output: 'standalone',
  async redirects() {
    return [
      // Redirecionar de links de confirmação que chegam à raiz
      {
        source: '/',
        has: [
          {
            type: 'query',
            key: 'access_token',
          },
        ],
        destination: '/auth/callback',
        permanent: false,
      },
      // Redirecionar para a callback quando há token no hash
      {
        source: '/#:path*',
        destination: '/auth/callback',
        permanent: false,
        has: [
          {
            type: 'header',
            key: 'referer',
            value: '(.*supabase.*)',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;