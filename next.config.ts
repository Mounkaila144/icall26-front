import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  eslint: {
    // Désactiver ESLint pendant le build
    ignoreDuringBuilds: true
  },
  typescript: {
    // Désactiver les vérifications TypeScript pendant le build
    ignoreBuildErrors: true
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/fr/login',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/login',
        permanent: true,
        locale: false
      },
      {
        source: '/:path((?!en|fr|ar|front-pages|favicon\\.ico|api).*)',
        destination: '/fr/:path',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
