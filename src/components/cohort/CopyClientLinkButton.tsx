'use client'

import { useState } from 'react'

interface Props {
  cohortId: string
  token: string
}

export function CopyClientLinkButton({ cohortId, token }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const url = `${window.location.origin}/dashboard/client/${cohortId}?token=${token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand border border-brand/30 rounded-lg px-3 py-2 hover:bg-brand/5 transition-colors"
    >
      {copied ? '✓ Copied!' : '🔗 Copy client link'}
    </button>
  )
}
