'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FREE_ATTEMPTS, FREE_STORAGE_KEY, PAID_BUNDLE_ATTEMPTS, PAID_BUNDLE_PRICE_EUR } from '@/products/indycar/data'
import { useIndycarLocale } from '@/components/indycar/LocaleProvider'
import LanguageSwitcher from '@/components/indycar/LanguageSwitcher'

// ── Brand tokens (IndyCar / Brickyard navy) ───────────────────────────────────
const BG      = '#0A0F1F'
const DARK    = '#0D1428'
const CARD    = '#13192E'
const BORDER  = '#1F2942'
const GREEN   = '#C8102E'
const DEEP    = '#8B0F22'
const RED     = '#E8A100'
const WHITE   = '#FFFFFF'
const MUTED   = '#7A8E7E'
const BODY    = '#C5D5C8'
const GOLD    = '#F0C419'
const PURPLE  = '#B026FF'

interface LeaderEntry { id: string; name: string; lap_time: string; total_ms: number; created_at: string }

const LEADERBOARD_REFRESH_SEC = 5

function Leaderboard({ onCountdown }: { onCountdown?: (sec: number) => void }) {
  const { t } = useIndycarLocale()
  const [rows, setRows] = useState<LeaderEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    let countdownSec = LEADERBOARD_REFRESH_SEC

    async function refresh() {
      try {
        const r = await fetch('/api/indycar/leaderboard', { cache: 'no-store' })
        const d = await r.json()
        if (cancelled) return
        setRows(d.rows ?? [])
        setLoading(false)
        setFlash(true)
        setTimeout(() => { if (!cancelled) setFlash(false) }, 600)
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    // First load + tick every second
    refresh()
    countdownSec = LEADERBOARD_REFRESH_SEC
    onCountdown?.(countdownSec)

    const tick = setInterval(() => {
      countdownSec -= 1
      if (countdownSec <= 0) {
        countdownSec = LEADERBOARD_REFRESH_SEC
        refresh()
      }
      onCountdown?.(countdownSec)
    }, 1000)

    return () => { cancelled = true; clearInterval(tick) }
  }, [onCountdown])

  if (loading) return <p style={{ fontSize: 13, color: MUTED }}>{t('leaderboard_warmup')}</p>
  if (!rows.length) return <p style={{ fontSize: 13, color: MUTED }}>{t('leaderboard_empty')}</p>

  return (
    <div style={{
      transition: 'background 0.25s, box-shadow 0.25s',
      background: flash ? `${GREEN}10` : 'transparent',
      boxShadow: flash ? `0 0 0 1px ${GREEN}44 inset` : 'none',
      borderRadius: 6,
      marginInline: -8,
      paddingInline: 8,
    }}>
      {rows.slice(0, 10).map((r, i) => {
        const colour = i === 0 ? PURPLE : i < 3 ? GOLD : MUTED
        return (
          <div key={r.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '10px 0', borderBottom: `1px solid ${BORDER}`,
          }}>
            <span style={{ width: 24, fontSize: 13, fontWeight: 800, color: colour, textAlign: 'right', flexShrink: 0 }}>
              {i === 0 ? '🟣' : i === 1 ? '🥈' : i === 2 ? '🥉' : `P${i + 1}`}
            </span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: WHITE }}>{r.name}</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: colour, fontFamily: 'monospace', letterSpacing: '-0.01em' }}>
              {r.lap_time}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const PRESENCE_STORAGE_KEY = 'indycar_presence_id'
const PRESENCE_PING_MS     = 30_000
const PRESENCE_FETCH_MS    = 10_000
const PRESENCE_VISIBLE_MIN = 10

function PresenceBadge() {
  const { t } = useIndycarLocale()
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Get or create a stable per-tab UUID
    let id = ''
    try {
      id = localStorage.getItem(PRESENCE_STORAGE_KEY) ?? ''
      if (!id && typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        id = crypto.randomUUID()
        localStorage.setItem(PRESENCE_STORAGE_KEY, id)
      }
    } catch { /* localStorage may be unavailable */ }
    if (!id) return

    let cancelled = false

    async function ping() {
      try {
        const r = await fetch('/api/indycar/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
          cache: 'no-store',
        })
        const d = await r.json()
        if (!cancelled) setCount(d.count ?? 0)
      } catch { /* offline → leave count as-is */ }
    }
    async function fetchOnly() {
      try {
        const r = await fetch('/api/indycar/presence', { cache: 'no-store' })
        const d = await r.json()
        if (!cancelled) setCount(d.count ?? 0)
      } catch { /* ignore */ }
    }

    ping()
    const pingInt  = setInterval(ping,      PRESENCE_PING_MS)
    const fetchInt = setInterval(fetchOnly, PRESENCE_FETCH_MS)

    // Send one last ping with a synthetic stale flag isn't needed — the row
    // simply expires after 90 s without pings.

    return () => { cancelled = true; clearInterval(pingInt); clearInterval(fetchInt) }
  }, [])

  if (count < PRESENCE_VISIBLE_MIN) return null

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      background: `${GREEN}14`, border: `1px solid ${GREEN}44`,
      borderRadius: 100, padding: '6px 14px',
      fontSize: 12, fontWeight: 800, color: WHITE, letterSpacing: '0.02em',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: GREEN, animation: 'nsPulse 1.2s ease-in-out infinite',
      }} />
      <span>{t('presence_badge', { count })}</span>
    </div>
  )
}

