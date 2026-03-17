export const dynamic = 'force-dynamic'

import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { InterestForm } from '@/components/next-steps/InterestForm'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ r?: string }>
}

export default async function AiCodingPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { r: responseId } = await searchParams
  setRequestLocale(locale)

  let name = ''
  let email = ''

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
        .select('name, email')
        .eq('id', response.respondent_id)
        .maybeSingle() as { data: { name: string; email: string } | null }

      name = respondent?.name ?? ''
      email = respondent?.email ?? ''
    }
  }

  const backHref = responseId ? `/${locale}/next-steps?r=${responseId}` : `/${locale}/next-steps`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand mb-8 transition-colors"
        >
          ← Back to all options
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="mb-6">
            <span className="text-3xl">⌨️</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2">
              Interested in hands-on self-coding with AI?
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              This practical training is designed for developers and technical professionals who want to use AI
              directly in their coding workflows. Register your interest to hear more about upcoming sessions and formats.
            </p>
            <p className="text-xs text-gray-400 mt-2 italic">
              This training programme is led by Frank Meeuwsen.
            </p>
          </div>

          <InterestForm
            serviceKey="ai_coding"
            responseId={responseId}
            initialName={name}
            initialEmail={email}
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Free · No commitment · We&apos;ll only contact you about this topic
        </p>
      </div>
    </div>
  )
}
