import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

const resend  = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`cx_email:${ip}`, 3, 10 * 60 * 1000)
  if (!rl.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    const { name, email, lang, avg, scoreLabel, dimScores, dimensions } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // ── Store lead in Supabase ───────────────────────────────────────────────
    await supabase.from('cx_essense_leads').insert({
      name:        name || null,
      email:       email.toLowerCase().trim(),
      lang,
      avg_score:   avg,
      score_label: scoreLabel,
      dim_scores:  dimScores,
      created_at:  new Date().toISOString(),
    })
    // Note: ignore insert errors — still send the email even if DB write fails

    // ── Build email HTML ─────────────────────────────────────────────────────
    const greeting = lang === 'nl'
      ? `Hoi${name ? ` ${name}` : ''}` : `Hi${name ? ` ${name}` : ''}`

    const intro = lang === 'nl'
      ? 'Hier zijn je resultaten van het <strong>CX Volwassenheidsassessment</strong> door Essense.'
      : 'Here are your results from the <strong>CX Maturity Assessment</strong> by Essense.'

    const overallLabel = lang === 'nl' ? 'Totaalscore' : 'Overall score'
    const dimHeader    = lang === 'nl' ? 'Dimensiescores' : 'Dimension scores'
    const ctaLabel     = lang === 'nl' ? 'Bespreek je resultaten met Essense' : 'Discuss your results with Essense'
    const ctaCaption   = lang === 'nl'
      ? 'Wil je bespreken wat deze scores betekenen voor jouw organisatie?'
      : 'Want to explore what these scores mean for your organisation?'
    const ctaBtn       = lang === 'nl' ? 'Neem contact op →' : 'Get in touch →'

    const dimRows = (dimensions as { id: string; name: string; icon: string }[])
      .map(d => {
        const score = (dimScores[d.id] ?? 1).toFixed(1)
        const bar   = Math.round(((dimScores[d.id] ?? 1) - 1) / 3 * 100)
        return `
          <tr>
            <td style="padding:8px 0; font-size:13px; color:#374151;">${d.icon} ${d.name}</td>
            <td style="padding:8px 0; text-align:right; font-size:13px; font-weight:700; color:#044524; width:48px;">${score}/4</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:0 0 8px;">
              <div style="height:6px; background:#EAF5F2; border-radius:100px; overflow:hidden;">
                <div style="height:6px; width:${bar}%; background:#24CF7A; border-radius:100px;"></div>
              </div>
            </td>
          </tr>`
      }).join('')

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #EEF2F7;">

        <!-- Header -->
        <tr>
          <td style="background:#044524;padding:32px 40px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:44px;height:44px;background:#24CF7A;border-radius:12px;text-align:center;vertical-align:middle;">
                  <span style="color:#044524;font-size:28px;font-weight:900;line-height:44px;">e</span>
                </td>
                <td style="padding-left:14px;">
                  <p style="margin:0;font-size:16px;font-weight:800;color:#fff;">Essense</p>
                  <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.6);">CX Maturity Assessment</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#1A1A2E;">${greeting},</p>
            <p style="margin:0 0 32px;font-size:15px;color:#374151;line-height:1.7;">${intro}</p>

            <!-- Score badge -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#EAF5F2;border-radius:16px;padding:16px 24px;">
                  <p style="margin:0 0 4px;font-size:12px;color:#94A3B8;">${overallLabel}</p>
                  <p style="margin:0;font-size:28px;font-weight:900;color:#044524;">${avg.toFixed(1)}<span style="font-size:16px;color:#94A3B8;">/4</span> &nbsp;<span style="font-size:20px;color:#24CF7A;">${scoreLabel}</span></p>
                </td>
              </tr>
            </table>

            <!-- Dimension scores -->
            <p style="margin:0 0 16px;font-size:14px;font-weight:800;color:#1A1A2E;">${dimHeader}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              ${dimRows}
            </table>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#F8FAFC;border-radius:16px;overflow:hidden;border:1px solid #EEF2F7;">
              <tr>
                <td style="padding:28px 32px;text-align:center;">
                  <p style="margin:0 0 8px;font-size:16px;font-weight:800;color:#1A1A2E;">${ctaLabel}</p>
                  <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.65;">${ctaCaption}</p>
                  <a href="mailto:hello@essense.eu" style="display:inline-block;background:#24CF7A;color:#044524;font-weight:800;font-size:14px;padding:12px 28px;border-radius:100px;text-decoration:none;">${ctaBtn}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #EEF2F7;">
            <p style="margin:0;font-size:12px;color:#94A3B8;">Essense · Van Diemenstraat 296, Amsterdam · <a href="https://essense.eu" style="color:#24CF7A;">essense.eu</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    // ── Send via Resend ──────────────────────────────────────────────────────
    await resend.emails.send({
      from:    'Essense CX Assessment <noreply@brandpwrdmedia.nl>',
      to:      email,
      subject: lang === 'nl'
        ? `Jouw CX-resultaten — ${scoreLabel}`
        : `Your CX Results — ${scoreLabel}`,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[cx_essense/email]', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
