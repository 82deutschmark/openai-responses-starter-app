/** @type {import('next').NextConfig} */
const nextConfig = {
  // No need to set output mode; OpenNext adapter handles this
  
  // Cloudflare-specific optimizations
  optimizePackageImports: [
    'lucide-react',
    'recharts',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
  ],
  
  // Ensure we're generating routes compatible with Cloudflare
  // This is critical for API routes and server components
  productionBrowserSourceMaps: false,
};

export default nextConfig;
