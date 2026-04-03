import { headers } from 'next/headers'
import { getProductKeyFromHost } from '@/products'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Debug endpoint — only available outside production
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Not available in production' }, { status: 404 })
  }

  const h = await headers()
  const host            = h.get('host') ?? ''
  const xForwardedHost  = h.get('x-forwarded-host') ?? ''
  const effectiveHost   = xForwardedHost || host
  const productKey      = getProductKeyFromHost(effectiveHost)
  const productKeyRaw   = getProductKeyFromHost(host)

  return Response.json({
    host,
    xForwardedHost,
    effectiveHost,
    productKey,
    productKeyRaw,
    subdomain: effectiveHost.split('.')[0],
  })
}
