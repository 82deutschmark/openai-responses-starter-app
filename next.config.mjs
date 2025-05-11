/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove the 'output: export' option as we're using @cloudflare/next-on-pages
  // which handles the API routes properly
  
  // Disable image optimization since Cloudflare Pages doesn't support it
  images: {
    unoptimized: true,
  },
  
  // Configure experimental features
  experimental: {
    // Enable server actions properly
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.pages.dev']
    }
  }
};

export default nextConfig;