function ChallengeBanner() {
  const { t } = useIndycarLocale()
  const params = useSearchParams()
  const from   = (params.get('from') ?? '').slice(0, 30).trim()
  const time   = (params.get('time') ?? '').slice(0, 16).trim()
  const rank   = (params.get('rank') ?? '').slice(0, 5).trim()

  if (!from || !time) return null

  return (
    <div style={{
      background: `linear-gradient(90deg, ${RED}, ${DEEP})`,
      padding: '14px 18px',
      borderRadius: 12,
      marginBottom: 22,
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14,
    }}>
      <span style={{ fontSize: 22 }}>🏎</span>
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: WHITE, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85 }}>
          {t('challenge_kicker')}
        </p>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: WHITE }}>
          <strong>{from}</strong> {t('challenge_body')} <span style={{ fontFamily: 'monospace', fontWeight: 900, color: GOLD }}>{time}</span>
          {rank && <span style={{ opacity: 0.85 }}> · P{rank}</span>}. {t('challenge_beat')}
        </p>
      </div>
    </div>
  )
}

function LiveBadge({ secLeft }: { secLeft: number }) {
  const { t } = useIndycarLocale()
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, color: GREEN, fontWeight: 700, letterSpacing: '0.04em',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: GREEN, animation: 'nsPulse 1.2s ease-in-out infinite',
      }} />
      {t('leaderboard_live', { sec: secLeft })}
    </span>
  )
}

function AttemptStatus() {
  const { t } = useIndycarLocale()
  const [freeUsed, setFreeUsed] = useState<number | null>(null)
  const [paidLeft, setPaidLeft] = useState<number | null>(null)

  useEffect(() => {
    try {
      const stored = parseInt(localStorage.getItem(FREE_STORAGE_KEY) ?? '0', 10)
      setFreeUsed(Number.isFinite(stored) ? stored : 0)
    } catch { setFreeUsed(0) }
    fetch('/api/indycar/credits').then(r => r.json()).then(d => setPaidLeft(d.credits ?? 0)).catch(() => setPaidLeft(0))
  }, [])

  if (freeUsed === null || paidLeft === null) return null

  const freeLeft = Math.max(0, FREE_ATTEMPTS - freeUsed)
  const total    = freeLeft + paidLeft
  const locked   = total <= 0

  return (
    <div style={{
      display: 'inline-flex', gap: 10, padding: '8px 14px', borderRadius: 8,
      background: locked ? `${RED}18` : `${GREEN}14`,
      border: `1px solid ${locked ? RED + '44' : GREEN + '44'}`,
      fontSize: 12, color: locked ? RED : GREEN, fontWeight: 700, alignItems: 'center',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: locked ? RED : GREEN }} />
      {locked
        ? t('attempts_none')
        : `${t(freeLeft === 1 ? 'attempts_free_left' : 'attempts_free_left_plural', { count: freeLeft })}${paidLeft > 0 ? t('attempts_plus_paid', { count: paidLeft }) : ''}`}
    </div>
  )
}

