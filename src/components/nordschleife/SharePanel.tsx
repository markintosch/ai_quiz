'use client'

import { useState, useEffect, useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useNordschleifeLocale } from './LocaleProvider'

// ── Brand tokens ───────────────────────────────────────────────────────────────
const BG     = '#0B1A0E'
const CARD   = '#142318'
const BORDER = '#1E3320'
const GREEN  = '#45A85F'
const DEEP   = '#2D7A3E'
const RED    = '#C8102E'
const WHITE  = '#FFFFFF'
const MUTED  = '#7A8E7E'
const BODY   = '#C5D5C8'
const GOLD   = '#F5C518'

interface Props {
  name:     string
  lapTime:  string         // "M:SS.mmm"
  rank?:    number | null
  correct?: number         // e.g. 27 / 30
}

function buildChallengeUrl({ name, lapTime, rank, lang }: { name: string; lapTime: string; rank?: number | null; lang?: string }): string {
  if (typeof window === 'undefined') return ''
  const u = new URL('/nordschleife', window.location.origin)
  if (name)    u.searchParams.set('from', name)
  if (lapTime) u.searchParams.set('time', lapTime)
  if (rank)    u.searchParams.set('rank', String(rank))
  if (lang)    u.searchParams.set('lang', lang)
  return u.toString()
}

function buildOgUrl({ name, lapTime, rank, correct, lang }: { name: string; lapTime: string; rank?: number | null; correct?: number; lang?: string }): string {
  if (typeof window === 'undefined') return ''
  const u = new URL('/api/nordschleife/og', window.location.origin)
  if (name)    u.searchParams.set('name', name)
  if (lapTime) u.searchParams.set('time', lapTime)
  if (rank)    u.searchParams.set('rank', String(rank))
  if (typeof correct === 'number') u.searchParams.set('correct', String(correct))
  if (lang)    u.searchParams.set('lang', lang)
  return u.toString()
}

export default function SharePanel({ name, lapTime, rank, correct }: Props) {
  const { t, locale } = useNordschleifeLocale()
  const [copied, setCopied] = useState<'link' | 'text' | null>(null)
  const [supportsNative, setSupportsNative] = useState(false)

  useEffect(() => {
    setSupportsNative(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const url   = useMemo(() => buildChallengeUrl({ name, lapTime, rank, lang: locale }), [name, lapTime, rank, locale])
  const ogUrl = useMemo(() => buildOgUrl({ name, lapTime, rank, correct, lang: locale }), [name, lapTime, rank, correct, locale])
  const text  = useMemo(() => {
    const rankPart = rank === 1
      ? t('share_rank_first')
      : rank
      ? t('share_rank_at', { n: rank })
      : ''
    return t('share_message_template', { who: name || t('share_who_self'), time: lapTime, rank: rankPart })
  }, [name, lapTime, rank, t])

  const encodedUrl     = encodeURIComponent(url)
  const encodedTxt     = encodeURIComponent(`${text} ${url}`)
  const encodedTxtOnly = encodeURIComponent(text)

  async function copyToClipboard(value: string, kind: 'link' | 'text') {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
      setTimeout(() => setCopied(null), 2200)
    } catch {
      window.prompt('Copy:', value)
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: 'Nordschleife Trivia', text, url })
    } catch { /* user cancelled */ }
  }

  // ── Per-channel intent URLs ──
  const whatsapp = `https://wa.me/?text=${encodedTxt}`
  const twitter  = `https://twitter.com/intent/tweet?text=${encodedTxtOnly}&url=${encodedUrl}`
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
  const telegram = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTxtOnly}`
  const reddit   = `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTxtOnly}`
  const mail     = `mailto:?subject=${encodeURIComponent(text)}&body=${encodedTxt}`

  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${GREEN}, ${RED}, ${GOLD})` }} />
      <div style={{ padding: '22px 22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: WHITE, margin: 0 }}>{t('share_heading')}</h3>
          <span style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: '0.06em' }}>{t('share_tag')}</span>
        </div>

        {/* Native share — mobile first */}
        {supportsNative && (
          <button
            onClick={nativeShare}
            style={{
              width: '100%', marginBottom: 12,
              background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`, color: WHITE,
              fontSize: 16, fontWeight: 900,
              padding: '14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <span>📲</span> {t('share_native')}
          </button>
        )}

        {/* Channel grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
          {[
            { href: whatsapp, label: 'WhatsApp',           icon: '💬', bg: '#25D366' },
            { href: twitter,  label: 'X',                  icon: '𝕏',  bg: '#000000' },
            { href: facebook, label: 'Facebook',           icon: 'f',  bg: '#1877F2' },
            { href: linkedin, label: 'LinkedIn',           icon: 'in', bg: '#0A66C2' },
            { href: telegram, label: 'Telegram',           icon: '✈',  bg: '#229ED9' },
            { href: reddit,   label: 'Reddit',             icon: '🤖', bg: '#FF4500' },
            { href: mail,     label: t('share_label_email'), icon: '✉',  bg: '#444444' },
          ].map(c => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 6px', borderRadius: 10,
                background: BG, border: `1px solid ${BORDER}`,
                textDecoration: 'none', color: WHITE,
              }}
            >
              <span style={{
                width: 36, height: 36, borderRadius: '50%',
                background: c.bg, color: WHITE,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 900,
              }}>
                {c.icon}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: BODY }}>{c.label}</span>
            </a>
          ))}
          <button
            onClick={() => copyToClipboard(url, 'link')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '12px 6px', borderRadius: 10,
              background: BG, border: `1px solid ${copied === 'link' ? GREEN : BORDER}`,
              cursor: 'pointer', color: WHITE,
            }}
          >
            <span style={{
              width: 36, height: 36, borderRadius: '50%',
              background: copied === 'link' ? GREEN : '#555',
              color: WHITE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900,
            }}>
              {copied === 'link' ? '✓' : '🔗'}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: BODY }}>
              {copied === 'link' ? t('share_label_copylink_ok') : t('share_label_copylink')}
            </span>
          </button>
        </div>

        {/* Pre-filled message preview */}
        <div style={{
          background: BG, border: `1px solid ${BORDER}`, borderRadius: 10,
          padding: '12px 14px', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: '0.08em' }}>{t('share_msg_tag')}</span>
            <span style={{ flex: 1, fontSize: 13, color: BODY, lineHeight: 1.5 }}>{text}</span>
            <button
              onClick={() => copyToClipboard(`${text}\n${url}`, 'text')}
              style={{
                background: 'transparent', border: `1px solid ${BORDER}`, color: copied === 'text' ? GREEN : MUTED,
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              {copied === 'text' ? t('share_label_copytext_ok') : t('share_label_copytext')}
            </button>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 8, wordBreak: 'break-all' }}>{url}</div>
        </div>

        {/* QR + OG preview */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
          <div style={{
            background: WHITE, padding: 10, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <QRCodeSVG value={url} size={104} bgColor={WHITE} fgColor="#0B1A0E" level="M" />
          </div>
          <div style={{ flex: 1, fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
            <p style={{ margin: 0, marginBottom: 6, color: BODY, fontWeight: 700 }}>{t('share_tv_heading')}</p>
            <p style={{ margin: 0 }}>{t('share_tv_body')}</p>
            <a
              href={ogUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: GREEN, textDecoration: 'underline' }}
            >
              {t('share_preview_og')}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
