import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rateLimit'
import { scoreAssessment, type Answers } from '@/products/ai_benchmark/scoring'
import { type Role } from '@/products/ai_benchmark/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_ROLES: Role[] = ['marketing', 'sales', 'hybrid']

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
