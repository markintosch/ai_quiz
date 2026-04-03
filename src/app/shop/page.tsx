'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'

const INK    = '#0F172A'
const ACCENT = '#1D4ED8'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'
const LIGHT  = '#F8FAFC'
const ff     = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif"

type Lang = 'nl' | 'en'

const UI = {
  nl: {
    eyebrow: 'Kennisproducten',
    heroTitle: 'Leer werken met AI. Concreet, praktisch, direct toepasbaar.',
    heroSub: 'Webinars, mentoring en workshops over AI-gedreven ontwikkeling.',
    available: 'Beschikbaar',
    loading: 'Producten laden...',
    empty: 'Momenteel geen producten beschikbaar.',
    viewBtn: 'Bekijk →',
    exclVat: 'excl. BTW',
  },
  en: {
    eyebrow: 'Knowledge Products',
    heroTitle: 'Learn to work with AI. Concrete, practical, immediately applicable.',
    heroSub: 'Webinars, mentoring and workshops on AI-driven development.',
    available: 'Available',
    loading: 'Loading products...',
    empty: 'No products available at the moment.',
    viewBtn: 'View →',
    exclVat: 'excl. VAT',
  },
}

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
  brand: string
  title: string
  tagline: string | null
  description: string | null
  title_en: string | null
  tagline_en: string | null
  description_en: string | null
  price_cents: number
  vat_rate: number
  type: string
  cover_image_url: string | null
}

function formatPrice(cents: number): string {
  return '€' + (cents / 100).toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function typeAccent(type: string): string {
  if (type === 'mentoring') return '#D97706'
  if (type === 'workshop') return '#059669'
  if (type === 'samenwerking') return '#7C3AED'
  return ACCENT
}

function ProductCard({ product, lang, ui }: { product: ShopProduct; lang: Lang; ui: typeof UI['nl'] }) {
  const [hovered, setHovered] = useState(false)
  const title   = (lang === 'en' && product.title_en)   ? product.title_en   : product.title
  const tagline = (lang === 'en' && product.tagline_en) ? product.tagline_en : product.tagline
  const accent  = typeAccent(product.type)

  return (
    <motion.div variants={fadeUp} style={{ height: '100%' }}>
      <Link href={`/shop/${product.slug}?lang=${lang}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${hovered ? accent : BORDER}`,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            transition: 'border-color 0.15s',
            cursor: 'pointer',
            borderRadius: 2,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div style={{ height: '4px', background: accent, flexShrink: 0, borderRadius: '2px 2px 0 0' }} />
          <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', fontFamily: ff }}>
            {/* Type + brand */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: accent, fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {product.type}
              </span>
              {product.brand === 'frank-meeuwsen' && (
                <span style={{ fontSize: '10px', color: MUTED, fontWeight: 600, background: LIGHT, padding: '2px 8px', borderRadius: 100 }}>Frank Meeuwsen</span>
              )}
              {product.brand === 'mark-frank' && (
                <span style={{ fontSize: '10px', color: '#7C3AED', fontWeight: 600, background: '#F5F3FF', padding: '2px 8px', borderRadius: 100 }}>Mark & Frank</span>
              )}
            </div>
            <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: INK, lineHeight: 1.3 }}>
              {title}
            </h2>
            {tagline && (
              <p style={{ margin: '0 0 20px', fontSize: '14px', color: BODY, lineHeight: 1.6 }}>
                {tagline}
              </p>
            )}
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '22px', fontWeight: 700, color: INK }}>{formatPrice(product.price_cents)}</span>
                <span style={{ fontSize: '11px', color: MUTED, marginLeft: 4 }}>{ui.exclVat}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: accent }}>{ui.viewBtn}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function ShopPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawLang = searchParams.get('lang') ?? 'nl'
  const lang = (['nl', 'en'].includes(rawLang) ? rawLang : 'nl') as Lang
  const ui = UI[lang]
  const switchLang = (l: Lang) => router.replace(`/shop?lang=${l}`)

  const [products, setProducts] = useState<ShopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/shop/products')
      .then(r => r.json())
      .then((data: ShopProduct[]) => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main style={{ fontFamily: ff }}>
      {/* Hero */}
      <section style={{ background: INK, padding: 'clamp(80px, 10vw, 120px) clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.08)', color: MUTED, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '5px 12px' }}>
              {ui.eyebrow}
            </span>
            {/* Lang toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: 100, padding: 3, gap: 2 }}>
              {(['nl', 'en'] as Lang[]).map(l => (
                <button key={l} onClick={() => switchLang(l)} style={{ padding: '4px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: lang === l ? '#fff' : 'transparent', color: lang === l ? INK : MUTED, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.15, maxWidth: '640px' }}>
            {ui.heroTitle}
          </h1>
          <p style={{ margin: 0, fontSize: '18px', color: MUTED, lineHeight: 1.6, maxWidth: '580px' }}>
            {ui.heroSub}
          </p>
        </div>
      </section>

      {/* Products */}
      <section style={{ background: LIGHT, padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 32px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED, fontWeight: 600 }}>
            {ui.available}
          </p>
          {loading ? (
            <p style={{ color: MUTED, fontSize: '15px' }}>{ui.loading}</p>
          ) : products.length === 0 ? (
            <p style={{ color: MUTED, fontSize: '15px' }}>{ui.empty}</p>
          ) : (
            <motion.div
              variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}
            >
              {products.map(p => <ProductCard key={p.id} product={p} lang={lang} ui={ui} />)}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100vh', background: INK }} />}>
      <ShopPageInner />
    </Suspense>
  )
}
