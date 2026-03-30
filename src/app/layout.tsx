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

        {/* ── LinkedIn Insight Tag (Partner ID: 8838938) ── */}
        <Script id="linkedin-insight" strategy="afterInteractive">
          {`
            _linkedin_partner_id = "8838938";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          `}
        </Script>
        <Script id="linkedin-insight-loader" strategy="afterInteractive">
          {`
            (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);
            })(window.lintrk);
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{display: 'none'}} alt=""
            src="https://px.ads.linkedin.com/collect/?pid=8838938&fmt=gif" />
        </noscript>
      </body>
    </html>
  )
}
