'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PAID_BUNDLE_ATTEMPTS, PAID_BUNDLE_PRICE_EUR, PAID_PRODUCT_SLUG } from '@/products/nordschleife/data'

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

export default function NordschleifeBuyPage() {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault()
    const n  = name.trim()
    const em = email.trim()
    if (!n) { setError('Please enter your name.'); return }
    if (!em || !em.includes('@')) { setError('Please enter a valid email.'); return }
    setBusy(true)
    setError('')

    try {
      const res = await fetch('/api/shop/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: PAID_PRODUCT_SLUG,
          customerName: n,
          customerEmail: em,
          returnPath: '/nordschleife/claim',
        }),
      })
      const json = await res.json()
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl
      } else {
        setError(json.error || 'Could not start checkout. Try again.')
        setBusy(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: WHITE, fontFamily: 'Inter, system-ui, sans-serif' }}>

      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: '0 24px', background: DARK }}>
        <div style={{ maxWidth: 720, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/nordschleife" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${DEEP}, ${GREEN})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: WHITE }}>N</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: WHITE }}>Nordschleife</span>
          </Link>
          <span style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: '0.08em' }}>💸 BUY MORE LAPS</span>
        </div>
      </nav>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px 80px' }}>

        <div style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: 'hidden', marginBottom: 24,
        }}>
          <div style={{ height: 4, background: `linear-gradient(90deg, ${GREEN}, ${RED})` }} />
          <div style={{ padding: '28px 24px' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>
              {PAID_BUNDLE_ATTEMPTS} extra laps
            </h1>
            <p style={{ fontSize: 14, color: BODY, lineHeight: 1.6, marginBottom: 22 }}>
              Top up with {PAID_BUNDLE_ATTEMPTS} more attempts on the Nordschleife trivia time trial. Credits activate immediately after payment and stay on this device for 30 days.
            </p>

            <div style={{
              background: BG, border: `1px solid ${BORDER}`, borderRadius: 12,
              padding: '18px 20px', marginBottom: 22,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 13, color: MUTED }}>Total</div>
                <div style={{ fontSize: 13, color: MUTED }}>incl. 21% BTW</div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: GREEN, fontFamily: 'monospace' }}>
                €{PAID_BUNDLE_PRICE_EUR.toFixed(2)}
              </div>
            </div>

            <form onSubmit={handleBuy}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  placeholder="Your name"
                  maxLength={60}
                  style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px 16px', fontSize: 15, fontWeight: 700, color: WHITE, outline: 'none' }}
                />
                <input
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="Email for the receipt"
                  type="email"
                  style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px 16px', fontSize: 14, color: WHITE, outline: 'none' }}
                />
                {error && <p style={{ fontSize: 13, color: RED, margin: 0 }}>{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  style={{
                    background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`, color: WHITE,
                    fontSize: 16, fontWeight: 900, padding: '14px', borderRadius: 10,
                    border: 'none', cursor: busy ? 'default' : 'pointer',
                    opacity: busy ? 0.7 : 1,
                  }}
                >
                  {busy ? 'Opening Mollie checkout…' : `Pay €${PAID_BUNDLE_PRICE_EUR}.00 with Mollie →`}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
          <p>Powered by Mollie. Pay with iDEAL, card, Bancontact, Apple Pay and more.</p>
          <p>After paying you&apos;ll return here and click <strong style={{ color: WHITE }}>Claim 5 laps</strong> — your credits are stored as a signed cookie on this device.</p>
          <p style={{ marginTop: 14 }}>
            <Link href="/nordschleife" style={{ color: GREEN, textDecoration: 'underline' }}>← Back to the track</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
