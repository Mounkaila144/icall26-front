import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    // TODO: Fix remaining TypeScript type errors and set to false
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
