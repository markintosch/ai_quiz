// FILE: src/app/api/cycle/geocode/route.ts
// Thin wrapper around Open-Meteo's geocoding API. Auth-gated so random
// visitors can't hammer it.

import { NextResponse } from 'next/server'
import { requireCycleUser } from '@/lib/cycle/auth'
import { geocodeCity } from '@/lib/cycle/weather'

export async function GET(req: Request) {
  const user = await requireCycleUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const q = new URL(req.url).searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json({ ok: true, results: [] })

  const results = await geocodeCity(q)
  return NextResponse.json({ ok: true, results })
}
