import SimpleMarkdown from '@/components/sannah/SimpleMarkdown'
import { getPage, pageBody } from '@/lib/sannah/server'

export const dynamic = 'force-dynamic'

export default async function CvEnPage() {
  const page = await getPage('cv')
  const body = pageBody(page, 'en')

  return (
    <section style={{ padding: '64px 0' }}>
      <h1 style={{ textAlign: 'center', fontSize: 28, fontWeight: 500, margin: '0 0 32px', letterSpacing: '-0.01em' }}>CV</h1>
      {body ? <SimpleMarkdown source={body} /> : <p style={{ textAlign: 'center', color: '#bdbdbd', fontSize: 14 }}>Coming soon.</p>}
    </section>
  )
}
