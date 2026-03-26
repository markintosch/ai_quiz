'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const BRAND = '#354E5E'
const ACCENT = '#E8611A'
const NEAR_BLACK = '#1a1a1a'
const SUBTLE = '#6b7280'

interface ShopProduct {
  id: string
  slug: string
  title: string
  tagline: string | null
  price_cents: number
  vat_rate: number
  type: string
  delivery_notes: string | null
}

function formatPrice(cents: number): string {
  return '€' + (cents / 100).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function EmbedPage() {
  const params = useParams()
  const slug = params.slug as string
  const [product, setProduct] = useState<ShopProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [terms, setTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/shop/products/${slug}`)
      .then(r => r.ok ? r.json() as Promise<ShopProduct> : null)
      .then(data => { if (data) setProduct(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!terms) {
      setError('Accepteer de algemene voorwaarden om door te gaan.')
      return
    }

    if (!product) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/shop/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productSlug: product.slug, customerName: name, customerEmail: email }),
      })

      const data = await res.json() as { checkoutUrl?: string; orderId?: string; error?: string }

      if (!res.ok || !data.checkoutUrl) {
        setError(data.error ?? 'Er is iets misgegaan. Probeer het opnieuw.')
        setSubmitting(false)
        return
      }

      window.location.href = data.checkoutUrl
    } catch {
      setError('Er is iets misgegaan. Probeer het opnieuw.')
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: NEAR_BLACK,
    background: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '5px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  }

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: SUBTLE, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}>
        Laden...
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#dc2626', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: '14px' }}>
        Product niet gevonden.
      </div>
    )
  }

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '24px',
        maxWidth: '480px',
        margin: '0 auto',
        background: '#ffffff',
      }}
    >
      {/* Product summary */}
      <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            border: `1px solid ${BRAND}`,
            color: BRAND,
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            marginBottom: '10px',
          }}
        >
          {product.type}
        </span>
        <h2
          style={{
            margin: '0 0 6px',
            fontSize: '17px',
            fontWeight: 700,
            color: NEAR_BLACK,
            lineHeight: 1.25,
          }}
        >
          {product.title}
        </h2>
        {product.tagline && (
          <p style={{ margin: '0 0 10px', fontSize: '13px', color: SUBTLE }}>{product.tagline}</p>
        )}
        <p style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: BRAND }}>
          {formatPrice(product.price_cents)}
          <span style={{ fontSize: '11px', fontWeight: 400, color: SUBTLE, marginLeft: '6px' }}>
            incl. {Math.round(product.vat_rate * 100)}% BTW
          </span>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle} htmlFor="embed-name">Naam</label>
          <input
            id="embed-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Jouw naam"
            style={inputStyle}
            onFocus={e => { (e.target as HTMLInputElement).style.outline = `2px solid ${BRAND}`; (e.target as HTMLInputElement).style.outlineOffset = '1px' }}
            onBlur={e => { (e.target as HTMLInputElement).style.outline = 'none' }}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="embed-email">E-mailadres</label>
          <input
            id="embed-email"
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

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <input
            id="embed-terms"
            type="checkbox"
            checked={terms}
            onChange={e => setTerms(e.target.checked)}
            style={{ marginTop: '2px', accentColor: BRAND, width: '14px', height: '14px', flexShrink: 0 }}
          />
          <label
            htmlFor="embed-terms"
            style={{ fontSize: '12px', color: '#374151', cursor: 'pointer', lineHeight: 1.5, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
          >
            Ik ga akkoord met de algemene voorwaarden
          </label>
        </div>

        {error && (
          <p style={{ margin: 0, fontSize: '12px', color: '#dc2626', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px',
            background: submitting ? '#9ca3af' : ACCENT,
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          {submitting ? 'Bezig met doorsturen...' : 'Betaal nu via Mollie →'}
        </button>
      </form>
    </div>
  )
}
