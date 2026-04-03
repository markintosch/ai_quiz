import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const resend   = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`marketing_email:${ip}`, 3, 10 * 60 * 1000)
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    const { name, email, lang, avg, scoreLabel, pillarScores, pillars } = await req.json() as {
      name:         string
      email:        string
      lang:         string
      avg:          number
      scoreLabel:   string
      pillarScores: Record<string, number>
      pillars:      { id: string; name: string; icon: string }[]
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // ── Store lead in Supabase ───────────────────────────────────────────────
    await supabase.from('marketing_scan_leads').insert({
      name:         name || null,
      email:        email.toLowerCase().trim(),
      lang,
      avg_score:    avg,
      score_label:  scoreLabel,
      pillar_scores: pillarScores,
      created_at:   new Date().toISOString(),
    })
    // Note: ignore insert errors — still send the email even if DB write fails

    // ── Copy strings ─────────────────────────────────────────────────────────
    const greeting = lang === 'nl'
      ? `Hoi${name ? ` ${name}` : ''}`
      : (lang === 'de' || lang === 'de-ch')
        ? `Hallo${name ? ` ${name}` : ''}`
        : `Hi${name ? ` ${name}` : ''}`

    const intro = lang === 'nl'
      ? 'Hier zijn je resultaten van de <strong>Marketing Organisatie Scan</strong> door Wouter Blok.'
      : (lang === 'de' || lang === 'de-ch')
        ? 'Hier sind deine Ergebnisse des <strong>Marketing-Organisations-Scans</strong> von Wouter Blok.'
        : 'Here are your results from the <strong>Marketing Organisation Scan</strong> by Wouter Blok.'

    const overallLabel = lang === 'nl' ? 'Totaalscore' : (lang === 'de' || lang === 'de-ch') ? 'Gesamtscore' : 'Overall score'
    const pillarHeader = lang === 'nl' ? 'Pillar Scores' : (lang === 'de' || lang === 'de-ch') ? 'Pillar-Scores' : 'Pillar Scores'
    const ctaLabel     = lang === 'nl' ? 'Bespreek je resultaten met Wouter'
      : (lang === 'de' || lang === 'de-ch') ? 'Besprich deine Ergebnisse mit Wouter'
      : 'Discuss your results with Wouter'
    const ctaCaption   = lang === 'nl' ? 'Wil je bespreken wat deze scores betekenen voor jouw organisatie?'
      : (lang === 'de' || lang === 'de-ch') ? 'Möchtest du besprechen, was diese Scores für deine Organisation bedeuten?'
      : 'Want to explore what these scores mean for your organisation?'
    const ctaBtn       = lang === 'nl' ? 'Neem contact op →'
      : (lang === 'de' || lang === 'de-ch') ? 'Kontakt aufnehmen →'
      : 'Get in touch →'

    const subject = lang === 'nl'
      ? `Jouw Marketing Scan Resultaten — ${scoreLabel}`
      : (lang === 'de' || lang === 'de-ch')
        ? `Deine Marketing-Scan-Ergebnisse — ${scoreLabel}`
        : `Your Marketing Scan Results — ${scoreLabel}`

    // ── Pillar rows ───────────────────────────────────────────────────────────
    const pillarRows = pillars
      .map(p => {
        const score = (pillarScores[p.id] ?? 1).toFixed(1)
        const bar   = Math.round(((pillarScores[p.id] ?? 1) - 1) / 3 * 100)
        return `
          <tr>
            <td style="padding:8px 0; font-size:13px; color:#374151;">${p.icon} ${p.name}</td>
            <td style="padding:8px 0; text-align:right; font-size:13px; font-weight:700; color:#F55200; width:48px;">${score}/4</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:0 0 8px;">
              <div style="height:6px; background:#F3F4F6; border-radius:100px; overflow:hidden;">
                <div style="height:6px; width:${bar}%; background:#F55200; border-radius:100px;"></div>
              </div>
            </td>
          </tr>`
      }).join('')

    // ── Email HTML ────────────────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F9FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FA;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">

        <!-- Header -->
        <tr>
          <td style="background:#F55200;padding:28px 40px;">
            <p style="margin:0;font-size:15px;font-weight:800;color:#fff;letter-spacing:0.12em;text-transform:uppercase;">MARKENZUKUNFT</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">Marketing Organisation Scan</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#111827;">${greeting},</p>
            <p style="margin:0 0 32px;font-size:15px;color:#6B7280;line-height:1.7;">${intro}</p>

            <!-- Score badge -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#FFF3EE;border-radius:10px;padding:16px 24px;">
                  <p style="margin:0 0 4px;font-size:12px;color:#6B7280;">${overallLabel}</p>
                  <p style="margin:0;font-size:28px;font-weight:900;color:#F55200;">${avg.toFixed(1)}<span style="font-size:16px;color:#9CA3AF;">/4</span> &nbsp;<span style="font-size:18px;color:#111827;">${scoreLabel}</span></p>
                </td>
              </tr>
            </table>

            <!-- Pillar scores -->
            <p style="margin:0 0 16px;font-size:14px;font-weight:800;color:#111827;">${pillarHeader}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              ${pillarRows}
            </table>

            <!-- CTA block -->
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#F8F9FA;border-radius:10px;overflow:hidden;border:1px solid #E5E7EB;">
              <tr>
                <td style="padding:28px 32px;text-align:center;">
                  <p style="margin:0 0 8px;font-size:16px;font-weight:800;color:#111827;">${ctaLabel}</p>
                  <p style="margin:0 0 20px;font-size:14px;color:#6B7280;line-height:1.65;">${ctaCaption}</p>
                  <a href="mailto:wouter@markenzukunft.com" style="display:inline-block;background:#F55200;color:#fff;font-weight:800;font-size:14px;padding:12px 28px;border-radius:6px;text-decoration:none;">${ctaBtn}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #E5E7EB;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;">MARKENZUKUNFT · <a href="https://markenzukunft.com" style="color:#F55200;">markenzukunft.com</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    // ── Send via Resend ──────────────────────────────────────────────────────
    await resend.emails.send({
      from:    'Marketing Scan <noreply@brandpwrdmedia.nl>',
      to:      email,
      subject,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[marketing_scan/email]', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
