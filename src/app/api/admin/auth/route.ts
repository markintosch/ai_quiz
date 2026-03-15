export const dynamic = 'force-dynamic'

// FILE: src/app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const body = await req.json() as { password?: string }

  if (body.password !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const cookieStore = cookies()
  cookieStore.set('admin_token', process.env.ADMIN_SECRET!, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest) {
  const cookieStore = cookies()
  cookieStore.set('admin_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })

  return NextResponse.json({ ok: true })
}
