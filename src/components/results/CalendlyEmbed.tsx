'use client'

import { useEffect } from 'react'

interface CalendlyEmbedProps {
  overallScore: number
  name: string
  email: string
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string
        parentElement: HTMLElement
        prefill?: { name?: string; email?: string }
      }) => void
    }
  }
}

export function CalendlyEmbed({ overallScore, name, email }: CalendlyEmbedProps) {
  const url =
    overallScore < 50
      ? process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL
      : process.env.NEXT_PUBLIC_CALENDLY_STRATEGY_URL

  const callLabel = overallScore < 50 ? '15-min Discovery Call' : '30-min Strategy Session'

  useEffect(() => {
    if (!url) return

    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    script.onload = () => {
      const el = document.getElementById('calendly-embed-container')
      if (el && window.Calendly) {
        window.Calendly.initInlineWidget({
          url,
          parentElement: el,
          prefill: { name, email },
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [url, name, email])

  if (!url) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Book your {callLabel}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {overallScore < 50
            ? 'Let\'s discuss where AI can create quick wins for your organisation.'
            : 'You\'re ready to accelerate. Let\'s map out your AI strategy.'}
        </p>
      </div>
      <div
        id="calendly-embed-container"
        style={{ minWidth: '320px', height: '630px' }}
      />
    </div>
  )
}
