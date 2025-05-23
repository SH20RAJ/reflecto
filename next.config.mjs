/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  serverExternalPackages: ['@libsql/client'],
  webpack: (config, { dev, isServer }) => {
    // Generate source maps for better debugging in development
    if (dev) {
      config.devtool = 'source-map';
    }
    
    // Enable source maps in production for better error tracking
    if (!dev && !isServer) {
      config.devtool = 'hidden-source-map';
    }
    
    return config;
  },
};

export default nextConfig;
