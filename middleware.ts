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
  if (pathname.startsWith('/mentor'))    return NextResponse.next()

  // ── markdekock.com root → mentor page (rewrite: URL stays as markdekock.com) ─
  const hostname  = req.nextUrl.hostname
  const xfwdHost = req.headers.get('x-forwarded-host') ?? ''
  const hostHdr  = req.headers.get('host') ?? ''
  const isMark   = hostname.includes('markdekock.com') ||
                   xfwdHost.includes('markdekock.com') ||
                   hostHdr.includes('markdekock.com')
  // DEBUG: expose headers so we can see what Vercel sends (remove after diagnosis)
  if (pathname === '/' && !isMark) {
    const res = NextResponse.next()
    res.headers.set('x-dbg-hostname', hostname)
    res.headers.set('x-dbg-xfwd', xfwdHost || 'none')
    res.headers.set('x-dbg-host', hostHdr || 'none')
    return res
  }
  if (isMark && pathname === '/') {
    const url = req.nextUrl.clone()
    url.pathname = '/mentor'
    return NextResponse.rewrite(url)
  }

  // ── Public routes: locale routing via next-intl ───────────────────────────
  // Note: product_key is resolved from the host header directly in server
  // components and API routes via getProductKeyFromHost() in src/products/index.ts
  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
