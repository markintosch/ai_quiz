import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { scoreAssessment, type Answers } from '@/products/ai_benchmark/scoring'
import { type Role, getQuestions } from '@/products/ai_benchmark/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_ROLES: Role[] = ['marketing', 'sales', 'hybrid']

// Canonical Q2 tool ID set, computed once per cold start.
const Q2_CANONICAL_TOOL_IDS = (() => {
  const q2 = getQuestions('marketing').find(q => q.id === 'q2')
  if (!q2) return new Set<string>()
  return new Set(q2.options.map(o => o.id).filter(id => id !== 'none'))
})()

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`ai_benchmark_submit:${ip}`, 5, 10 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const body = await req.json() as {
      name?:             string
      email?:            string
      lang?:             string
      role?:             string
      seniority?:        string
      industry?:         string
      companySize?:      string
      region?:           string
      marketingConsent?: boolean
      answers?:          Answers
    }

    const email = (body.email || '').trim().toLowerCase()
    if (!email || !email.includes('@') || email.length > 200) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    const role = (body.role || '') as Role
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    const answers = body.answers || {}
    if (typeof answers !== 'object' || Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid answers' }, { status: 400 })
    }

    const { dimensionScores, totalScore, archetype } = scoreAssessment(role, answers)

    const userAgent = req.headers.get('user-agent')?.slice(0, 300) ?? null

    const { data, error } = await supabase
      .from('ai_benchmark_responses')
      .insert({
        name:              (body.name || '').slice(0, 100) || null,
        email,
        lang:              (body.lang || 'nl').slice(0, 5),
        marketing_consent: !!body.marketingConsent,
        role,
        seniority:         (body.seniority   || '').slice(0, 30) || null,
        industry:          (body.industry    || '').slice(0, 50) || null,
        company_size:      (body.companySize || '').slice(0, 30) || null,
        region:            (body.region      || '').slice(0, 30) || null,
        answers,
        dimension_scores:  dimensionScores,
        total_score:       totalScore,
        archetype,
        ip,
        user_agent:        userAgent,
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('[ai_benchmark/submit] insert error', error)
      return NextResponse.json({ error: 'Storage failed' }, { status: 500 })
    }

    // Auto-upvote each canonical Q2 tool the respondent selected.
    // Cold-start solution for the Tool Wall: every assessment submission
    // moves rankings, so the page is meaningful from N=1 instead of
    // waiting for manual votes to accumulate. Manual ▲▼ votes layer
    // quality signal on top of usage signal.
    // Best-effort; failures don't block the submit.
    void (async () => {
      try {
        const q2 = answers.q2
        if (!Array.isArray(q2)) return
        const seedSession = `auto:${data.id}`  // unique per submission
        const upvotes: { tool_id: string; session_id: string; direction: number; ip: string | null; user_agent: string | null }[] = []
        for (const v of q2) {
          if (typeof v !== 'string') continue
          if (v === 'none' || v.startsWith('other_detail:')) continue
          if (!Q2_CANONICAL_TOOL_IDS.has(v)) continue
          upvotes.push({ tool_id: v, session_id: seedSession, direction: 1, ip, user_agent: userAgent })
        }
        if (upvotes.length === 0) return
        await supabase.from('ai_benchmark_tool_votes').insert(upvotes)
      } catch (e) {
        console.error('[ai_benchmark/submit] auto-upvote', e)
      }
    })()

    // Extract any 'other_detail:<text>' write-ins and upsert into the
    // moderation queue. Best-effort; failures don't block the submit.
    void (async () => {
      try {
        const writeins: { qid: string; raw: string; norm: string }[] = []
        for (const [qid, val] of Object.entries(answers)) {
          if (!Array.isArray(val)) continue
          for (const v of val) {
            if (typeof v !== 'string' || !v.startsWith('other_detail:')) continue
            const raw = v.slice('other_detail:'.length).trim().slice(0, 100)
            if (!raw) continue
            const norm = raw
              .toLowerCase()
              .replace(/\s+/g, ' ')
              .replace(/\s*(pro|plus|premium|free|trial|beta)\s*$/i, '')
              .trim()
            if (norm) writeins.push({ qid, raw, norm })
          }
        }

        for (const w of writeins) {
          const { data: existing } = await supabase
            .from('ai_benchmark_writeins')
            .select('id, count')
            .eq('question_id', w.qid)
            .eq('normalized', w.norm)
            .maybeSingle()

          if (existing) {
            await supabase
              .from('ai_benchmark_writeins')
              .update({ count: (existing.count as number) + 1, last_seen: new Date().toISOString() })
              .eq('id', existing.id)
          } else {
            await supabase
              .from('ai_benchmark_writeins')
              .insert({ question_id: w.qid, raw_text: w.raw, normalized: w.norm })
          }
        }
      } catch (e) {
        console.error('[ai_benchmark/submit] writein upsert', e)
      }
    })()

    return NextResponse.json({
      id:               data.id,
      totalScore,
      archetype,
      dimensionScores,
    })
  } catch (err) {
    console.error('[ai_benchmark/submit]', err)
    return NextResponse.json({ error: 'Submit failed' }, { status: 500 })
  }
}
