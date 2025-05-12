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
  }
};

module.exports = nextConfig; 