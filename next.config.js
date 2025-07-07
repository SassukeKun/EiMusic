/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle the realtime-js warning
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    config.module.rules.push({
      test: /@supabase\/realtime-js\/src\/RealtimeClient\.js$/,
      use: [{
        loader: 'imports-loader',
        options: {
          type: 'commonjs',
          imports: [
            'single @supabase/realtime-js/dist/module/RealtimeClient RealtimeClient',
          ],
        },
      }],
    });

    // Important: return the modified config
    return config;
  },
  images: {
    domains: ["res.cloudinary.com", "lh3.googleusercontent.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/ddyuofu2d/image/upload/**",
      },

      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // Redirecionar de links de confirmação que chegam à raiz
      {
        source: "/",
        has: [
          {
            type: "query",
            key: "access_token",
          },
        ],
        destination: "/auth/callback",
        permanent: false,
      },
      // Redirecionar para a callback quando há token no hash
      {
        source: "/#:path*",
        destination: "/auth/callback",
        permanent: false,
        has: [
          {
            type: "header",
            key: "referer",
            value: "(.*supabase.*)",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
