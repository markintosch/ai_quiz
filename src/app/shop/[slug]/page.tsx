'use client'

import { useEffect, useState, use } from 'react'

const BRAND = '#354E5E'
const ACCENT = '#E8611A'
const NEAR_BLACK = '#1a1a1a'
const SUBTLE = '#6b7280'
const LIGHT_BG = '#f9fafb'

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
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '15px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: NEAR_BLACK,
    background: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  }

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        padding: '32px',
      }}
    >
      <h3
        style={{
          margin: '0 0 8px',
          fontSize: '18px',
          fontWeight: 700,
          color: NEAR_BLACK,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Aanmelden
      </h3>
      <p style={{ margin: '0 0 24px', fontSize: '22px', fontWeight: 700, color: BRAND, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        {formatPrice(product.price_cents)}
        <span style={{ fontSize: '12px', fontWeight: 400, color: SUBTLE, marginLeft: '6px' }}>incl. BTW</span>
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
            onFocus={e => { (e.target as HTMLInputElement).style.outline = `2px solid ${BRAND}`; (e.target as HTMLInputElement).style.outlineOffset = '1px' }}
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
            onFocus={e => { (e.target as HTMLInputElement).style.outline = `2px solid ${BRAND}`; (e.target as HTMLInputElement).style.outlineOffset = '1px' }}
            onBlur={e => { (e.target as HTMLInputElement).style.outline = 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <input
            id="terms"
            type="checkbox"
            checked={terms}
            onChange={e => setTerms(e.target.checked)}
            style={{ marginTop: '2px', accentColor: BRAND, width: '16px', height: '16px', flexShrink: 0 }}
          />
          <label
            htmlFor="terms"
            style={{ fontSize: '13px', color: '#374151', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', cursor: 'pointer', lineHeight: 1.5 }}
          >
            Ik ga akkoord met de algemene voorwaarden
          </label>
        </div>

        {error && (
          <p style={{ margin: 0, fontSize: '13px', color: '#dc2626', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: loading ? '#9ca3af' : ACCENT,
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            transition: 'background 0.15s ease',
          }}
        >
          {loading ? 'Bezig met doorsturen...' : 'Betaal nu via Mollie →'}
        </button>
      </form>
    </div>
  )
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
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
      <main style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '60px 24px', textAlign: 'center', color: SUBTLE }}>
        Laden...
      </main>
    )
  }

  if (notFound || !product) {
    return (
      <main style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ color: NEAR_BLACK }}>Product niet gevonden</h1>
        <a href="/shop" style={{ color: ACCENT }}>← Terug naar alle producten</a>
      </main>
    )
  }

  return (
    <main style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Top section — white */}
      <section style={{ background: '#ffffff', padding: 'clamp(32px, 5vw, 64px) clamp(20px, 5vw, 80px) 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <a
            href="/shop"
            style={{ display: 'inline-block', marginBottom: '24px', fontSize: '14px', color: SUBTLE, textDecoration: 'none' }}
          >
            ← Alle producten
          </a>

          {/* 2-column layout on desktop */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 380px',
              gap: '48px',
              alignItems: 'start',
            }}
            className="shop-product-grid"
          >
            {/* Left: product info */}
            <div>
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  border: `1px solid ${BRAND}`,
                  color: BRAND,
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  marginBottom: '20px',
                }}
              >
                {product.type}
              </span>

              <h1
                style={{
                  margin: '0 0 16px',
                  fontSize: 'clamp(28px, 4vw, 48px)',
                  fontWeight: 700,
                  color: NEAR_BLACK,
                  lineHeight: 1.15,
                }}
              >
                {product.title}
              </h1>

              {product.tagline && (
                <p style={{ margin: '0 0 24px', fontSize: '20px', color: SUBTLE, lineHeight: 1.4 }}>
                  {product.tagline}
                </p>
              )}

              {/* Price block */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: 700, color: BRAND }}>
                  {formatPrice(product.price_cents)}
                </span>
                <span style={{ display: 'block', fontSize: '12px', color: SUBTLE, marginTop: '4px' }}>
                  incl. {formatVat(product.vat_rate)} BTW
                </span>
              </div>

              {/* Format info */}
              <p style={{ margin: '0 0 8px', fontSize: '15px', color: '#374151' }}>
                📅 Live webinar &nbsp;·&nbsp; ⏱ 2 uur &nbsp;·&nbsp; 💻 Google Meet
              </p>
            </div>

            {/* Right: sticky form — desktop only visible here */}
            <div
              style={{ position: 'sticky' as const, top: '24px' }}
              className="shop-form-sticky"
            >
              <CheckoutForm product={product} />
            </div>
          </div>
        </div>
      </section>

      {/* Middle section — light bg */}
      <section style={{ background: LIGHT_BG, padding: 'clamp(32px, 5vw, 64px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          {product.description && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 700, color: NEAR_BLACK }}>Wat je krijgt</h2>
              <p style={{ margin: 0, fontSize: '16px', color: '#374151', lineHeight: 1.7 }}>{product.description}</p>
            </div>
          )}

          {product.delivery_notes && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 700, color: NEAR_BLACK }}>Levering</h2>
              <p style={{ margin: 0, fontSize: '16px', color: '#374151', lineHeight: 1.7 }}>{product.delivery_notes}</p>
            </div>
          )}

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: 700, color: NEAR_BLACK }}>Voor wie?</h2>
            <p style={{ margin: 0, fontSize: '16px', color: '#374151', lineHeight: 1.7 }}>
              Voor ondernemers, freelancers en marketeers die willen begrijpen hoe AI-tools zoals Claude concreet ingezet
              kunnen worden om een website te bouwen — zonder dat je hoeft te kunnen programmeren.
            </p>
          </div>

          {/* Mobile form — shown below middle section */}
          <div className="shop-form-mobile">
            <CheckoutForm product={product} />
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
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
        @media (min-width: 769px) {
          .shop-form-mobile {
            display: none;
          }
        }
      `}</style>
    </main>
  )
}
