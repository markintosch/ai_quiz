// FILE: src/app/api/cycle/health/route.ts
// Public diagnostic — confirms which env vars + Vercel deploy are live
// without leaking any values. Bookmarkable.
//
// GET /api/cycle/health
// → { ok, deploy: { commit, environment }, config: { allowlist: 'set (2 emails)', ... } }

import { NextResponse } from 'next/server'

function status(value: string | undefined, kind?: 'csv'): string {
  if (!value || !value.trim()) return 'missing'
  if (kind === 'csv') {
    const count = value.split(',').filter(s => s.trim()).length
    return `set (${count} ${count === 1 ? 'email' : 'emails'})`
  }
  return 'set'
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local'
  const env = process.env.VERCEL_ENV ?? 'development'
  return NextResponse.json({
    ok: true,
    deploy: { commit: sha, environment: env, deployed_at: new Date().toISOString() },
    config: {
      allowlist:         status(process.env.CYCLE_ALLOWED_EMAILS, 'csv'),
      cron_secret:       status(process.env.CRON_SECRET),
      supabase_url:      status(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabase_anon_key: status(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabase_service:  status(process.env.SUPABASE_SERVICE_ROLE_KEY),
      resend_api_key:    status(process.env.RESEND_API_KEY),
      reminder_from:     status(process.env.CYCLE_REMINDER_FROM),
    },
  })
}
