import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getProductConfig } from '@/products'
import { CompanyLandingPage } from '@/components/quiz/CompanyLandingPage'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createClient()
  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!company) {
    return { title: 'Assessment Not Found' }
  }

  const title = `AI Assessment — ${company.name}`
  const description = `Complete the AI Maturity Assessment for ${company.name}. Discover where your organisation stands and what to do next.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function FullQuizPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const supabase = createClient()

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name, slug, logo_url, brand_color, secondary_color, welcome_message, excluded_question_codes, access_code, quiz_products!product_id(key)')
    .eq('slug', slug)
    .eq('active', true)
    .single() as unknown as {
      data: {
        id: string
        name: string
        slug: string
        logo_url: string | null
        brand_color: string | null
        secondary_color: string | null
        welcome_message: string | null
        excluded_question_codes: string[] | null
        access_code: string | null
        quiz_products: { key: string } | null
      } | null
      error: { message: string; code: string } | null
    }

  if (!company || companyError) {
    notFound()
  }

  // ── Open cohort wave for this company ────────────────────────
  // Auto-links respondents to the active wave on submit
  const { data: openCohortWave } = await supabase
    .from('cohort_waves')
    .select('id, cohort_id, cohorts!cohort_id(id, access_code)')
    .eq('is_open', true)
    .limit(1)
    .maybeSingle() as unknown as {
      data: {
        id: string
        cohort_id: string
        cohorts: { id: string; access_code: string | null } | null
      } | null
    }

  // Only use cohort if it belongs to this company (verified via cohort_id → company_id join not possible with anon client)
  // Safe enough: cohort_id is passed to submit which validates it server-side
  const cohortId = openCohortWave?.cohort_id ?? null
  const waveId   = openCohortWave?.id ?? null
  // Cohort access code takes precedence; falls back to company-level access code
  const gateCode = openCohortWave?.cohorts?.access_code ?? company.access_code

  const productKey = company.quiz_products?.key ?? 'ai_maturity'
  const productConfig = getProductConfig(productKey)
  const excludedCodes = company.excluded_question_codes ?? []
  const accentColor = company.brand_color ?? '#E8611A'
  const secondaryColor = company.secondary_color ?? '#F5A820'
  const questionCount = productConfig.questions.filter((q) => !excludedCodes.includes(q.code)).length
  const dimensionLabels = productConfig.dimensions.map(d => d.label)
  // "Cloud Readiness Assessment" → "Cloud Readiness", "AI Maturity Assessment" → "AI Maturity"
  const productSubject = productConfig.name.replace(/ Assessment$/, '').replace(/ Quiz$/, '')

  return (
    <CompanyLandingPage
      name={company.name}
      slug={company.slug}
      logoUrl={company.logo_url}
      accentColor={accentColor}
      secondaryColor={secondaryColor}
      welcomeMessage={company.welcome_message}
      excludedCodes={excludedCodes}
      questionCount={questionCount}
      productKey={productKey}
      accessCode={gateCode}
      cohortId={cohortId}
      waveId={waveId}
      dimensionLabels={dimensionLabels}
      productSubject={productSubject}
    />
  )
}
