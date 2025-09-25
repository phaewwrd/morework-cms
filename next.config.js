/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  
  compress: !isDev, 
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' }
        ]
      }
    ]
  },

  env: {
    NODE_ENV: process.env.NODE_ENV,
  },

  productionBrowserSourceMaps: isDev, // dev = true, prod = false

  output: isDev ? undefined : 'standalone',
}

module.exports = nextConfig
