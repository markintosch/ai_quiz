'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const INK    = '#0F172A'
const NAVY   = '#1E3A5F'
const ACCENT = '#1D4ED8'
const WARM   = '#D97706'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'
const LIGHT  = '#F8FAFC'
const ff     = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif"

interface ShopProduct {
  id: string
  slug: string
  title: string
  tagline: string | null
  description: string | null
  price_cents: number
  vat_rate: number
  type: string
  delivery_type: string
  delivery_notes: string | null
}

function formatPrice(cents: number): string {
  return '€' + (cents / 100).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatVat(rate: number): string {
  return Math.round(rate * 100) + '%'
}

interface CheckoutFormProps {
  product: ShopProduct
  isEmbed?: boolean
  embedRef?: string
}

function CheckoutForm({ product, isEmbed = false, embedRef }: CheckoutFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!terms) {
      setError('Accepteer de algemene voorwaarden om door te gaan.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/shop/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug: product.slug, customerName: name, customerEmail: email }),
      })

      const data = await res.json() as { checkoutUrl?: string; orderId?: string; error?: string }

      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? 'Er is iets misgegaan. Probeer het opnieuw.')
        setLoading(false)
        return
      }

      const successUrl = isEmbed && embedRef
        ? data.checkoutUrl.replace(/redirectUrl=[^&]+/, `redirectUrl=${encodeURIComponent(`${window.location.origin}/shop/success/${data.orderId}?ref=${embedRef}`)}`)
        : data.checkoutUrl

      window.location.href = successUrl
    } catch {
      setError('Er is iets misgegaan. Probeer het opnieuw.')
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '12px 14px',
    border: `1px solid ${BORDER}`,
    fontSize: '15px',
    fontFamily: ff,
    color: INK,
    background: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
    borderRadius: '2px',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: BODY,
    marginBottom: '6px',
    fontFamily: ff,
  }

  return (
    <div
      style={{
        background: LIGHT,
        border: `1px solid ${BORDER}`,
        borderTop: `3px solid ${ACCENT}`,
        padding: '32px',
        fontFamily: ff,
      }}
    >
      <h3
        style={{
          margin: '0 0 8px',
          fontSize: '18px',
          fontWeight: 700,
          color: INK,
        }}
      >
        Aanmelden
      </h3>
      <p style={{ margin: '0 0 24px' }}>
        <span style={{ fontSize: '24px', fontWeight: 700, color: ACCENT }}>
          {formatPrice(product.price_cents)}
        </span>
        <span style={{ fontSize: '12px', color: MUTED, marginLeft: '6px' }}>incl. BTW</span>
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle} htmlFor="name">Naam</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Jouw volledige naam"
            style={inputStyle}
            onFocus={e => { (e.target as HTMLInputElement).style.outline = `2px solid ${ACCENT}`; (e.target as HTMLInputElement).style.outlineOffset = '1px' }}
            onBlur={e => { (e.target as HTMLInputElement).style.outline = 'none' }}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="email">E-mailadres</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="jouw@email.nl"
            style={inputStyle}
            onFocus={e => { (e.target as HTMLInputElement).style.outline = `2px solid ${ACCENT}`; (e.target as HTMLInputElement).style.outlineOffset = '1px' }}
            onBlur={e => { (e.target as HTMLInputElement).style.outline = 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <input
            id="terms"
            type="checkbox"
            checked={terms}
            onChange={e => setTerms(e.target.checked)}
            style={{ marginTop: '2px', accentColor: ACCENT, width: '16px', height: '16px', flexShrink: 0 }}
          />
          <label
            htmlFor="terms"
            style={{ fontSize: '13px', color: BODY, fontFamily: ff, cursor: 'pointer', lineHeight: 1.5 }}
          >
            Ik ga akkoord met de{' '}
            <a href="/voorwaarden" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, textDecoration: 'underline' }}>
              algemene voorwaarden
            </a>
          </label>
        </div>

        {error && (
          <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontFamily: ff }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#9ca3af' : ACCENT,
            color: '#ffffff',
            border: 'none',
            borderRadius: '2px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: ff,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = NAVY }}
          onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = ACCENT }}
        >
          {loading ? 'Bezig met doorsturen...' : 'Betaal nu via Mollie →'}
        </button>
      </form>
    </div>
  )
}

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const [product, setProduct] = useState<ShopProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/shop/products/${slug}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json() as Promise<ShopProduct>
      })
      .then(data => {
        if (data) { setProduct(data); setLoading(false) }
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [slug])

  if (loading) {
    return (
      <main style={{ fontFamily: ff, padding: '60px 24px', textAlign: 'center', color: MUTED }}>
        Laden...
      </main>
    )
  }

  if (notFound || !product) {
    return (
      <main style={{ fontFamily: ff, padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ color: INK }}>Product niet gevonden</h1>
        <Link href="/shop" style={{ color: ACCENT }}>← Terug naar alle producten</Link>
      </main>
    )
  }

  return (
    <main style={{ fontFamily: ff }}>
      {/* Hero — INK background */}
      <section style={{ background: INK, padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Back link */}
          <Link
            href="/shop"
            style={{
              display: 'inline-block',
              marginBottom: '32px',
              fontSize: '13px',
              color: MUTED,
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = MUTED }}
          >
            ← Alle producten
          </Link>

          {/* Type badge */}
          <div>
            <span
              style={{
                display: 'inline-block',
                background: 'rgba(29,78,216,0.15)',
                color: ACCENT,
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '4px 12px',
              }}
            >
              {product.type}
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              margin: '16px 0 12px',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.15,
              maxWidth: '640px',
            }}
          >
            {product.title}
          </h1>

          {/* Tagline */}
          {product.tagline && (
            <p style={{ margin: '0 0 28px', fontSize: '18px', color: MUTED, lineHeight: 1.5, maxWidth: '540px' }}>
              {product.tagline}
            </p>
          )}

          {/* Price row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '28px' }}>
            <span style={{ fontSize: '36px', fontWeight: 700, color: '#FFFFFF' }}>
              {formatPrice(product.price_cents)}
            </span>
            <span style={{ fontSize: '13px', color: MUTED }}>
              incl. {formatVat(product.vat_rate)} BTW
            </span>
          </div>

          {/* Format pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
            {['📅 Live webinar', '⏱ 2 uur', '💻 Google Meet'].map(pill => (
              <span
                key={pill}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '13px',
                  padding: '6px 14px',
                }}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Content + form — white bg */}
      <section style={{ background: '#ffffff' }}>
        <div
          style={{ maxWidth: '1100px', margin: '0 auto' }}
          className="shop-product-outer"
        >
          <div
            className="shop-product-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 380px',
              gap: '0',
              alignItems: 'start',
            }}
          >
            {/* Left: content */}
            <div style={{ padding: 'clamp(48px, 6vw, 72px) clamp(24px, 5vw, 80px)' }}>
              {product.description && (
                <div style={{ marginBottom: '48px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: WARM, fontWeight: 700 }}>
                    WAT JE KRIJGT
                  </p>
                  <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 700, color: INK }}>Inhoud & leerdoelen</h2>
                  <p style={{ margin: 0, fontSize: '16px', color: BODY, lineHeight: 1.75 }}>{product.description}</p>
                </div>
              )}

              {product.delivery_notes && (
                <div style={{ marginBottom: '48px' }}>
                  <p style={{ margin: '0 0 6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: WARM, fontWeight: 700 }}>
                    LEVERING
                  </p>
                  <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 700, color: INK }}>Hoe ontvang je dit?</h2>
                  <p style={{ margin: 0, fontSize: '16px', color: BODY, lineHeight: 1.75 }}>{product.delivery_notes}</p>
                </div>
              )}

              <div style={{ marginBottom: '48px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: WARM, fontWeight: 700 }}>
                  VOOR WIE?
                </p>
                <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 700, color: INK }}>Geschikt voor</h2>
                <p style={{ margin: 0, fontSize: '16px', color: BODY, lineHeight: 1.75 }}>
                  Voor ondernemers, freelancers en marketeers die willen begrijpen hoe AI-tools zoals Claude concreet ingezet
                  kunnen worden om een website te bouwen — zonder dat je hoeft te kunnen programmeren.
                </p>
              </div>

              {/* Mobile form */}
              <div className="shop-form-mobile">
                <CheckoutForm product={product} />
              </div>
            </div>

            {/* Right: sticky form — desktop only */}
            <div
              className="shop-form-sticky"
              style={{
                position: 'sticky',
                top: '24px',
                padding: 'clamp(48px, 6vw, 72px) clamp(24px, 4vw, 48px) clamp(48px, 6vw, 72px) 0',
              }}
            >
              <CheckoutForm product={product} />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 899px) {
          .shop-product-grid {
            grid-template-columns: 1fr !important;
          }
          .shop-form-sticky {
            display: none !important;
          }
          .shop-form-mobile {
            display: block;
          }
        }
        @media (min-width: 900px) {
          .shop-form-mobile {
            display: none;
          }
        }
      `}</style>
    </main>
  )
}
