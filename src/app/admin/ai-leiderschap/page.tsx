import { createServiceClient } from '@/lib/supabase/server'
import { DEFAULT_CONTENT, mergeContent, type AILContent } from '@/app/ai-leiderschap/content'
import AILEditor from './Editor'

export const dynamic = 'force-dynamic'

const PRODUCT_KEY = 'ai_leiderschap'
const LOCALE = 'nl'

async function loadContent(): Promise<AILContent> {
  try {
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('site_content')
      .select('content')
      .eq('locale', LOCALE)
      .eq('product_key', PRODUCT_KEY)
      .single() as { data: { content: Record<string, unknown> } | null }
    return mergeContent(DEFAULT_CONTENT, data?.content)
  } catch {
    return DEFAULT_CONTENT
  }
}

export default async function AdminAILeiderschapPage() {
  const initial = await loadContent()
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand">AI Leiderschap · pagina-inhoud</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bewerk alle tekst van{' '}
          <a href="/ai-leiderschap" target="_blank" className="text-brand-accent underline">markdekock.com/ai-leiderschap</a>.
          Wijzigingen zijn na opslaan direct live.
        </p>
      </div>
      <AILEditor initial={initial} />
    </div>
  )
}
