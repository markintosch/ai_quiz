'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'

const INK    = '#0F172A'
const ACCENT = '#1D4ED8'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'
const LIGHT  = '#F8FAFC'
const ff     = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}
const stagger: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.10 } },
}

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

function ProductCard({ product }: { product: ShopProduct }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div variants={fadeUp}>
      <Link href={`/shop/${product.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${hovered ? ACCENT : BORDER}`,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            transition: 'border-color 0.15s',
            cursor: 'pointer',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Top accent strip */}
          <div style={{ height: '4px', background: ACCENT, flexShrink: 0 }} />

          {/* Card body */}
          <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', fontFamily: ff }}>
            {/* Type badge */}
            <span
              style={{
                display: 'inline-block',
                color: ACCENT,
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              {product.type}
            </span>

            {/* Title */}
            <h2
              style={{
                margin: '0 0 8px',
                fontSize: '18px',
                fontWeight: 700,
                color: INK,
                lineHeight: 1.3,
              }}
            >
              {product.title}
            </h2>

            {/* Tagline */}
            {product.tagline && (
              <p
                style={{
                  margin: '0 0 20px',
                  fontSize: '14px',
                  color: BODY,
                  lineHeight: 1.6,
                }}
              >
                {product.tagline}
              </p>
            )}

            {/* Bottom row */}
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '22px', fontWeight: 700, color: INK }}>
                {formatPrice(product.price_cents)}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: ACCENT }}>
                Bekijk →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
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
    <main style={{ fontFamily: ff }}>
      {/* Hero */}
      <section
        style={{
          background: INK,
          padding: 'clamp(80px, 10vw, 120px) clamp(24px, 5vw, 80px)',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Eyebrow badge */}
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.08)',
              color: MUTED,
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '5px 12px',
              marginBottom: '24px',
            }}
          >
            KENNISPRODUCTEN
          </span>

          <h1
            style={{
              margin: '0 0 16px',
              fontSize: 'clamp(32px, 4.5vw, 56px)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.15,
              maxWidth: '640px',
            }}
          >
            Leer werken met AI. Concreet, praktisch, direct toepasbaar.
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: '18px',
              color: MUTED,
              lineHeight: 1.6,
              maxWidth: '580px',
            }}
          >
            Webinars, handleidingen en cursussen over AI-gedreven ontwikkeling.
          </p>
        </div>
      </section>

      {/* Products section */}
      <section style={{ background: LIGHT, padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section label */}
          <p
            style={{
              margin: '0 0 32px',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: MUTED,
              fontWeight: 600,
            }}
          >
            BESCHIKBAAR
          </p>

          {loading ? (
            <p style={{ color: MUTED, fontSize: '15px' }}>Producten laden...</p>
          ) : products.length === 0 ? (
            <p style={{ color: MUTED, fontSize: '15px' }}>Momenteel geen producten beschikbaar.</p>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <style>{`
        @media (min-width: 768px) {
          .shop-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1100px) {
          .shop-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </main>
  )
}
