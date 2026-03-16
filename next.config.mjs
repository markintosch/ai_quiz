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
      // Locale-less quiz URLs → default locale
      { source: '/quiz/:slug', destination: '/en/quiz/:slug', permanent: false },
      { source: '/results/:id', destination: '/en/results/:id', permanent: false },
    ]
  },
}

export default withNextIntl(nextConfig)
