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

  return {
    title: `AI Maturity Assessment — ${company.name}`,
    description: `Complete the AI Maturity Assessment for ${company.name}. Understand where you stand and what to do next.`,
  }
}

export default async function FullQuizPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const supabase = createClient()

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, name, slug, logo_url, brand_color, welcome_message, excluded_question_codes, access_code, quiz_products!product_id(key)')
    .eq('slug', slug)
    .eq('active', true)
    .single() as unknown as {
      data: {
        id: string
        name: string
        slug: string
        logo_url: string | null
        brand_color: string | null
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

  const productKey = company.quiz_products?.key ?? 'ai_maturity'
  const productConfig = getProductConfig(productKey)
  const excludedCodes = company.excluded_question_codes ?? []
  const accentColor = company.brand_color ?? '#E8611A'
  const questionCount = productConfig.questions.filter((q) => !excludedCodes.includes(q.code)).length

  return (
    <CompanyLandingPage
      name={company.name}
      slug={company.slug}
      logoUrl={company.logo_url}
      accentColor={accentColor}
      welcomeMessage={company.welcome_message}
      excludedCodes={excludedCodes}
      questionCount={questionCount}
      productKey={productKey}
      accessCode={company.access_code}
    />
  )
}
