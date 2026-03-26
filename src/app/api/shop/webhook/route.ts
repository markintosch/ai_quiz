export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { mollie } from '@/lib/mollie'
import { PaymentStatus } from '@mollie/api-client'
import { Resend } from 'resend'
import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Mark de Kock <mark@markdekock.com>'

interface ShopOrder {
  id: string
  customer_name: string
  customer_email: string
  amount_cents: number
  product_id: string
}

interface ShopProduct {
  title: string
  delivery_notes: string | null
  delivery_url: string | null
}

function deliveryEmailHtml({
  name,
  productTitle,
  deliveryNotes,
  deliveryUrl,
}: {
  name: string
  productTitle: string
  deliveryNotes: string | null
  deliveryUrl: string | null
}): string {
  const BRAND = '#354E5E'
  const ACCENT = '#E8611A'

  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:${BRAND};padding:32px 40px;">
            <p style="margin:0;color:rgba(255,255,255,0.6);font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">MARKDEKOCK.COM</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">Bevestigd: ${productTitle}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 20px;font-size:16px;color:#1a1a1a;">Hoi ${name},</p>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              Je aanmelding voor <strong>${productTitle}</strong> is bevestigd. Bedankt!
            </p>
            ${deliveryNotes ? `
            <div style="background:#f9fafb;border-left:3px solid ${ACCENT};padding:20px 24px;margin:0 0 24px;">
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${deliveryNotes}</p>
            </div>` : ''}
            ${deliveryUrl ? `
            <p style="margin:0 0 24px;font-size:15px;color:#374151;">
              Join via: <a href="${deliveryUrl}" style="color:${ACCENT};text-decoration:none;font-weight:600;">${deliveryUrl}</a>
            </p>` : ''}
            <p style="margin:0 0 32px;font-size:14px;color:#6b7280;line-height:1.6;">
              Vragen? Stuur een mail naar <a href="mailto:mark@markdekock.com" style="color:${ACCENT};text-decoration:none;">mark@markdekock.com</a>
            </p>
            <p style="margin:0;font-size:15px;color:#1a1a1a;">Mark de Kock<br>
            <a href="https://www.markdekock.com" style="color:${ACCENT};text-decoration:none;font-size:13px;">markdekock.com</a></p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© markdekock.com</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function notificationEmailHtml({
  customerName,
  customerEmail,
  amountCents,
  orderId,
  productTitle,
}: {
  customerName: string
  customerEmail: string
  amountCents: number
  orderId: string
  productTitle: string
}): string {
  const BRAND = '#354E5E'
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:32px;background:#f9fafb;">
  <div style="max-width:500px;background:#fff;border:1px solid #e5e7eb;padding:32px;">
    <h2 style="margin:0 0 20px;color:${BRAND};">Nieuwe aanmelding: ${productTitle}</h2>
    <p style="margin:0 0 8px;font-size:14px;color:#374151;"><strong>Naam:</strong> ${customerName}</p>
    <p style="margin:0 0 8px;font-size:14px;color:#374151;"><strong>E-mail:</strong> ${customerEmail}</p>
    <p style="margin:0 0 8px;font-size:14px;color:#374151;"><strong>Bedrag:</strong> €${(amountCents / 100).toFixed(2)} incl. BTW</p>
    <p style="margin:0;font-size:12px;color:#9ca3af;">Order ID: ${orderId}</p>
  </div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const params = new URLSearchParams(body)
    const paymentId = params.get('id')

    if (!paymentId) {
      return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
    }

    const payment = await mollie.payments.get(paymentId)
    const metadata = payment.metadata as { orderId?: string }
    const orderId = metadata?.orderId

    if (!orderId) {
      console.error('Webhook: no orderId in payment metadata', paymentId)
      return NextResponse.json({}, { status: 200 })
    }

    const supabase = createServiceClient() as AnyClient

    if (payment.status === PaymentStatus.paid) {
      // Update order to paid
      await supabase
        .from('shop_orders')
        .update({ status: 'paid', delivery_sent_at: new Date().toISOString() })
        .eq('id', orderId)

      // Fetch order + product for email
      const { data: order } = await supabase
        .from('shop_orders')
        .select('id, customer_name, customer_email, amount_cents, product_id')
        .eq('id', orderId)
        .single() as { data: ShopOrder | null; error: unknown }

      if (order) {
        const { data: product } = await supabase
          .from('shop_products')
          .select('title, delivery_notes, delivery_url')
          .eq('id', order.product_id)
          .single() as { data: ShopProduct | null; error: unknown }

        if (product) {
          // Send delivery confirmation to customer
          await resend.emails.send({
            from: FROM,
            to: order.customer_email,
            subject: `Bevestigd: ${product.title}`,
            html: deliveryEmailHtml({
              name: order.customer_name,
              productTitle: product.title,
              deliveryNotes: product.delivery_notes,
              deliveryUrl: product.delivery_url,
            }),
          })

          // Send notification to Mark
          await resend.emails.send({
            from: FROM,
            to: 'mark@markdekock.com',
            subject: `Nieuwe aanmelding: ${product.title}`,
            html: notificationEmailHtml({
              customerName: order.customer_name,
              customerEmail: order.customer_email,
              amountCents: order.amount_cents,
              orderId: order.id,
              productTitle: product.title,
            }),
          })
        }
      }
    } else if (payment.status === PaymentStatus.failed) {
      await supabase.from('shop_orders').update({ status: 'failed' }).eq('id', orderId)
    } else if (payment.status === PaymentStatus.expired) {
      await supabase.from('shop_orders').update({ status: 'expired' }).eq('id', orderId)
    } else if (payment.status === PaymentStatus.canceled) {
      await supabase.from('shop_orders').update({ status: 'canceled' }).eq('id', orderId)
    }

    return NextResponse.json({}, { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    // Always return 200 so Mollie doesn't retry on our internal errors
    return NextResponse.json({}, { status: 200 })
  }
}
