'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const BRAND = '#354E5E'
const ACCENT = '#E8611A'
const NEAR_BLACK = '#1a1a1a'
const SUBTLE = '#6b7280'

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
      <p
        style={{
          fontSize: '20px',
          color: SUBTLE,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Betaling wordt verwerkt{dots}
      </p>
    </div>
  )
}

function PaidView({ productTitle, customerName }: { productTitle: string; customerName: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', maxWidth: '540px', margin: '0 auto' }}>
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#dcfce7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          fontSize: '36px',
          color: '#16a34a',
        }}
      >
        ✓
      </div>
      <h1
        style={{
          margin: '0 0 16px',
          fontSize: 'clamp(24px, 4vw, 36px)',
          fontWeight: 700,
          color: NEAR_BLACK,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Betaling geslaagd!
      </h1>
      <p
        style={{
          margin: '0 0 12px',
          fontSize: '17px',
          color: SUBTLE,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          lineHeight: 1.6,
        }}
      >
        Check je inbox — de bevestiging is onderweg.
      </p>
      <div
        style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          padding: '20px 24px',
          margin: '32px 0',
          textAlign: 'left',
        }}
      >
        <p style={{ margin: '0 0 6px', fontSize: '13px', color: SUBTLE, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Product</p>
        <p style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 600, color: BRAND, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{productTitle}</p>
        <p style={{ margin: '0 0 6px', fontSize: '13px', color: SUBTLE, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>Naam</p>
        <p style={{ margin: 0, fontSize: '15px', color: NEAR_BLACK, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>{customerName}</p>
      </div>
    </div>
  )
}

function FailedView({ slug }: { slug?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <p style={{ fontSize: '20px', color: '#dc2626', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', marginBottom: '24px' }}>
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
            borderRadius: '4px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
    <main style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', minHeight: '60vh' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) clamp(20px, 4vw, 40px)' }}>
        {!order || order.status === 'pending' ? (
          <PendingView />
        ) : order.status === 'paid' ? (
          <PaidView productTitle={order.productTitle} customerName={order.customerName} />
        ) : (
          <FailedView />
        )}

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <a
            href="/"
            style={{
              fontSize: '14px',
              color: SUBTLE,
              textDecoration: 'none',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            ← Terug naar markdekock.com
          </a>
        </div>
      </div>
    </main>
  )
}
