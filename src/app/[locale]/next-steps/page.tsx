export const dynamic = 'force-dynamic'

import { setRequestLocale } from 'next-intl/server'
import { createServiceClient } from '@/lib/supabase/server'
import { NextStepsPageClient } from '@/components/next-steps/NextStepsPageClient'
import { recommendService, getServiceDefinitions } from '@/lib/next-steps/recommend'
import type { QuizScore } from '@/types'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ r?: string }>
}

export default async function NextStepsPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { r: responseId } = await searchParams
  setRequestLocale(locale)

  const services = getServiceDefinitions()

  // ── No responseId → fallback (generic, no personalisation) ──────────────────
  if (!responseId) {
    return (
      <NextStepsPageClient
        responseId={null}
        firstName={null}
        score={null}
        maturityLevel={null}
        recommendedKey="intro_session"
        services={services}
        locale={locale}
      />
    )
  }

  const supabase = createServiceClient()

  // ── Fetch response ────────────────────────────────────────────────────────────
  const { data: response } = await supabase
    .from('responses')
    .select('respondent_id, scores, maturity_level')
    .eq('id', responseId)
    .maybeSingle() as {
      data: {
        respondent_id: string | null
        scores: unknown
        maturity_level: string
      } | null
    }

  if (!response) {
    return (
      <NextStepsPageClient
        responseId={responseId}
        firstName={null}
        score={null}
        maturityLevel={null}
        recommendedKey="intro_session"
        services={services}
        locale={locale}
      />
    )
  }

  // ── Fetch respondent ──────────────────────────────────────────────────────────
  const { data: respondent } = response.respondent_id
    ? await supabase
        .from('respondents')
        .select('name, email, job_title, company_name')
        .eq('id', response.respondent_id)
        .maybeSingle() as {
          data: {
            name: string
            email: string
            job_title: string | null
            company_name: string | null
          } | null
        }
    : { data: null }

  const scores = response.scores as unknown as QuizScore
  const score = scores?.overall ?? 0
  const firstName = (respondent?.name ?? '').split(' ')[0] || null
  const jobTitle = respondent?.job_title ?? ''
  const companyName = respondent?.company_name ?? ''

  const recommendedKey = recommendService(jobTitle, score, companyName)

  return (
    <NextStepsPageClient
      responseId={responseId}
      firstName={firstName}
      score={score}
      maturityLevel={response.maturity_level}
      recommendedKey={recommendedKey}
      services={services}
      locale={locale}
    />
  )
}
