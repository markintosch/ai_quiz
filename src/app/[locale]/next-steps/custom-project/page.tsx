export const dynamic = 'force-dynamic'

import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { CustomProjectForm } from '@/components/next-steps/CustomProjectForm'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ r?: string }>
}

export default async function CustomProjectPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { r: responseId } = await searchParams
  setRequestLocale(locale)

  let name = ''
  let email = ''
  let company = ''

  if (responseId) {
    const supabase = createServiceClient()
    const { data: response } = await supabase
      .from('responses')
      .select('respondent_id')
      .eq('id', responseId)
      .maybeSingle() as { data: { respondent_id: string | null } | null }

    if (response?.respondent_id) {
      const { data: respondent } = await supabase
        .from('respondents')
        .select('name, email, company_name')
        .eq('id', response.respondent_id)
        .maybeSingle() as { data: { name: string; email: string; company_name: string | null } | null }

      name = respondent?.name ?? ''
      email = respondent?.email ?? ''
      company = respondent?.company_name ?? ''
    }
  }

  const backHref = responseId ? `/${locale}/next-steps?r=${responseId}` : `/${locale}/next-steps`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand mb-8 transition-colors"
        >
          ← Back to all options
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="mb-6">
            <span className="text-3xl">🔧</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2">
              Tell us about your AI challenge
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Share a few details about your challenge, ambition or implementation question. We&apos;ll review it
              and come back to you with the most relevant next step or expert from our network.
            </p>
          </div>

          <CustomProjectForm
            responseId={responseId}
            initialName={name}
            initialEmail={email}
            initialCompany={company}
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          We review every request personally and respond within 2 business days.
        </p>
      </div>
    </div>
  )
}
