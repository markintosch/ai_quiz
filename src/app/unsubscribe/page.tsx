import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Unsubscribe — Brand PWRD Media',
  robots: 'noindex',
}

interface PageProps {
  searchParams: { success?: string; error?: string }
}

export default function UnsubscribePage({ searchParams }: PageProps) {
  const success = searchParams.success === '1'
  const error   = searchParams.error

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {success ? (
          <>
            <div className="text-5xl mb-4">✓</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">You&apos;ve been unsubscribed</h1>
            <p className="text-sm text-gray-500 mb-6">
              You will no longer receive marketing emails from Brand PWRD Media.
              Your assessment results and any previously agreed transactional communications
              are unaffected.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Changed your mind? Email us at{' '}
              <a href="mailto:mark@brandpwrdmedia.com" className="underline text-brand-accent">
                mark@brandpwrdmedia.com
              </a>{' '}
              and we&apos;ll reactivate your preferences.
            </p>
          </>
        ) : error ? (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 mb-6">
              We couldn&apos;t process your unsubscribe request. Please email us directly at{' '}
              <a href="mailto:mark@brandpwrdmedia.com?subject=Unsubscribe request" className="underline text-brand-accent">
                mark@brandpwrdmedia.com
              </a>{' '}
              and we will remove you within 24 hours.
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">📬</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Manage your email preferences</h1>
            <p className="text-sm text-gray-500 mb-6">
              To unsubscribe from Brand PWRD Media marketing emails, click the unsubscribe link
              in any email we sent you, or contact us directly.
            </p>
            <a
              href="mailto:mark@brandpwrdmedia.com?subject=Unsubscribe request"
              className="inline-block px-5 py-2.5 bg-brand-accent text-white font-semibold rounded-xl text-sm hover:bg-orange-700 transition-colors"
            >
              Email us to unsubscribe
            </a>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-400 space-y-1">
          <p>Brand PWRD Media B.V. · mark@brandpwrdmedia.com</p>
          <p>
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
            {' · '}
            <Link href="/" className="underline hover:text-gray-600">Go home</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