export default function IndycarLanding() {
  const { t } = useIndycarLocale()
  const [leaderboardCountdown, setLeaderboardCountdown] = useState(LEADERBOARD_REFRESH_SEC)

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: 'Inter, system-ui, sans-serif', color: WHITE }}>
      <style>{`
        @keyframes nsPulse {
          0%, 100% { transform: scale(1);   opacity: 1;   }
          50%      { transform: scale(1.6); opacity: 0.55; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px', background: DARK }}>
        <div style={{ maxWidth: 980, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 7,
              background: `linear-gradient(135deg, ${DEEP}, ${GREEN})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: WHITE }}>I</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 900, color: WHITE, letterSpacing: '-0.01em' }}>
              IndyCar
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: '0.12em' }}>
              {t('header_subtitle')}
            </span>
            <LanguageSwitcher compact />
          </div>
        </div>
      </nav>

      {/* Live race banner */}
      <div style={{
        background: `linear-gradient(90deg, ${DEEP}, ${RED})`,
        padding: '8px 16px', textAlign: 'center',
        fontSize: 12, fontWeight: 800, color: WHITE, letterSpacing: '0.06em',
      }}>
        {t('live_banner')}
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40 }}>

        {/* Left: hero + rules */}
        <div>
          <Suspense fallback={null}><ChallengeBanner /></Suspense>
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: '0.16em', marginBottom: 14, textTransform: 'uppercase' }}>
              {t('hero_kicker')}
            </p>
            <h1 style={{
              fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 900,
              letterSpacing: '-0.04em', lineHeight: 0.95, marginBottom: 22,
            }}>
              {t('hero_title_part1')} <span style={{ color: GREEN }}>{t('hero_title_green')}</span><br />
              <span style={{ color: RED }}>{t('hero_title_hell')}</span> {t('hero_title_suffix')}
            </h1>
            <p style={{ fontSize: 18, color: BODY, lineHeight: 1.7, maxWidth: 520, marginBottom: 26 }}>
              {t('hero_body')}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 22 }}>
              <Suspense fallback={null}><PresenceBadge /></Suspense>
              <Suspense fallback={null}><AttemptStatus /></Suspense>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                href="/indycar/play"
                style={{
                  display: 'inline-block',
                  background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`,
                  color: WHITE,
                  fontSize: 18, fontWeight: 900,
                  padding: '18px 42px', borderRadius: 10, textDecoration: 'none',
                  letterSpacing: '-0.01em',
                  boxShadow: `0 8px 24px ${GREEN}33`,
                }}
              >
                {t('hero_cta_start')}
              </Link>
              <span style={{ fontSize: 12, color: MUTED }}>
                {t('hero_cta_footnote', { free: FREE_ATTEMPTS, paid: PAID_BUNDLE_ATTEMPTS, price: PAID_BUNDLE_PRICE_EUR })}
              </span>
            </div>
          </div>

          {/* Rules grid */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '28px 24px', marginBottom: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: WHITE, marginBottom: 18, letterSpacing: '-0.01em' }}>{t('rules_heading')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              {[
                { icon: '⏱',  title: t('rules_time_t'),   body: t('rules_time_b') },
                { icon: '⚠️', title: t('rules_pen_t'),    body: t('rules_pen_b') },
                { icon: '🌲', title: t('rules_sect_t'),   body: t('rules_sect_b') },
                { icon: '🎲', title: t('rules_pool_t'),   body: t('rules_pool_b') },
                { icon: '🟣', title: t('rules_purple_t'), body: t('rules_purple_b') },
                { icon: '💸', title: t('rules_paid_t', { free: FREE_ATTEMPTS, price: PAID_BUNDLE_PRICE_EUR }), body: t('rules_paid_b', { free: FREE_ATTEMPTS, paid: PAID_BUNDLE_ATTEMPTS, price: PAID_BUNDLE_PRICE_EUR }) },
              ].map(r => (
                <div key={r.title}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{r.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: WHITE, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{r.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector preview */}
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px 24px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
              {t('sector_preview_heading')}
            </p>
            <div style={{ display: 'flex', gap: 1 }}>
              {[
                { label: t('sector_1'), name: 'Front Straight',     qs: 'Q1–Q10',  diff: t('difficulty_easy'),   color: GREEN,  time: '2:48.0' },
                { label: t('sector_2'), name: 'Turn 1',      qs: 'Q11–Q20', diff: t('difficulty_medium'), color: GOLD,   time: '3:42.0' },
                { label: t('sector_3'), name: 'Yard of Bricks', qs: 'Q21–Q30', diff: t('difficulty_hard'),   color: RED,    time: '4:35.0' },
              ].map((s, i) => (
                <div key={s.label} style={{
                  flex: 1, background: BG,
                  borderRadius: i === 0 ? '8px 0 0 8px' : i === 2 ? '0 8px 8px 0' : 0,
                  padding: '12px', borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: WHITE, fontWeight: 700, marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: MUTED, marginBottom: 8 }}>{s.qs} · {s.diff}</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: leaderboard */}
        <div style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${PURPLE}, ${GREEN})` }} />
            <div style={{ padding: '20px 20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: WHITE }}>{t('leaderboard_heading')}</h3>
                <LiveBadge secLeft={leaderboardCountdown} />
              </div>
              <Suspense fallback={<p style={{ fontSize: 13, color: MUTED }}>Loading…</p>}>
                <Leaderboard onCountdown={setLeaderboardCountdown} />
              </Suspense>
              <div style={{ marginTop: 20 }}>
                <Link
                  href="/indycar/play"
                  style={{
                    display: 'block', textAlign: 'center',
                    background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`,
                    color: WHITE,
                    fontSize: 14, fontWeight: 800,
                    padding: '12px', borderRadius: 8, textDecoration: 'none',
                  }}
                >
                  {t('leaderboard_cta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: `1px solid ${BORDER}`, background: DARK, padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: MUTED }}>{t('footer_text')}</p>
      </footer>
    </div>
  )
}
