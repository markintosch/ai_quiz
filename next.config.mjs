import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async redirects() {
    return [
      // Locale-less assessment URLs → default locale
      { source: '/a/:slug', destination: '/en/a/:slug', permanent: false },
      // Legacy /quiz/ → /a/ (all locales)
      { source: '/quiz/:slug', destination: '/en/a/:slug', permanent: false },
      { source: '/en/quiz/:slug', destination: '/en/a/:slug', permanent: false },
      { source: '/nl/quiz/:slug', destination: '/nl/a/:slug', permanent: false },
      { source: '/fr/quiz/:slug', destination: '/fr/a/:slug', permanent: false },
      { source: '/results/:id', destination: '/en/results/:id', permanent: false },
    ]
  },
}

export default withNextIntl(nextConfig)
