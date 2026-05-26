import { createServiceClient } from '@/lib/supabase/server'
import { DEFAULT_CONTENT, mergeContent, type AILContent } from './content'
import AILeiderschapView from './View'

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

export default async function AILeiderschapPage() {
  const content = await loadContent()
  return <AILeiderschapView c={content} />
}
