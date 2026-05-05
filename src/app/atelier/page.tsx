// FILE: src/app/atelier/page.tsx
// ──────────────────────────────────────────────────────────────────────────────
// Atelier — werkpartner landing (redesign).
// Dark/light alternating sections, blue/teal palette, no jargon, no version
// labels, no token pricing. Spec: docs/atelier-redesign-briefing.md.
//
// Nav (AtelierTabs) is rendered by /atelier/layout.tsx and stays light —
// the contrast with the dark hero is intentional.

import Link from 'next/link'

// ── Atelier palette (kept local — not in tailwind.config) ───────────────────
const C = {
  dark:        '#0C1A2E',
  darkMid:     '#0C2844',
  darkAccent:  '#0A3048',
  blue:        '#185FA5',
  blueLight:   '#85B7EB',
  blueBg:      '#E6F1FB',
  teal:        '#0F6E56',
  tealLight:   '#5DCAA5',
  tealBg:      '#E1F5EE',
  offWhite:    '#F5F5F3',
  text:        '#1A1A1A',
  textMuted:   '#6B7280',
  borderSoft:  '#E5E7EB',
}

const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export default function AtelierLandingPage() {
  return (
    <div style={{ background: '#fff', fontFamily: FONT }}>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-2">

        {/* ─── 1. HERO — dark gradient with headline ─────────────────────── */}
        <section style={{
          background: `linear-gradient(145deg, ${C.dark} 0%, ${C.darkMid} 60%, ${C.darkAccent} 100%)`,
          borderRadius: '12px 12px 0 0',
          padding: '3rem 2.5rem 2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative glows */}
          <div aria-hidden style={{
            position: 'absolute', top: -60, right: -60,
            width: 300, height: 300,
            background: `radial-gradient(circle, ${C.blue}33 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />
          <div aria-hidden style={{
            position: 'absolute', bottom: -40, left: '30%',
            width: 200, height: 200,
            background: `radial-gradient(circle, ${C.teal}1f 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.tealLight }} />
              <p style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.tealLight, margin: 0 }}>
                Atelier
              </p>
            </div>

            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 34px)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: '#fff',
              margin: '0 0 1rem',
              maxWidth: 420,
            }}>
              Geef je brief.<br />Krijg richting terug.
            </h1>

            <p style={{
              fontSize: 15, lineHeight: 1.7,
              color: 'rgba(255,255,255,0.55)',
              margin: '0 0 2rem', maxWidth: 400,
            }}>
              Een werkassistent voor merk- en strategieteams. Doelgroepanalyse, referenties, spanningen — en 2–3 verdedigbare richtingen op één A4. Dezelfde middag.
            </p>

            <Link href="/atelier/new" style={{
              display: 'inline-block',
              background: C.blue, color: '#fff',
              padding: '11px 24px', borderRadius: 8,
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
            }}>
              Probeer gratis ›
            </Link>
          </div>
        </section>

        {/* 3px gap between hero and example output (visually attached) */}
        <div style={{ height: 3 }} />

        {/* ─── 2. EXAMPLE OUTPUT — dark continuation ─────────────────────── */}
        <section style={{
          background: `linear-gradient(180deg, ${C.darkMid} 0%, ${C.dark} 100%)`,
          borderRadius: '0 0 12px 12px',
          padding: '0 2.5rem 2.5rem',
        }}>
          <div style={{
            borderTop: '0.5px solid rgba(255,255,255,0.08)',
            paddingTop: '2rem',
          }}>
            <p style={{
              fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)', margin: '0 0 1.5rem',
            }}>
              Voorbeeld output
            </p>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: 8,
              padding: '1.25rem',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12, gap: 10, flexWrap: 'wrap',
              }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                  Brief: herpositionering energieleverancier
                </p>
                <div style={{
                  background: `${C.blue}33`, color: C.blueLight,
                  fontSize: 10, padding: '3px 10px', borderRadius: 20,
                }}>
                  3 richtingen
                </div>
              </div>
              <div style={{
                borderTop: '0.5px solid rgba(255,255,255,0.06)',
                paddingTop: 12,
              }}>
                {[
                  { color: C.blue,      title: 'De anti-energiemerk',         body: 'Jongeren wantrouwen utilities maar kunnen er niet zonder. Maak daar eerlijkheid van.' },
                  { color: C.teal,      title: 'Energie als infrastructuur',  body: 'Bundel in lifestyle-abonnementen. Verdwijn als afzender. Word onzichtbaar goed.' },
                  { color: C.tealLight, title: 'Community-owned energy',      body: 'Coöperatief model. Niet klant maar eigenaar. Engagement via impact-dashboard.' },
                ].map((d, i, arr) => (
                  <div key={d.title} style={{ marginBottom: i === arr.length - 1 ? 0 : 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 3, height: 14, borderRadius: 2, background: d.color }} />
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', margin: 0 }}>{d.title}</p>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '0 0 0 11px', lineHeight: 1.6 }}>
                      {d.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. VISUAL DIAGRAM + TEXT — asymmetric two-column (light) ─── */}
        <section
          className="grid md:grid-cols-2 grid-cols-1"
          style={{ gap: 0, marginTop: '2rem', minHeight: 240 }}
        >
          <div style={{
            background: C.blueBg,
            borderRadius: '12px 12px 0 0',
            padding: '2rem',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }} className="md:!rounded-l-xl md:!rounded-tr-none">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                border: `2px solid ${C.blue}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 11, color: C.blue, fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>
                  Jouw<br />brief
                </span>
              </div>
              <svg width="50" height="16" viewBox="0 0 50 16" aria-hidden>
                <path d="M0 8 H40 M34 3 L42 8 L34 13" fill="none" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{
                width: 80, height: 80, borderRadius: 8, background: C.blue,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>
                  2–3<br />richtingen
                </span>
              </div>
            </div>
            <p style={{ fontSize: 11, color: C.blue, margin: 0, textAlign: 'center', opacity: 0.6 }}>
              In uren, niet dagen
            </p>
          </div>
          <div
            className="md:!rounded-r-xl md:!rounded-bl-none"
            style={{
              padding: '2rem',
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              background: '#fff',
              borderRadius: '0 0 12px 12px',
            }}
          >
            <p style={{ fontSize: 20, fontWeight: 500, color: C.blue, lineHeight: 1.3, margin: '0 0 1rem' }}>
              Eén sessie. Eén A4.
            </p>
            <p style={{ fontSize: 14, color: C.textMuted, margin: 0, lineHeight: 1.7 }}>
              Atelier ontleedt je brief, bouwt een beeld van je doelgroep, zoekt referenties, vindt spanningen — en komt terug met onderbouwde richtingen die je kunt presenteren.
            </p>
            <div style={{ marginTop: '1.5rem' }}>
              <a href="#voorbeeld" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: C.blue, fontSize: 13, fontWeight: 500,
                borderBottom: `1px solid ${C.blueLight}`, paddingBottom: 2,
                textDecoration: 'none',
              }}>
                Bekijk een voorbeeld ›
              </a>
            </div>
          </div>
        </section>

        {/* ─── 4. CAPABILITIES — three-column on light ─────────────────── */}
        <section style={{
          background: C.offWhite,
          borderRadius: 12,
          padding: '2rem 2.5rem',
          marginTop: '2rem',
        }}>
          <p style={{
            fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: C.textMuted, margin: '0 0 1.5rem',
          }}>
            Wat Atelier doet
          </p>
          <div className="grid md:grid-cols-3 grid-cols-1" style={{ gap: 20 }}>
            {[
              { color: C.blue,      title: 'Brief ontleden',  body: 'Wat wordt er echt gevraagd? Welke aannames zitten erin?' },
              { color: C.teal,      title: 'Doelgroep scherp', body: 'Wie zijn ze? Wat drijft ze? Waar zit de spanning?' },
              { color: C.tealLight, title: 'Richting geven',   body: '2–3 onderbouwde richtingen. Met referenties. Op één A4.' },
            ].map(c => (
              <div key={c.title}>
                <div style={{ width: 36, height: 3, background: c.color, borderRadius: 2, marginBottom: 12 }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: C.text, margin: '0 0 6px' }}>{c.title}</p>
                <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 5. SPLIT PANEL — wel / niet ─────────────────────────────── */}
        <section
          className="grid md:grid-cols-2 grid-cols-1"
          style={{ gap: 0, marginTop: '2rem' }}
        >
          <div
            className="md:!rounded-l-xl md:!rounded-tr-none"
            style={{
              background: C.darkMid,
              borderRadius: '12px 12px 0 0',
              padding: '2rem',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 500, color: C.blueLight, margin: '0 0 12px', letterSpacing: '0.04em' }}>
              Wat het wel is
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0 }}>
              Een denk-partner die je brief serieus neemt. Die terugkomt met werk, niet met vragen. Die richting geeft die je kunt verdedigen.
            </p>
          </div>
          <div
            className="md:!rounded-r-xl md:!rounded-bl-none"
            style={{
              background: C.offWhite,
              borderRadius: '0 0 12px 12px',
              padding: '2rem',
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 500, color: C.text, margin: '0 0 12px', letterSpacing: '0.04em' }}>
              Wat het niet is
            </p>
            <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7, margin: 0 }}>
              Geen copywriter. Geen chatbot. Geen strategie-deck van 40 slides. Je krijgt richting — de uitwerking is aan jou.
            </p>
          </div>
        </section>

        {/* ─── 6. AUDIENCE CARDS — 2x2 grid ────────────────────────────── */}
        <section
          className="grid sm:grid-cols-2 grid-cols-1"
          style={{ gap: 12, marginTop: '2rem' }}
        >
          {[
            { tint: C.blueBg, stroke: C.blue, title: 'Merkteams',           body: '1–4 mensen, van brief naar presentatie',
              svg: <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><circle cx="7" cy="5" r="3" fill="none" stroke={C.blue} strokeWidth="1.2" /><path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" fill="none" stroke={C.blue} strokeWidth="1.2" /></svg> },
            { tint: C.tealBg, stroke: C.teal, title: 'Strategiepods',        body: 'Bij bureaus die snel moeten schakelen',
              svg: <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><rect x="2" y="2" width="10" height="10" rx="2" fill="none" stroke={C.teal} strokeWidth="1.2" /><path d="M5 5h4M5 7h3M5 9h5" stroke={C.teal} strokeWidth="0.8" /></svg> },
            { tint: C.blueBg, stroke: C.blue, title: 'Freelance strategen',  body: 'Die geen weken willen wachten op richting',
              svg: <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M7 2v10M2 7h10" stroke={C.blue} strokeWidth="1.2" strokeLinecap="round" /></svg> },
            { tint: C.tealBg, stroke: C.teal, title: 'Kleine creatieve teams', body: 'Die méér willen doen met minder capaciteit',
              svg: <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><circle cx="5" cy="5" r="2.5" fill="none" stroke={C.teal} strokeWidth="1.2" /><circle cx="9" cy="5" r="2.5" fill="none" stroke={C.teal} strokeWidth="1.2" /><path d="M2.5 12c0-2 1.2-3.5 2.5-3.5M8 12c0-2 1.2-3.5 2.5-3.5" fill="none" stroke={C.teal} strokeWidth="0.8" /></svg> },
          ].map(c => (
            <div key={c.title} style={{
              background: '#fff', border: `0.5px solid ${C.borderSoft}`,
              borderRadius: 12, padding: '1.25rem',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: c.tint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                {c.svg}
              </div>
              <p style={{ fontSize: 13, fontWeight: 500, color: C.text, margin: '0 0 4px' }}>{c.title}</p>
              <p style={{ fontSize: 12, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>{c.body}</p>
            </div>
          ))}
        </section>

        {/* ─── 7. FOOTER CTA — dark gradient bar ───────────────────────── */}
        <section
          className="flex md:flex-row flex-col md:items-center items-stretch md:gap-0 gap-4"
          style={{
            background: `linear-gradient(135deg, ${C.darkMid}, ${C.dark})`,
            borderRadius: 12,
            padding: '2rem 2.5rem',
            marginTop: '2rem',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ fontSize: 18, fontWeight: 500, color: '#fff', margin: '0 0 4px' }}>
              Probeer het met je volgende brief
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Eerste sessie gratis. Geen account nodig.
            </p>
          </div>
          <Link href="/atelier/new" style={{
            background: C.blue, color: '#fff',
            padding: '11px 20px', borderRadius: 8,
            fontSize: 14, fontWeight: 500,
            whiteSpace: 'nowrap', textDecoration: 'none',
            alignSelf: 'flex-start',
          }} className="md:!self-auto">
            Start gratis ›
          </Link>
        </section>

      </div>
    </div>
  )
}
