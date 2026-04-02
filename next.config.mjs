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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control',     value: 'on' },
        ],
      },
    ]
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
      // Clean URLs for static HTML pitch pages
      { source: '/hire',               destination: '/hire.html',               permanent: false },
      { source: '/match-engine-pitch', destination: '/match-engine-pitch.html', permanent: false },
      // Bas Westland pitch pages
      { source: '/bas',                destination: '/bas.html',                permanent: false },
      { source: '/recruiter-pitch',    destination: '/recruiter-pitch.html',    permanent: false },
    ]
  },
}

export default withNextIntl(nextConfig)
