// FILE: src/app/api/cycle/export/route.ts
// JSON / CSV export of all the user's data.

import { NextResponse } from 'next/server'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type DailyRow   = Database['public']['Tables']['cycle_daily_entries']['Row']
type WeatherRow = Database['public']['Tables']['cycle_weather']['Row']

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(req: Request) {
  const user = await requireCycleUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const format = new URL(req.url).searchParams.get('format') ?? 'json'
  const supabase = await createClient()

  const profileRes = await supabase
    .from('cycle_profiles').select('*').eq('user_id', user.id).maybeSingle()
  const entriesRes = await supabase
    .from('cycle_daily_entries').select('*').eq('user_id', user.id).order('entry_date', { ascending: true })
  const weatherRes = await supabase
    .from('cycle_weather').select('*').eq('user_id', user.id).order('entry_date', { ascending: true })

  const profile = profileRes.data
  const entries: DailyRow[] = (entriesRes.data ?? []) as DailyRow[]
  const weather: WeatherRow[] = (weatherRes.data ?? []) as WeatherRow[]

  if (format === 'csv') {
    const headers = [
      'entry_date', 'mood_score', 'mood_variable', 'sleep', 'stress',
      'activity_types', 'activity_intensity', 'alcohol_glasses',
      'symptoms', 'symptom_intensities', 'nap_taken', 'busy_day', 'menstruation_flag',
      'readiness_score', 'cycle_phase', 'score_feedback',
      'temp_c', 'condition',
    ]
    const weatherByDate: Record<string, WeatherRow> = Object.fromEntries(weather.map(w => [w.entry_date, w]))
    const rows = entries.map(e => {
      const w = weatherByDate[e.entry_date]
      const intensities = (e.symptom_intensities ?? {}) as Record<string, number>
      const intensitiesSerialized = Object.entries(intensities)
        .map(([k, v]) => `${k}:${v}`)
        .join('|')
      return [
        e.entry_date, e.mood_score, e.mood_variable, e.sleep, e.stress,
        (e.activity_types ?? []).join('|'),
        e.activity_intensity ?? '',
        e.alcohol_glasses ?? 0,
        (e.symptoms ?? []).join('|'),
        intensitiesSerialized,
        e.nap_taken,
        e.busy_day,
        e.menstruation_flag,
        e.readiness_score ?? '',
        e.cycle_phase,
        e.score_feedback ?? '',
        w?.temp_c ?? '',
        w?.condition ?? '',
      ].map(csvEscape).join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    return new NextResponse(csv, {
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="cycle-companion-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    })
  }

  // Default: JSON
  const payload = {
    exported_at: new Date().toISOString(),
    profile,
    entries,
    weather,
  }
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="cycle-companion-${new Date().toISOString().slice(0,10)}.json"`,
    },
  })
}
