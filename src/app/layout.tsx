import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// ── GA4 measurement ID ────────────────────────────────────────────────────────
const GA_ID = 'G-RYG1TNR7NS'

export const metadata: Metadata = {
  title: 'AI Maturity Assessment | Brand PWRD Media',
  description: 'Benchmark your AI maturity across 6 dimensions in 5 minutes. Free, instant results.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // getLocale() reads the current locale from the request (set by next-intl middleware)
  // Falls back gracefully to 'en' for admin/api routes that bypass locale routing
  let locale = 'en'
  try {
    locale = await getLocale()
  } catch {
    // admin / api routes have no locale context — default to 'en'
  }

  return (
    <html lang={locale}>
      <body className={inter.className}>
        {children}

        {/* ── Google Analytics 4 ── */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `}
        </Script>
      </body>
    </html>
  )
}
