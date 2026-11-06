/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: '/uploads/:filename*', destination: '/api/uploads/:filename*' },
      { source: '/login', destination: '/' },
      { source: '/menu', destination: '/' },
      { source: '/ventas', destination: '/' },
      { source: '/catalogo', destination: '/' },
      { source: '/mesas', destination: '/' },
      { source: '/inventario', destination: '/' },
      { source: '/ingredientes', destination: '/' },
      { source: '/cocina', destination: '/' },
      { source: '/finanzas', destination: '/' },
      { source: '/reportes', destination: '/' },
      { source: '/configuracion', destination: '/' },
      { source: '/dashboard', destination: '/' },
      { source: '/alertas', destination: '/' },
    ]
  },
}

export default nextConfig
