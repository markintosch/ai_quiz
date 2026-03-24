import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { routing } from './src/i18n/routing'

// ─── Admin token check ────────────────────────────────────────────────────────
// Must stay in sync with src/lib/admin/auth.ts deriveSessionToken()
function deriveSessionToken(secret: string): string {
  return createHmac('sha256', secret).update('admin-session-v1').digest('hex')
}

// ─── next-intl middleware ─────────────────────────────────────────────────────
const intlMiddleware = createMiddleware(routing)

// ─── Main middleware ──────────────────────────────────────────────────────────
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Admin routes: locale-invariant, HMAC-cookie auth ─────────────────────
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()
    const token  = req.cookies.get('admin_token')?.value
    const secret = process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD
    if (!secret || !token || token !== deriveSessionToken(secret)) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  }

  // ── API routes pass through ───────────────────────────────────────────────
  if (pathname.startsWith('/api')) return NextResponse.next()

  // ── Arena routes: locale-free, no auth ───────────────────────────────────
  if (pathname.startsWith('/arena')) return NextResponse.next()

  // ── Dashboard routes: locale-free, token-gated at page level ─────────────
  if (pathname.startsWith('/dashboard')) return NextResponse.next()

  // ── Standalone product pages: self-contained with own language toggle ─────
  if (pathname.startsWith('/cx'))        return NextResponse.next()
  if (pathname.startsWith('/oncology'))  return NextResponse.next()
  if (pathname.startsWith('/madaster'))  return NextResponse.next()
  if (pathname.startsWith('/abbvie'))    return NextResponse.next()

  // ── Public routes: locale routing via next-intl ───────────────────────────
  // Note: product_key is resolved from the host header directly in server
  // components and API routes via getProductKeyFromHost() in src/products/index.ts
  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
