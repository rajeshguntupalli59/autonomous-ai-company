/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/orchestrator/:path*', destination: 'http://localhost:8002/:path*' },
      { source: '/api/memory/:path*',       destination: 'http://localhost:8001/:path*' },
      { source: '/api/gateway/:path*',      destination: 'http://localhost:8000/:path*' },
    ]
  }
}
module.exports = nextConfig
