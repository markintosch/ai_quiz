import SimpleMarkdown from '@/components/sannah/SimpleMarkdown'
import { getPage, pageBody } from '@/lib/sannah/server'

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const page = await getPage('contact')
  const body = pageBody(page, 'nl')

  return (
    <section style={{ padding: '64px 0' }}>
      <h1 style={{ textAlign: 'center', fontSize: 28, fontWeight: 500, margin: '0 0 32px', letterSpacing: '-0.01em' }}>
        Contact
      </h1>
      {body
        ? <SimpleMarkdown source={body} />
        : (
          <p style={{ textAlign: 'center', color: '#1a1a1a', fontSize: 16 }}>
            <a href="mailto:info@sannahdezwart.nl" style={{ color: '#1a1a1a' }}>info@sannahdezwart.nl</a>
          </p>
        )}
    </section>
  )
}
