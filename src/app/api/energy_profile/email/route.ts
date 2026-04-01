import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend   = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      lang,
      avgScore,
      profileLabel,
      dimScores,
      dimensions,
    } = await req.json() as {
      name:         string
      email:        string
      lang:         string
      avgScore:     number
      profileLabel: string
      dimScores:    Record<string, number>
      dimensions:   { id: string; name: string; icon: string }[]
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // ── Store lead in Supabase ─────────────────────────────────────────────────
    await supabase.from('energy_profile_leads').insert({
      name:          name || null,
      email:         email.toLowerCase().trim(),
      lang,
      avg_score:     avgScore,
      profile_label: profileLabel,
      dim_scores:    dimScores,
      created_at:    new Date().toISOString(),
    })
    // Note: ignore insert errors — still send email even if DB write fails

    // ── Copy strings ───────────────────────────────────────────────────────────
    const isNl = lang === 'nl'

    const greeting     = isNl ? `Hoi${name ? ` ${name}` : ''}` : `Hi${name ? ` ${name}` : ''}`
    const intro        = isNl
      ? 'Hier is jouw <strong>Energy Profile</strong>, aangemaakt via Hire.nl.'
      : 'Here is your <strong>Energy Profile</strong>, created via Hire.nl.'
    const overallLabel = isNl ? 'Gemiddelde score' : 'Average score'
    const dimHeader    = isNl ? 'Jouw 5 dimensies' : 'Your 5 dimensions'
    const ctaLabel     = isNl ? 'Praat erover met Laura' : 'Discuss it with Laura'
    const ctaCaption   = isNl
      ? 'Wil je bespreken wat dit profiel over jou zegt? Laura helpt je graag verder.'
      : 'Want to explore what this profile says about you? Laura is happy to help.'
    const ctaBtn       = isNl ? 'Neem contact op →' : 'Get in touch →'
    const subject      = isNl
      ? `Jouw Energy Profile — ${profileLabel}`
      : `Your Energy Profile — ${profileLabel}`

    // ── Dimension rows ─────────────────────────────────────────────────────────
    const dimRows = dimensions.map(d => {
      const score = (dimScores[d.id] ?? 1).toFixed(1)
      const bar   = Math.round(((dimScores[d.id] ?? 1) - 1) / 3 * 100)
      return `
        <tr>
          <td style="padding:8px 0; font-size:13px; color:#2C2447;">${d.icon} ${d.name}</td>
          <td style="padding:8px 0; text-align:right; font-size:13px; font-weight:700; color:#2C2447; width:48px;">${score}/4</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:0 0 8px;">
            <div style="height:6px; background:#EFECF8; border-radius:100px; overflow:hidden;">
              <div style="height:6px; width:${bar}%; background:#2C2447; border-radius:100px;"></div>
            </div>
          </td>
        </tr>`
    }).join('')

    // ── Email HTML ─────────────────────────────────────────────────────────────
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F8F7FA;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7FA;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #DFDDE3;">

        <!-- Header -->
        <tr>
          <td style="background:#2C2447;padding:28px 40px;">
            <p style="margin:0;font-size:15px;font-weight:800;color:#ffffff;">Energy Profile</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">Hire.nl · Laura Dijcks</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#2C2447;">${greeting},</p>
            <p style="margin:0 0 32px;font-size:15px;color:#696284;line-height:1.7;">${intro}</p>

            <!-- Score badge -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="background:#F8F7FA;border-radius:10px;padding:16px 24px;border:1px solid #DFDDE3;">
                  <p style="margin:0 0 4px;font-size:12px;color:#696284;">${overallLabel}</p>
                  <p style="margin:0;font-size:28px;font-weight:900;color:#2C2447;">${avgScore.toFixed(1)}<span style="font-size:16px;color:#696284;">/4</span> &nbsp;<span style="font-size:18px;color:#2C2447;">${profileLabel}</span></p>
                </td>
              </tr>
            </table>

            <!-- Dimension scores -->
            <p style="margin:0 0 16px;font-size:14px;font-weight:800;color:#2C2447;">${dimHeader}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              ${dimRows}
            </table>

            <!-- CTA block -->
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#F8F7FA;border-radius:10px;overflow:hidden;border:1px solid #DFDDE3;">
              <tr>
                <td style="padding:28px 32px;text-align:center;">
                  <p style="margin:0 0 8px;font-size:16px;font-weight:800;color:#2C2447;">${ctaLabel}</p>
                  <p style="margin:0 0 20px;font-size:14px;color:#696284;line-height:1.65;">${ctaCaption}</p>
                  <a href="mailto:laura@hire.nl" style="display:inline-block;background:#2C2447;color:#ffffff;font-weight:800;font-size:14px;padding:12px 28px;border-radius:100px;text-decoration:none;">${ctaBtn}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #DFDDE3;">
            <p style="margin:0;font-size:12px;color:#696284;">Hire.nl · Laura Dijcks · <a href="mailto:laura@hire.nl" style="color:#696284;">laura@hire.nl</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    // ── Send via Resend ────────────────────────────────────────────────────────
    await resend.emails.send({
      from:    'Energy Profile <noreply@brandpwrdmedia.nl>',
      to:      email,
      subject,
      html,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[energy_profile/email]', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
