import { describe, expect, it } from 'vitest'
import { decodeExport, metricFor, metricLabel, parseMetaExport } from './meta'

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

const one = (title: string, rows = '"2026-01-05T01:00:00","7"') => utf16le(`sep=,\n"${title}"\n"Datum","Primary"\n${rows}\n\n`)

describe('parseMetaExport', () => {
  it('reads the UTF-16 Business Suite export', () => {
    const r = parseMetaExport(one('Facebook-bezoeken', '"2026-01-01T01:00:00","22"\n"2026-03-09T00:00:00","14"'), 'instagram')
    expect(r.sections[0]).toMatchObject({ metric: 'visits', known: true, platforms: ['facebook'], platformFromFile: true })
    expect(r.rows).toEqual([
      { platform: 'facebook', metric: 'visits', day: '2026-01-01', value: 22 },
      { platform: 'facebook', metric: 'visits', day: '2026-03-09', value: 14 },
    ])
  })

  it('uses the uploader platform when the title does not name one', () => {
    const r = parseMetaExport(new TextEncoder().encode('sep=,\n"Weergaven"\n"Datum","Primary"\n"2026-01-05T01:00:00","687"\n'), 'instagram')
    expect(r.sections[0]).toMatchObject({ metric: 'views', platforms: ['instagram'], platformFromFile: false })
  })

  it('maps every title in the current five-file export', () => {
    expect(['Weergaven', 'Interacties met content', 'Facebook-bezoeken', 'Klikken op Facebook-links', 'Facebook-volgers', 'Kijkers']
      .map(t => metricFor(t).metric)).toEqual(['views', 'interactions', 'visits', 'link_clicks', 'follows', 'reach'])
  })

  it('maps the other Business Suite titles, Dutch and English', () => {
    const cases: Array<[string, string]> = [
      ['Bereik', 'reach'], ['Viewers', 'reach'], ['Reach', 'reach'],
      ['Instagram-profielbezoeken', 'visits'], ['Klikken op Instagram-links', 'link_clicks'],
      ['Instagram-volgers', 'follows'], ['Ontvolgingen', 'unfollows'], ['Totaal aantal volgers', 'followers_total'],
      ['Vind-ik-leuks', 'likes'], ['Opmerkingen', 'comments'], ['Gedeeld', 'shares'], ['Opgeslagen', 'saves'],
      ['Weergaven van reels', 'reel_views'], ['Videoweergaven van 3 seconden', 'video_views'],
      ['Minuten bekeken', 'watch_minutes'], ['Profielactiviteit', 'profile_activity'], ['Impressies', 'impressions'],
      ['Content interactions', 'interactions'], ['Link clicks', 'link_clicks'], ['Views', 'views'],
    ]
    for (const [title, metric] of cases) expect([title, metricFor(title).metric]).toEqual([title, metric])
  })

  it('stores an unfamiliar title under its own name instead of failing', () => {
    const r = parseMetaExport(one('Gemiddelde kijkduur per reel?') /* matches reel */, 'meta')
    expect(r.sections[0].known).toBe(true)
    const u = parseMetaExport(one('Iets heel anders'), 'meta')
    expect(u.sections[0]).toMatchObject({ metric: 'other:iets_heel_anders', known: false })
    expect(metricLabel('other:iets_heel_anders')).toBe('Iets heel anders')
  })

  it('reads several metrics in one file and per-platform value columns', () => {
    const text = [
      'sep=,', '"Weergaven"', '"Datum","Facebook","Instagram"',
      '"2026-01-05T01:00:00","100","250"', '',
      '"Kijkers"', '"Datum","Primary"', '"2026-01-05T01:00:00","40"', '',
    ].join('\n')
    const r = parseMetaExport(utf16le(text), 'instagram')
    expect(r.sections.map(s => s.metric)).toEqual(['views', 'reach'])
    expect(r.rows).toEqual([
      { platform: 'facebook', metric: 'views', day: '2026-01-05', value: 100 },
      { platform: 'instagram', metric: 'views', day: '2026-01-05', value: 250 },
      { platform: 'instagram', metric: 'reach', day: '2026-01-05', value: 40 },
    ])
  })

  it('fails loudly only when there is no daily data at all', () => {
    expect(() => parseMetaExport(utf16le('"Weergaven"\n"Datum","Primary"\n'), 'meta')).toThrow(/No metric with daily rows/)
  })

  it('decodes plain UTF-8 too', () => {
    expect(decodeExport(new TextEncoder().encode('abc'))).toBe('abc')
  })
})
