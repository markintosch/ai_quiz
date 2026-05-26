// FILE: src/app/Cycle/bridge/compass/route.ts
// Bridge from Peri-Compass results → Cycle Companion daily check-in.
//
// Flow when an authenticated Cycle user hits this URL with ?assessment_id=X:
//   1. Fetch the compass assessment (validate email matches the auth user)
//   2. Ensure a cycle_profile exists (create with sensible defaults if not)
//   3. If the compass produced a micro_experiment, create a cycle_experiments
//      row (replacing any existing active one)
//   4. Stash the recommended-tracking symptoms in a short-lived cookie so the
//      check-in stepper can pre-select them on next render
//   5. Redirect to /Cycle/today?compass=1 (the trigger for pre-selection)

import { NextResponse } from 'next/server'
import { requireCycleUser } from '@/lib/cycle/auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const user = await requireCycleUser()
  if (!user) {
    // Not logged in — bounce to password gate, preserve the bridge URL as next
    const dest = new URL('/Cycle/login', req.url)
    dest.searchParams.set('next', new URL(req.url).pathname + new URL(req.url).search)
    return NextResponse.redirect(dest)
  }

  const url = new URL(req.url)
  const assessmentId = url.searchParams.get('assessment_id')
  if (!assessmentId) {
    return NextResponse.redirect(new URL('/Cycle/today', req.url))
  }

  // Compass tables live on a different surface — use service client to bypass
  // RLS in a controlled way for this one cross-table read. Cast because the
  // perimenopause_compass_assessments table isn't in the Cycle Database type.
  const sc = createServiceClient()
  interface AssessmentRow {
    id: string
    email: string | null
    ai_micro_experiment: string | null
    ai_micro_experiment_code: string | null
    ai_micro_experiment_source: string | null
    ai_micro_experiment_source_url: string | null
    ai_recommended_tracking: { symptoms?: string[]; fields?: string[] } | null
    language: string
  }
  const { data: assessment } = await (sc as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (col: string, val: string) => {
          maybeSingle: () => Promise<{ data: AssessmentRow | null }>
        }
      }
    }
  })
    .from('perimenopause_compass_assessments')
    .select('id, email, ai_micro_experiment, ai_micro_experiment_code, ai_micro_experiment_source, ai_micro_experiment_source_url, ai_recommended_tracking, language')
    .eq('id', assessmentId)
    .maybeSingle()

  if (!assessment) {
    return NextResponse.redirect(new URL('/Cycle/today', req.url))
  }

  // Soft email match — only proceed if assessment belongs to the auth user.
  // If anonymous (no email), allow (user is taking ownership by clicking through).
  if (assessment.email && assessment.email.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.redirect(new URL('/Cycle/today', req.url))
  }

  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  // 1. Ensure cycle_profile exists
  const { data: existingProfile } = await supabase
    .from('cycle_profiles')
    .select('user_id, onboarded_at')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!existingProfile) {
    await supabase.from('cycle_profiles').insert({
      user_id:           user.id,
      last_period_start: today,                  // approximate; she can edit in settings
      typical_length:    28,
      timezone:          'Europe/Amsterdam',
      reminder_time:     '20:00',
      onboarded_at:      new Date().toISOString(),
    })
  } else if (!existingProfile.onboarded_at) {
    await supabase.from('cycle_profiles')
      .update({ onboarded_at: new Date().toISOString() })
      .eq('user_id', user.id)
  }

  // 2. Create experiment from compass (if compass produced one)
  if (assessment.ai_micro_experiment && assessment.ai_micro_experiment_code) {
    // Replace any existing active experiment (partial unique index would
    // otherwise block the insert)
    await supabase
      .from('cycle_experiments')
      .update({ status: 'replaced', ended_at: today })
      .eq('user_id', user.id)
      .eq('status', 'active')

    await supabase.from('cycle_experiments').insert({
      user_id:               user.id,
      source_assessment_id:  assessment.id,
      code:                  assessment.ai_micro_experiment_code,
      description:           assessment.ai_micro_experiment,
      source:                assessment.ai_micro_experiment_source,
      source_url:            assessment.ai_micro_experiment_source_url,
      metric_to_watch:       'sleep',            // default; compass could later specify
      started_at:            today,
      duration_days:         30,
      status:                'active',
    })
  }

  // 3. Cookie-stash the recommended tracking symptoms so the stepper can
  //    pre-select them on first render. Short-lived (10 min) — disposable.
  const tracking = assessment.ai_recommended_tracking as { symptoms?: string[] } | null
  const symptoms = Array.isArray(tracking?.symptoms) ? tracking!.symptoms.slice(0, 8) : []

  const dest = new URL('/Cycle/today?compass=1', req.url)
  const response = NextResponse.redirect(dest)
  if (symptoms.length > 0) {
    response.cookies.set('cycle_compass_symptoms', JSON.stringify(symptoms), {
      httpOnly: false,            // stepper reads via document.cookie
      sameSite: 'strict',
      secure:   true,
      maxAge:   600,
      path:     '/Cycle',
    })
  }
  return response
}
