import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM  = 'Website Intake <noreply@brandpwrdmedia.nl>'
const MARK  = 'mark@brandpwrdmedia.nl'
const BEN   = 'benvanderburg@gmail.com'

const LABELS: Record<string, string> = {
  q1_goal:           'Primair doel',
  q1_toelichting:    'Toelichting — Primair doel',
  q2_subdoelen:      'Overige doelen',
  q2_toelichting:    'Toelichting — Overige doelen',
  q3_impression:     'Gewenste indruk',
  q4_audience:       'Belangrijkste doelgroep',
  q4_toelichting:    'Toelichting — Doelgroep',
  q5_intent:         'Bezoekersintentie',
  q5_toelichting:    'Toelichting — Bezoekersintentie',
  q6_sections:       'Essentiële secties (1)',
  q6_toelichting:    'Toelichting — Secties (1)',
  q7_sections2:      'Essentiële secties (2)',
  q7_toelichting:    'Toelichting — Secties (2)',
  q8_skating:        'Schaatsverleden prominentie (1-5)',
  q8_toelichting:    'Toelichting — Schaatsverleden',
  q9_vibe:           'Gewenste sfeer',
  q9_toelichting:    'Toelichting — Sfeer',
  q10_colors:        'Kleurstijl',
  q10_toelichting:   'Toelichting — Kleurstijl',
  q11_inspiration:   'Design inspiratie',
  q12_features:      'Functionaliteiten',
  q12_toelichting:   'Toelichting — Functionaliteiten',
  q13_cms:           'Zelf content beheren (1-5)',
  q13_toelichting:   'Toelichting — Content beheer',
  q14_tools:         'Tool integraties',
  q18_partners:      'Bijdragen door partners',
  q18_toelichting:   'Toelichting — Partners',
  q19_huisstijl:     'Vernieuwde huisstijl',
  q19_toelichting:   'Toelichting — Huisstijl',
  q20_crm:           'CRM & website rol',
  q21_seo:           'Thema\'s voor vindbaarheid',
  q22_profiel:       'Leidende projecten & ervaring',
  q23_persoonlijk:   'Persoonlijke verhalen',
  q23_toelichting:   'Toelichting — Persoonlijke verhalen',
  q15_keep:          'Behouden van huidige site',
  q16_change:        'Moet anders',
  q17_extra:         'Overig',
}

const ORDER = [
  'q1_goal','q1_toelichting',
  'q2_subdoelen','q2_toelichting',
  'q3_impression',
  'q4_audience','q4_toelichting',
  'q5_intent','q5_toelichting',
  'q6_sections','q6_toelichting',
  'q7_sections2','q7_toelichting',
  'q8_skating','q8_toelichting',
  'q9_vibe','q9_toelichting',
  'q10_colors','q10_toelichting',
  'q11_inspiration',
  'q12_features','q12_toelichting',
  'q13_cms','q13_toelichting',
  'q14_tools',
  'q18_partners','q18_toelichting',
  'q19_huisstijl','q19_toelichting',
  'q20_crm',
  'q21_seo','q22_profiel',
  'q23_persoonlijk','q23_toelichting',
  'q15_keep','q16_change','q17_extra',
]

function buildTable(data: Record<string, unknown>): string {
  const rows = ORDER
    .filter(key => data[key] !== undefined)
    .map(key => {
      const val = Array.isArray(data[key]) ? (data[key] as string[]).join(', ') : String(data[key])
      return `<tr>
        <td style="padding:8px 12px;font-weight:600;color:#1A3038;width:200px;vertical-align:top;border-bottom:1px solid #E8EEF0;">${LABELS[key] ?? key}</td>
        <td style="padding:8px 12px;color:#4A6068;border-bottom:1px solid #E8EEF0;">${val}</td>
      </tr>`
    })
    .join('')

  return `
    <div style="font-family:Inter,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:#00272E;padding:24px;border-radius:8px 8px 0 0;">
        <h1 style="color:#fff;font-size:20px;margin:0;">Website Intake — Ben van der Burg</h1>
        <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:8px 0 0;">
          Ingevuld op ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #E8EEF0;border-top:none;border-radius:0 0 8px 8px;">
        ${rows}
      </table>
      <p style="font-size:12px;color:#94A3B8;margin-top:16px;text-align:center;">Brand PWRD Media · Vertrouwelijk</p>
    </div>
  `
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`questionnaire:${ip}`, 3, 60 * 60 * 1000) // 3 per hour
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    const data = await req.json() as Record<string, unknown>
    const html = buildTable(data)

    // Email to Ben — his own copy
    await resend.emails.send({
      from: FROM,
      to:   BEN,
      subject: 'Jouw website intake — overzicht van je antwoorden',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:640px;margin:0 auto;">
          <p style="font-size:16px;color:#1A3038;margin-bottom:24px;">
            Hi Ben,<br><br>
            Bedankt voor het invullen van de intake. Hieronder een overzicht van je antwoorden ter referentie.
            We gaan hiermee aan de slag en komen snel terug met een eerste ontwerp.<br><br>
            — Mark
          </p>
        </div>
        ${html}
      `,
    })

    // Email to Mark — notify
    await resend.emails.send({
      from: FROM,
      to:   MARK,
      subject: '🔔 Ben heeft de website intake ingevuld',
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[questionnaire] error:', err)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}
