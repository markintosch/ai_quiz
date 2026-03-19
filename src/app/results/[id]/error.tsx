'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Couldn&apos;t load your results</h2>
        <p className="text-sm text-gray-500 mb-6">
          There was a problem fetching your results. Try refreshing, or take the assessment again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-brand-accent text-white font-semibold rounded-xl text-sm hover:bg-orange-700 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/a"
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Retake assessment
          </Link>
        </div>
      </div>
    </div>
  )
}
