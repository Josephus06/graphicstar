/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Rewards reward images (4 MB) and Design Online artwork (20 MB) + proof go through server actions.
  experimental: {
    serverActions: { bodySizeLimit: '30mb' },
  },
  // Rewards: native SQLite driver must stay out of the bundle.
  serverExternalPackages: ['better-sqlite3'],
  // Rewards: schema.sql is read at runtime.
  outputFileTracingIncludes: {
    '/rewards/**': ['./src/lib/rewards/schema.sql'],
    '/design/**': ['./src/lib/rewards/schema.sql'],
  },
  images: {
    // Placeholder assets ship as SVG. Once real raster photography lands in
    // /public/images you can drop this whole `images` block.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
