import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { getLocale } from 'next-intl/server'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
      </body>
    </html>
  )
}
