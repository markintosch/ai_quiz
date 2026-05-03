// FILE: src/app/[locale]/quiz/continue/page.tsx
// Lite → Full continuation flow.
// Loads the lite response answers + lead info, then renders QuizEngine with
// only the EXTRA (non-lite) questions. On submit, merges lite + extra answers
// and writes a new full response linked to the parent via parent_response_id.

import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getProductKeyFromHost, getProductConfig } from '@/products'
import { QuizEngine } from '@/components/quiz/QuizEngine'
import type { AnswerMap, LeadFormData } from '@/types'

export const dynamic = 'force-dynamic'

type Locale = 'en' | 'nl' | 'fr'

const COPY: Record<Locale, {
  brand: string
  title: (n: number) => string
  sub:   (n: number) => string
  body:  (already: number) => string
}> = {
  en: {
    brand: 'Brand PWRD Media',
    title: (n) => `Complete your assessment — ${n} questions left`,
    sub:   (n) => `${n} extra questions · ~7 minutes · Full score and dimension breakdown`,
    body:  (a) => `You already answered ${a} starter questions. Answer the remaining ones to unlock the full assessment, dimension profile, benchmarks and tailored recommendations.`,
  },
  nl: {
    brand: 'Brand PWRD Media',
    title: (n) => `Maak je assessment compleet — nog ${n} vragen`,
    sub:   (n) => `${n} extra vragen · ~7 minuten · Volledige score en dimensies`,
    body:  (a) => `Je hebt al ${a} vragen beantwoord. Vul de overige vragen in voor je volledige score, dimensieprofiel, benchmarks en op maat gemaakte aanbevelingen.`,
  },
  fr: {
    brand: 'Brand PWRD Media',
    title: (n) => `Complétez votre évaluation — ${n} questions restantes`,
    sub:   (n) => `${n} questions supplémentaires · ~7 minutes · Score complet et détail par dimension`,
    body:  (a) => `Vous avez déjà répondu à ${a} questions. Complétez les questions restantes pour débloquer l'évaluation complète, le profil par dimension, les benchmarks et les recommandations personnalisées.`,
  },
}

interface PageProps {
  searchParams: Promise<{ r?: string }>
}

export default async function ContinueQuizPage({ searchParams }: PageProps) {
  const { r: parentId } = await searchParams
  if (!parentId) {
    // No parent → can't continue; bounce to fresh extended quiz
    const locale = await getLocale()
    redirect(`/${locale}/a/extended`)
  }

  const supabase = createServiceClient()

  // Load parent (must be a lite response)
  const { data: parentResponse } = await supabase
    .from('responses')
    .select('id, quiz_version, answers, respondent_id, product_key')
    .eq('id', parentId)
    .single()

  if (!parentResponse) notFound()

  if (parentResponse.quiz_version !== 'lite') {
    // Already a full assessment — send them to its results page
    const locale = await getLocale()
    redirect(`/${locale}/results/${parentResponse.id}`)
  }

  // Load respondent — pre-fill the post-quiz lead form so they don't retype.
  // Only the columns guaranteed to exist in every deployment (the originally-
  // generated supabase type set), so TypeScript stays happy. gdpr/marketing
  // consent are re-confirmed in the post-quiz lead form anyway.
  const { data: respondent } = parentResponse.respondent_id
    ? await supabase
        .from('respondents')
        .select('name, email, company_name, job_title, industry, company_size')
        .eq('id', parentResponse.respondent_id)
        .single()
    : { data: null }

  const liteAnswers = (parentResponse.answers ?? {}) as AnswerMap

  // Determine product
  const host = (await headers()).get('host') ?? ''
  const productKey = (parentResponse.product_key as string | null) ?? getProductKeyFromHost(host)
  const config = getProductConfig(productKey)
  const allQuestions = config.questions
  const remainingCount = allQuestions.filter(q => !(q.code in liteAnswers)).length

  // Pre-fill lead with what we know from the lite respondent
  const initialLead: Partial<LeadFormData> = respondent ? {
    name:         respondent.name        ?? '',
    email:        respondent.email       ?? '',
    companyName:  respondent.company_name ?? '',
    jobTitle:     respondent.job_title   ?? '',
    industry:     respondent.industry    ?? '',
    companySize:  respondent.company_size ?? '',
  } : {}

  const locale = (await getLocale()) as Locale
  const localeKey: Locale = (locale === 'nl' || locale === 'fr') ? locale : 'en'
  const t = COPY[localeKey]

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-2">
            {t.brand}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {t.title(remainingCount)}
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto mb-2">
            {t.sub(remainingCount)}
          </p>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {t.body(Object.keys(liteAnswers).length)}
          </p>
        </div>
        <QuizEngine
          version="full"
          leadCapture="post"
          questions={allQuestions}
          productKey={productKey}
          initialAnswers={liteAnswers}
          initialLead={initialLead}
          parentResponseId={parentId}
        />
      </div>
    </main>
  )
}
