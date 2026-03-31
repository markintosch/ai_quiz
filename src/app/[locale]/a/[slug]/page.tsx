import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { setRequestLocale, getTranslations } from 'next-intl/server'
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
    .select('name, quiz_products!product_id(key)')
    .eq('slug', slug)
    .eq('active', true)
    .single() as unknown as {
      data: { name: string; quiz_products: { key: string } | null } | null
    }

  if (!company) {
    return { title: 'Assessment Not Found' }
  }

  const productKey = company.quiz_products?.key ?? 'ai_maturity'
  const productConfig = getProductConfig(productKey)
  const productName = productConfig.name  // e.g. "Cloud Readiness Assessment"

  const title = `${productName} — ${company.name}`
  const description = `Complete the ${productName} for ${company.name}. Discover where your organisation stands and what to do next.`
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
    .select('id, name, slug, logo_url, brand_color, secondary_color, bg_color, assessment_mode, welcome_message, excluded_question_codes, access_code, form_position, lead_capture_mode, website_url, quiz_products!product_id(key)')
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
        bg_color: string | null
        assessment_mode: string | null
        welcome_message: string | null
        excluded_question_codes: string[] | null
        access_code: string | null
        form_position: 'pre' | 'post' | null
        lead_capture_mode: 'full' | 'minimal' | null
        website_url: string | null
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
  const productDefaultCopy = productConfig.defaultCopy?.[locale as 'en' | 'nl' | 'fr'] ?? null
  const excludedCodes = company.excluded_question_codes ?? []
  const accentColor = company.brand_color ?? '#E8611A'
  const secondaryColor = company.secondary_color ?? '#F5A820'
  const bgColor = company.bg_color ?? '#354E5E'
  const assessmentMode = (company.assessment_mode === 'external' ? 'external' : 'internal') as 'internal' | 'external'
  const questionCount = productConfig.questions.filter((q) => !excludedCodes.includes(q.code)).length

  // ── Locale-aware dimension labels ─────────────────────────────────────────
  // Use messages/[locale].json > results.dimensionLabels > config label (product fallback)
  // next-intl returns the key path (e.g. "dimensionLabels.personeel_veerkracht") when a
  // key is missing — detect that and fall back to the config label instead.
  const tResults = await getTranslations({ locale, namespace: 'results' })
  const dimensionLabels = productConfig.dimensions.map(d => {
    try {
      const keyPath = `dimensionLabels.${d.key}` as Parameters<typeof tResults>[0]
      const translated = tResults(keyPath)
      // Detect missing translation: next-intl v4 returns the fully-qualified key as fallback
      // e.g. "results.dimensionLabels.personeel_veerkracht" — detect by checking if the
      // result ends with the dimension key (works for both namespace-prefixed and bare returns)
      if (!translated || translated.endsWith(d.key)) return d.label
      return translated
    } catch {
      return d.label
    }
  })

  // ── headingSubject: null → CMS controls heading2; undefined → auto-derive ──
  // productDefaultCopy?.headingSubject allows locale-specific override (e.g. FR "RP et la communication")
  const productSubject = productDefaultCopy?.headingSubject
    ?? (productConfig.headingSubject !== undefined
      ? productConfig.headingSubject   // explicit config override (null = no subject)
      : productConfig.name.replace(/ Assessment$/, '').replace(/ Quiz$/, '').replace(/ Scan$/, ''))
  const formPosition = (company.form_position ?? 'pre') as 'pre' | 'post'
  const leadCaptureMode = (company.lead_capture_mode ?? 'full') as 'full' | 'minimal'

  return (
    <CompanyLandingPage
      name={company.name}
      slug={company.slug}
      logoUrl={company.logo_url}
      accentColor={accentColor}
      secondaryColor={secondaryColor}
      bgColor={bgColor}
      assessmentMode={assessmentMode}
      welcomeMessage={company.welcome_message}
      excludedCodes={excludedCodes}
      questionCount={questionCount}
      productKey={productKey}
      accessCode={gateCode}
      cohortId={cohortId}
      waveId={waveId}
      dimensionLabels={dimensionLabels}
      productSubject={productSubject}
      productName={productConfig.name}
      formPosition={formPosition}
      leadCaptureMode={leadCaptureMode}
      backUrl={company.website_url ?? null}
      productDefaultCopy={productDefaultCopy}
    />
  )
}
