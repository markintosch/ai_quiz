'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PAID_BUNDLE_ATTEMPTS } from '@/products/nordschleife/data'
import { useNordschleifeLocale } from '@/components/nordschleife/LocaleProvider'
import LanguageSwitcher from '@/components/nordschleife/LanguageSwitcher'

// ── Brand tokens ───────────────────────────────────────────────────────────────
const BG      = '#0B1A0E'
const DARK    = '#0F2113'
const CARD    = '#142318'
const BORDER  = '#1E3320'
const GREEN   = '#45A85F'
const DEEP    = '#2D7A3E'
const WHITE   = '#FFFFFF'
const MUTED   = '#7A8E7E'
const BODY    = '#C5D5C8'

function ClaimInner() {
  const { t } = useNordschleifeLocale()
  const params  = useSearchParams()
  const orderId = params.get('order') ?? ''

  const [state, setState] = useState<'idle' | 'claiming' | 'ok' | 'err' | 'pending'>('idle')
  const [credits, setCredits] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!orderId) { setState('err'); setErrorMsg(''); return }
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
          setErrorMsg(d.error || '')
          setState('err')
        }
      })
      .catch(() => { setErrorMsg(''); setState('err') })
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
          <LanguageSwitcher compact />
        </div>
      </nav>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '36px 28px', textAlign: 'center' }}>
          {state === 'claiming' && (
            <>
              <div style={{ fontSize: 44, marginBottom: 14 }}>⏳</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{t('claim_activating')}</h1>
              <p style={{ fontSize: 14, color: BODY }}>{t('claim_one_moment')}</p>
            </>
          )}
          {state === 'ok' && (
            <>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🌲</div>
              <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
                {t('claim_activated', { paid: PAID_BUNDLE_ATTEMPTS })}
              </h1>
              <p style={{ fontSize: 14, color: BODY, marginBottom: 22 }}>
                {t('claim_stored')}{credits !== null && t('claim_total_avail', { count: credits })}
              </p>
              <Link href="/nordschleife/play" style={{
                display: 'block', background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`, color: WHITE,
                fontSize: 16, fontWeight: 900, padding: '14px', borderRadius: 10, textDecoration: 'none', marginBottom: 10,
              }}>
                {t('claim_start_lap')}
              </Link>
              <Link href="/nordschleife" style={{ fontSize: 13, color: MUTED, textDecoration: 'underline' }}>
                {t('claim_back')}
              </Link>
            </>
          )}
          {state === 'pending' && (
            <>
              <div style={{ fontSize: 44, marginBottom: 14 }}>💳</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{t('claim_pending')}</h1>
              <p style={{ fontSize: 14, color: BODY, marginBottom: 22 }}>
                {t('claim_pending_body')}
              </p>
              <button
                onClick={() => location.reload()}
                style={{
                  background: `linear-gradient(135deg, ${GREEN}, ${DEEP})`, color: WHITE,
                  fontSize: 15, fontWeight: 900, padding: '14px 22px', borderRadius: 10,
                  border: 'none', cursor: 'pointer', width: '100%',
                }}
              >
                {t('claim_reload')}
              </button>
            </>
          )}
          {state === 'err' && (
            <>
              <div style={{ fontSize: 44, marginBottom: 14 }}>❌</div>
              <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>{t('claim_error')}</h1>
              <p style={{ fontSize: 14, color: BODY, marginBottom: 22 }}>{errorMsg || t('claim_err_default')}</p>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>{t('claim_order_id_label')} <code>{orderId}</code></p>
              <Link href="/nordschleife" style={{
                display: 'block', background: BG, border: `1px solid ${BORDER}`, color: WHITE,
                fontSize: 14, fontWeight: 700, padding: '12px', borderRadius: 10, textDecoration: 'none',
              }}>
                {t('claim_back')}
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
        <p style={{ color: MUTED }}>…</p>
      </div>
    }>
      <ClaimInner />
    </Suspense>
  )
}
