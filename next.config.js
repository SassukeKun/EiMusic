/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com', 
      'picsum.photos',
      'lh3.googleusercontent.com',  // Google user profile pictures
      'googleusercontent.com',      // Alternative Google domain
      'storage.googleapis.com',     // Google Cloud Storage
    ]
  },
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