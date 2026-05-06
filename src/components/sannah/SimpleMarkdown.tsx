// FILE: src/components/sannah/SimpleMarkdown.tsx
// Bare-bones markdown renderer — geen externe dep nodig voor de paar
// formats die Sannah's Over/CV/Contact paginas gebruiken (## headings, lists,
// emphasis, links, paragraphs).
//
// Voor complexer markdown later: vervangen door react-markdown.

import { Fragment } from 'react'

interface Props {
  source: string
  /** Max width of paragraphs (px). Defaults to 640. */
  maxWidth?: number
}

export default function SimpleMarkdown({ source, maxWidth = 640 }: Props) {
  if (!source.trim()) return null
  const blocks = source.split(/\n{2,}/)
  return (
    <div style={{ maxWidth, margin: '0 auto', padding: '0 24px' }}>
      {blocks.map((b, i) => renderBlock(b, i))}
    </div>
  )
}

function renderBlock(raw: string, key: number) {
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Headings ## h2, ### h3
  const h2 = trimmed.match(/^##\s+(.+)$/)
  if (h2) {
    return <h2 key={key} style={{
      fontSize: 18, fontWeight: 600, margin: '40px 0 12px',
      color: '#1a1a1a', letterSpacing: '0.01em',
    }}>{h2[1]}</h2>
  }
  const h3 = trimmed.match(/^###\s+(.+)$/)
  if (h3) {
    return <h3 key={key} style={{
      fontSize: 14, fontWeight: 600, margin: '24px 0 8px',
      color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>{h3[1]}</h3>
  }

  // Lists: lines starting with `- ` or `* `
  if (/^\s*[-*]\s+/m.test(trimmed) && trimmed.split('\n').every(l => /^\s*[-*]\s+/.test(l) || !l.trim())) {
    return (
      <ul key={key} style={{ margin: '0 0 16px 18px', padding: 0, fontSize: 15, lineHeight: 1.7, color: '#1a1a1a' }}>
        {trimmed.split('\n').filter(l => l.trim()).map((line, i) => (
          <li key={i} style={{ marginBottom: 4 }}>{inline(line.replace(/^\s*[-*]\s+/, ''))}</li>
        ))}
      </ul>
    )
  }

  // Default: paragraph
  return (
    <p key={key} style={{
      margin: '0 0 16px',
      fontSize: 15,
      lineHeight: 1.7,
      color: '#1a1a1a',
    }}>
      {inline(trimmed)}
    </p>
  )
}

function inline(s: string): React.ReactNode {
  // Replace markdown links [label](url) — basic, no escaping in label
  const parts: React.ReactNode[] = []
  let lastIdx = 0
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(s)) !== null) {
    if (m.index > lastIdx) parts.push(s.slice(lastIdx, m.index))
    parts.push(
      <a key={`l-${m.index}`} href={m[2]} target="_blank" rel="noopener noreferrer"
         style={{ color: '#1a1a1a', textDecoration: 'underline', textUnderlineOffset: 2 }}>
        {m[1]}
      </a>
    )
    lastIdx = m.index + m[0].length
  }
  if (lastIdx < s.length) parts.push(s.slice(lastIdx))
  return <Fragment>{parts}</Fragment>
}
