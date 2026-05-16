'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PAID_BUNDLE_ATTEMPTS } from '@/products/nordschleife/data'

// ── Brand tokens ───────────────────────────────────────────────────────────────
const BG      = '#0B1A0E'
const DARK    = '#0F2113'
const CARD    = '#142318'
const BORDER  = '#1E3320'
const GREEN   = '#45A85F'
const DEEP    = '#2D7A3E'
const RED     = '#C8102E'
const WHITE   = '#FFFFFF'
const MUTED   = '#7A8E7E'
const BODY    = '#C5D5C8'

function ClaimInner() {
  const params  = useSearchParams()
  const orderId = params.get('order') ?? ''

  const [state, setState] = useState<'idle' | 'claiming' | 'ok' | 'err' | 'pending'>('idle')
  const [credits, setCredits] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!orderId) { setState('err'); setErrorMsg('No order ID provided.'); return }
    setState('claiming')
    fetch('/api/nordschleife/credits/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.ok && typeof d.credits === 'number') {
          setCredits(d.credits)
          setState('ok')
        } else if (d.error === 'not_paid_yet') {
          setState('pending')
        } else {
          setErrorMsg(d.error || 'Could not claim credits.')
          setState('err')
        }
      })
      .catch(() => { setErrorMsg('Network error claiming credits.'); setState('err') })
  }, [orderId])

  return (
    <div style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: 'Inter, system-ui, sans-serif' }}>

      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px', background: DARK }}>
        <div style={{ maxWidth: 480, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/nordschleife" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${DEEP}, ${GREEN})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: WHITE }}>N</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: WHITE }}>Nordschleife</span>
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '36px 28px', textAlign: 'center' }}>
          {state === 'claiming' && (
            <>
              <div style={{ fontSize: 44, marginBottom: 14 }}>⏳</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Activating your laps…</h1>
              <p style={{ fontSize: 14, color: BODY }}>One moment.</p>
            </>
          )}
          {state === 'ok' && (
            <>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🌲</div>
              <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
                <span style={{ color: GREEN }}>{PAID_BUNDLE_ATTEMPTS}</span> laps activated
              </h1>
              <p style={{ fontSize: 14, color: BODY, marginBottom: 22 }}>
                Your credits are now stored on this device.{credits !== null && ` Total available: ${credits}.`}
              </p>
              <Link href="/nordschleife/play" style={{
                display: 'block', background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`, color: WHITE,
                fontSize: 16, fontWeight: 900, padding: '14px', borderRadius: 10, textDecoration: 'none', marginBottom: 10,
              }}>
                Start a lap →
              </Link>
              <Link href="/nordschleife" style={{ fontSize: 13, color: MUTED, textDecoration: 'underline' }}>
                Back to landing
              </Link>
            </>
          )}
          {state === 'pending' && (
            <>
              <div style={{ fontSize: 44, marginBottom: 14 }}>💳</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Payment is still processing</h1>
              <p style={{ fontSize: 14, color: BODY, marginBottom: 22 }}>
                Banks sometimes take a minute. Reload this page in a moment to claim your laps.
              </p>
              <button
                onClick={() => location.reload()}
                style={{
                  background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`, color: WHITE,
                  fontSize: 15, fontWeight: 900, padding: '14px 22px', borderRadius: 10,
                  border: 'none', cursor: 'pointer', width: '100%',
                }}
              >
                Reload &amp; try again
              </button>
            </>
          )}
          {state === 'err' && (
            <>
              <div style={{ fontSize: 44, marginBottom: 14 }}>❌</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Could not activate</h1>
              <p style={{ fontSize: 14, color: BODY, marginBottom: 22 }}>{errorMsg || 'Please email mark@brandpwrdmedia.com with your order ID.'}</p>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>Order ID: <code>{orderId}</code></p>
              <Link href="/nordschleife" style={{
                display: 'block', background: BG, border: `1px solid ${BORDER}`, color: WHITE,
                fontSize: 14, fontWeight: 700, padding: '12px', borderRadius: 10, textDecoration: 'none',
              }}>
                Back to landing
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NordschleifeClaimPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: MUTED }}>Loading…</p>
      </div>
    }>
      <ClaimInner />
    </Suspense>
  )
}
