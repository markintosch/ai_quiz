import { describe, expect, it } from 'vitest'
import { decodeExport, parseMetaExport } from './meta'

function utf16le(text: string): Uint8Array {
  const out = new Uint8Array(2 + text.length * 2)
  out[0] = 0xff; out[1] = 0xfe
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i)
    out[2 + i * 2] = c & 0xff
    out[3 + i * 2] = c >> 8
  }
  return out
}

const SAMPLE = 'sep=,\n"Facebook-bezoeken"\n"Datum","Primary"\n"2026-01-01T01:00:00","22"\n"2026-03-09T00:00:00","14"\n\n'

describe('parseMetaExport', () => {
  it('reads the UTF-16 Business Suite export', () => {
    const r = parseMetaExport(utf16le(SAMPLE), 'instagram')
    expect(r.metric).toBe('visits')
    expect(r.platform).toBe('facebook')
    expect(r.platformFromTitle).toBe(true)
    expect(r.rows).toEqual([
      { platform: 'facebook', metric: 'visits', day: '2026-01-01', value: 22 },
      { platform: 'facebook', metric: 'visits', day: '2026-03-09', value: 14 },
    ])
  })

  it('uses the uploader platform when the title does not name one', () => {
    const r = parseMetaExport(new TextEncoder().encode('sep=,\n"Weergaven"\n"Datum","Primary"\n"2026-01-05T01:00:00","687"\n'), 'instagram')
    expect(r).toMatchObject({ metric: 'views', platform: 'instagram', platformFromTitle: false })
  })

  it('maps link clicks before visits', () => {
    const r = parseMetaExport(utf16le('"Klikken op Facebook-links"\n"Datum","Primary"\n"2026-01-20T01:00:00","11"\n'), 'meta')
    expect(r.metric).toBe('link_clicks')
  })

  it('fails loudly on an unknown title', () => {
    expect(() => parseMetaExport(utf16le('"Iets anders"\n"Datum","Primary"\n'), 'meta')).toThrow(/Unknown metric title/)
  })

  it('decodes plain UTF-8 too', () => {
    expect(decodeExport(new TextEncoder().encode('abc'))).toBe('abc')
  })
})
