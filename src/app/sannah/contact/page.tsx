import PageWithSideImages from '@/components/sannah/PageWithSideImages'
import { getPage, pageBody } from '@/lib/sannah/server'

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const page = await getPage('contact')
  const body = pageBody(page, 'nl') || 'info@sannahdezwart.nl'
  const images = page?.images ?? []
  return <PageWithSideImages title="Contact" body={body} images={images} />
}
