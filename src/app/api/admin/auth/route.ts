export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deriveSessionToken, adminCookieOptions } from '@/lib/admin/auth'

export async function POST(req: NextRequest) {
  const body = await req.json() as { password?: string }

  const secret = process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD
  if (!secret || body.password !== secret) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_token', deriveSessionToken(secret), adminCookieOptions())

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.set('admin_token', '', adminCookieOptions(0))

  return NextResponse.json({ ok: true })
}
