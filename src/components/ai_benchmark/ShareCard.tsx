'use client'

// Client component — sticky share button + modal with OG card preview, social
// share buttons (LinkedIn / X / WhatsApp / Mail), and copy-link.

import { useEffect, useState } from 'react'
import { trackBenchEvent } from './Tracker'
import { getContent, type Lang } from '@/products/ai_benchmark/data'

const INK    = '#0F172A'
const ACCENT = '#1D4ED8'
const WARM   = '#D97706'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'
const FONT   = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export function ShareCard({
  resultId,
  archetypeName,
  archetypeEmoji,
  totalScore,
  punchline,
  shareUrl,
  ogUrl,
  lang = 'nl',
}: {
  resultId:        string
  archetypeName:   string
  archetypeEmoji:  string
  totalScore:      number
  punchline:       string
  shareUrl:        string
  ogUrl:           string
  lang?:           Lang
}) {
  const t = getContent(lang)
  const [open,   setOpen]   = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const text = t.shareIntroBody
    .replace('{arch}', archetypeName)
    .replace('{score}', String(totalScore))
    .replace('{punchline}', punchline)
  const enc  = encodeURIComponent
  const links = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`,
    x:        `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(text)}`,
    whatsapp: `https://wa.me/?text=${enc(`${text} ${shareUrl}`)}`,
    mail:     `mailto:?subject=${enc(t.shareEmailSubject)}&body=${enc(`${text}\n\n${shareUrl}`)}`,
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* ignore */ }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => { trackBenchEvent('share_opened', { meta: { resultId } }); setOpen(true) }}
        style={{
          background: ACCENT, color: '#fff', fontWeight: 700, fontSize: 14,
          padding: '12px 22px', borderRadius: 8, border: 'none',
          cursor: 'pointer', fontFamily: FONT,
          boxShadow: `0 4px 20px ${ACCENT}33`,
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>↗</span>
        {t.shareTriggerLabel}
      </button>

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20,
            animation: 'aibench-modal-fade 200ms ease-out',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: 16, maxWidth: 460, width: '100%',
              padding: 22, fontFamily: FONT, color: INK,
              maxHeight: '90vh', overflow: 'auto',
              animation: 'aibench-modal-pop 220ms ease-out',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: WARM, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                {t.shareModalLabel}
              </p>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'transparent', border: 'none', fontSize: 22, color: MUTED, cursor: 'pointer', lineHeight: 1 }}
                aria-label="×"
              >×</button>
            </div>

            {/* Card preview */}
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1.91', background: INK, borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
              {/* Use the OG image as the preview so what's shown matches what's shared */}
              <img
                src={ogUrl}
                alt="Share-preview"
                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
              />
            </div>

            {/* Pre-filled text */}
            <div style={{ background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 4, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {t.sharePrefilledLabel}
              </p>
              <p style={{ fontSize: 13, color: INK, lineHeight: 1.55, margin: 0 }}>
                {text} <span style={{ color: ACCENT, wordBreak: 'break-all' }}>{shareUrl}</span>
              </p>
            </div>

            {/* Social buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <ShareBtn href={links.linkedin} bg="#0A66C2"  label="LinkedIn"  icon="in" platform="linkedin" />
              <ShareBtn href={links.x}        bg="#000"     label="X"         icon="X"  platform="x"        />
              <ShareBtn href={links.whatsapp} bg="#25D366"  label="WhatsApp"  icon="✆"  platform="whatsapp" />
              <ShareBtn href={links.mail}     bg={BODY}     label="E-mail"    icon="✉"  platform="mail"     />
            </div>

            <button
              onClick={copy}
              style={{
                width: '100%', padding: '12px 14px', fontSize: 14, fontWeight: 700,
                background: copied ? '#15803D' : '#fff',
                color: copied ? '#fff' : INK,
                border: `1.5px solid ${copied ? '#15803D' : BORDER}`,
                borderRadius: 8, cursor: 'pointer', fontFamily: FONT,
                transition: 'background 0.2s, color 0.2s, border-color 0.2s',
              }}
            >
              {copied ? t.shareCopiedLink : t.shareCopyLink}
            </button>

            <p style={{ marginTop: 14, fontSize: 11, color: MUTED, textAlign: 'center' }}>
              {t.shareUrlNote}
            </p>
          </div>

          <style>{`
            @keyframes aibench-modal-fade { from { opacity: 0; } to { opacity: 1; } }
            @keyframes aibench-modal-pop  { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
          `}</style>
        </div>
      )}
      {/* unused vars suppressed */}
      <span style={{ display: 'none' }}>{resultId}{archetypeEmoji}</span>
    </>
  )
}

function ShareBtn({ href, bg, label, icon, platform }: { href: string; bg: string; label: string; icon: string; platform: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackBenchEvent('share_clicked', { meta: { platform } })}
      style={{
        background: bg, color: '#fff', fontWeight: 700, fontSize: 13,
        padding: '11px 12px', borderRadius: 8, textDecoration: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: FONT,
      }}
    >
      <span style={{ fontWeight: 900 }}>{icon}</span>
      {label}
    </a>
  )
}
