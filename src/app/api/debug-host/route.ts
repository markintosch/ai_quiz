import { headers } from 'next/headers'
import { getProductKeyFromHost } from '@/products'

export const dynamic = 'force-dynamic'

export async function GET() {
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
