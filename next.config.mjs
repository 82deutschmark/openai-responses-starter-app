/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static output generation for Cloudflare Pages
  output: 'export',
  
  // Disable image optimization since Cloudflare Pages doesn't support it
  images: {
    unoptimized: true,
  },
  
  // Disable Next.js server features if using static export
  // Comment these out if you're using @cloudflare/next-on-pages
  experimental: {
    // Allows Edge API routes
    serverActions: true,
  }
};

export default nextConfig;
