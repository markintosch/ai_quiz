'use client'

import { useState } from 'react'

interface ShareBlockProps {
  respondentNum: number
  total: number
  subjectLabel: string
  themeTitle: string
  url: string
}

const tertiaryBtn: React.CSSProperties = {
  background: 'transparent',
  color: '#6f751a',
  border: '1px solid #6f751a',
  borderRadius: 0,
  padding: '10px 20px',
  cursor: 'pointer',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '1.4',
  transition: 'background 0.15s, color 0.15s',
  textDecoration: 'none',
  display: 'inline-block',
  textAlign: 'center' as const,
}

function TertiaryLink({
  href,
  children,
  target,
}: {
  href: string
  children: React.ReactNode
  target?: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      target={target ?? '_blank'}
      rel="noopener noreferrer"
      style={{
        ...tertiaryBtn,
        background: hovered ? '#6f751a' : 'transparent',
        color: hovered ? '#fff' : '#6f751a',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  )
}

function TertiaryButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      style={{
        ...tertiaryBtn,
        background: hovered ? '#6f751a' : 'transparent',
        color: hovered ? '#fff' : '#6f751a',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  )
}

export default function ShareBlock({
  respondentNum,
  total,
  subjectLabel,
  url,
}: ShareBlockProps) {
  const [copied, setCopied] = useState(false)

  const waText = `Ik beoordeelde ${subjectLabel} op 5 punten (deelnemer #${respondentNum} van ${total}). Doe mee voor [datum]: ${url}`
  const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`

  const tweetText = `Ik beoordeelde ${subjectLabel} als deelnemer #${respondentNum} van ${total}. Eens? → `
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select the input
    }
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <h3
        style={{
          fontWeight: 700,
          fontSize: '18px',
          color: '#121212',
          margin: 0,
          lineHeight: '1.2',
        }}
      >
        Deel jouw beoordeling
      </h3>

      {/* Full-width WhatsApp on mobile */}
      <div style={{ width: '100%' }}>
        <TertiaryLink href={waUrl} target="_blank">
          WhatsApp →
        </TertiaryLink>
      </div>

      {/* Other platforms */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div
          style={{
            ...tertiaryBtn,
            background: 'transparent',
            color: '#616162',
            borderColor: '#e2e2e2',
            cursor: 'default',
          }}
        >
          Binnenkort: Instagram Stories
        </div>
        <TertiaryLink href={linkedInUrl}>LinkedIn →</TertiaryLink>
        <TertiaryLink href={twitterUrl}>X / Twitter →</TertiaryLink>
      </div>

      {/* Copy link */}
      <div style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
        <input
          readOnly
          value={url}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '1px solid #e2e2e2',
            borderRight: 'none',
            borderRadius: 0,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: '13px',
            color: '#616162',
            background: '#f4f4f4',
            outline: 'none',
            minWidth: 0,
          }}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
        <TertiaryButton onClick={handleCopy}>
          {copied ? 'Gekopieerd ✓' : 'Kopieer'}
        </TertiaryButton>
      </div>
    </div>
  )
}
