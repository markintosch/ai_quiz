import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from './src/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin routes: locale-invariant, guard with cookie
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next()
    const token = req.cookies.get('admin_token')?.value
    if (token !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return NextResponse.next()
  }

  // API routes pass through
  if (pathname.startsWith('/api')) return NextResponse.next()

  // Everything else: locale routing
  return intlMiddleware(req)
}

export const config = {
  // Run middleware on all paths except Next.js static assets.
  // Admin/API bypass is handled inside the middleware function above.
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
