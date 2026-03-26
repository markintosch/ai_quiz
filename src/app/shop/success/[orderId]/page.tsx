'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const INK    = '#0F172A'
const ACCENT = '#1D4ED8'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'
const LIGHT  = '#F8FAFC'
const ff     = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif"

type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'canceled'

interface OrderData {
  status: OrderStatus
  productTitle: string
  customerName: string
}

function PendingView() {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <p style={{ fontSize: '20px', color: MUTED, fontFamily: ff }}>
        Betaling wordt verwerkt{dots}
      </p>
    </div>
  )
}

function PaidView({ productTitle, customerName }: { productTitle: string; customerName: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '540px', margin: '0 auto' }}>
      {/* Checkmark circle — ACCENT blue, not green */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: `2px solid ${ACCENT}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          fontSize: '36px',
          color: ACCENT,
        }}
      >
        ✓
      </div>
      <h1
        style={{
          margin: '0 0 16px',
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 700,
          color: INK,
          fontFamily: ff,
        }}
      >
        Betaling geslaagd!
      </h1>
      <p
        style={{
          margin: '0 0 32px',
          fontSize: '17px',
          color: BODY,
          fontFamily: ff,
          lineHeight: 1.6,
        }}
      >
        Check je inbox — de bevestiging is onderweg.
      </p>
      {/* Info card */}
      <div
        style={{
          background: '#ffffff',
          border: `1px solid ${BORDER}`,
          borderTop: `3px solid ${ACCENT}`,
          padding: '20px 24px',
          textAlign: 'left',
          fontFamily: ff,
        }}
      >
        <p style={{ margin: '0 0 4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED }}>Product</p>
        <p style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: INK }}>{productTitle}</p>
        <p style={{ margin: '0 0 4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED }}>Naam</p>
        <p style={{ margin: 0, fontSize: '15px', color: BODY }}>{customerName}</p>
      </div>
    </div>
  )
}

function FailedView({ slug }: { slug?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', fontFamily: ff }}>
      <p style={{ fontSize: '20px', color: '#dc2626', marginBottom: '24px' }}>
        Betaling mislukt. Probeer opnieuw.
      </p>
      {slug && (
        <a
          href={`/shop/${slug}`}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: ACCENT,
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
            borderRadius: '2px',
          }}
        >
          ← Terug naar het product
        </a>
      )}
    </div>
  )
}

export default function SuccessPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<OrderData | null>(null)
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 10

  useEffect(() => {
    if (!orderId) return

    const poll = async () => {
      try {
        const res = await fetch(`/api/shop/orders/${orderId}`)
        if (!res.ok) return
        const data = await res.json() as OrderData
        setOrder(data)

        if (data.status === 'pending' && attempts < maxAttempts) {
          setAttempts(a => a + 1)
          setTimeout(poll, 2000)
        }
      } catch {
        // silent
      }
    }

    poll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  return (
    <main
      style={{
        fontFamily: ff,
        minHeight: '100vh',
        background: LIGHT,
      }}
    >
      {/* Back link at top */}
      <div style={{ padding: '24px clamp(24px, 5vw, 80px)' }}>
        <a
          href="https://www.markdekock.com"
          style={{ fontSize: '13px', color: MUTED, textDecoration: 'none' }}
        >
          ← markdekock.com
        </a>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 clamp(24px, 5vw, 80px) clamp(60px, 8vw, 96px)' }}>
        {!order || order.status === 'pending' ? (
          <PendingView />
        ) : order.status === 'paid' ? (
          <PaidView productTitle={order.productTitle} customerName={order.customerName} />
        ) : (
          <FailedView />
        )}
      </div>
    </main>
  )
}
