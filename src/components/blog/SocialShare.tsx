// FILE: src/components/blog/SocialShare.tsx
// X / LinkedIn / Copy-link knoppen onder elke blog post.
// Geen tracking-cookies — pure intent-URLs en clipboard API.

'use client'

import { useState } from 'react'
import { STRINGS, type Lang } from '@/lib/blog/strings'

interface Props {
  url:   string         // canonical URL of the post
  title: string
  lang:  Lang
}

export default function SocialShare({ url, title, lang }: Props) {
  const t = STRINGS[lang]
  const [copied, setCopied] = useState(false)

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select-text via prompt — laatste redmiddel
      window.prompt('Kopieer de link:', url)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-5">
      <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
        {t.shareTitle}
      </span>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:border-brand-accent hover:text-brand"
        title={t.shareOnX}
      >
        <span aria-hidden>𝕏</span> {t.shareOnX}
      </a>
      <a
        href={linkedInHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:border-brand-accent hover:text-brand"
        title={t.shareOnLinkedIn}
      >
        <span aria-hidden>in</span> {t.shareOnLinkedIn}
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:border-brand-accent hover:text-brand"
      >
        <span aria-hidden>{copied ? '✓' : '🔗'}</span> {copied ? t.shareCopied : t.shareCopy}
      </button>
    </div>
  )
}
