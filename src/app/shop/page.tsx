'use client'

import { useEffect, useState } from 'react'

const BRAND = '#354E5E'
const ACCENT = '#E8611A'
const NEAR_BLACK = '#1a1a1a'
const SUBTLE = '#6b7280'

interface ShopProduct {
  id: string
  slug: string
  title: string
  tagline: string | null
  description: string | null
  price_cents: number
  vat_rate: number
  type: string
  cover_image_url: string | null
}

function formatPrice(cents: number): string {
  return '€' + (cents / 100).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function TypeBadge({ type }: { type: string }) {
  return (
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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {type}
    </span>
  )
}

function ProductCard({ product }: { product: ShopProduct }) {
  return (
    <a
      href={`/shop/${product.slug}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column' as const,
          height: '100%',
          transition: 'box-shadow 0.15s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        }}
      >
        {/* Card header */}
        <div
          style={{
            background: BRAND,
            padding: '32px 28px 24px',
            position: 'relative' as const,
          }}
        >
          <TypeBadge type={product.type} />
          {product.cover_image_url && (
            <img
              src={product.cover_image_url}
              alt={product.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15 }}
            />
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '12px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: NEAR_BLACK,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              lineHeight: 1.3,
            }}
          >
            {product.title}
          </h2>
          {product.tagline && (
            <p style={{ margin: 0, fontSize: '14px', color: SUBTLE, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              {product.tagline}
            </p>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '22px', fontWeight: 700, color: BRAND, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
              {formatPrice(product.price_cents)}
            </span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: ACCENT,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Bekijk &amp; aanmelden →
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/shop/products')
      .then(r => r.json())
      .then((data: ShopProduct[]) => {
        setProducts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Hero */}
      <section style={{ background: BRAND, padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: 'rgba(255,255,255,0.6)',
              fontWeight: 600,
            }}
          >
            MARKDEKOCK.COM
          </p>
          <h1
            style={{
              margin: '0 0 20px',
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.15,
            }}
          >
            Kennisproducten
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '18px',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.6,
              maxWidth: '580px',
            }}
          >
            Webinars, handleidingen en cursussen over AI-gedreven webontwikkeling.
          </p>
        </div>
      </section>

      {/* Products grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) clamp(20px, 4vw, 40px)' }}>
        {loading ? (
          <p style={{ color: SUBTLE, fontSize: '15px' }}>Producten laden...</p>
        ) : products.length === 0 ? (
          <p style={{ color: SUBTLE, fontSize: '15px' }}>Momenteel geen producten beschikbaar.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
