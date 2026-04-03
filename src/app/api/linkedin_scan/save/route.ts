import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rateLimit'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// Fire-and-forget save: stores lead and sends scorecard email
// Supabase table can be added in v2 — for now just log + email via Resend
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`linkedin_save:${ip}`, 3, 10 * 60 * 1000) // 3 per 10 min
  if (!rl.allowed) return NextResponse.json({ ok: false }, { status: 429 })
  try {
    const body = await req.json() as {
      name: string
      email: string
      overall: number
      dimScores: { id: string; name: string; icon: string; score: number }[]
      role: string
      lang: string
    }

    const { name, email, overall, dimScores, lang } = body
    if (!name || !email) return NextResponse.json({ ok: false })

    const safeName = escapeHtml(String(name).slice(0, 100))

    // Send scorecard email via Resend (fire-and-forget)
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      const isNl = lang !== 'en'
      const subject = isNl
        ? `Jouw LinkedIn Recruiter Scorekaart — ${overall}/100`
        : `Your LinkedIn Recruiter Scorecard — ${overall}/100`

      const tierLabel = overall >= 80 ? (isNl ? 'Expert' : 'Expert')
        : overall >= 60 ? (isNl ? 'Gevorderd' : 'Advanced')
        : overall >= 40 ? (isNl ? 'In ontwikkeling' : 'Developing')
        : (isNl ? 'Starter' : 'Starter')

      const scoreRows = dimScores
        .map(d => `<tr><td style="padding:10px 16px;font-size:14px;color:#0D2B20;">${d.icon} ${d.name}</td><td style="padding:10px 16px;font-size:14px;font-weight:800;color:#0F7B55;text-align:right;font-family:monospace;">${d.score}/100</td></tr>`)
        .join('')

      const topGaps = [...dimScores].sort((a, b) => a.score - b.score).slice(0, 3)
      const gapList = topGaps.map((g, i) => `<li style="margin-bottom:8px;font-size:14px;color:#0D2B20;">${i + 1}. ${g.icon} <strong>${g.name}</strong> — ${g.score}/100</li>`).join('')

      const html = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#F2FAF6;font-family:-apple-system,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #D8F0E6;">
    <div style="background:#0F7B55;padding:32px 32px 24px;">
      <p style="font-size:12px;color:rgba(255,255,255,0.6);letter-spacing:0.12em;text-transform:uppercase;margin:0 0 6px;">LinkedIn Recruiter Scan · e-people</p>
      <h1 style="font-size:48px;font-weight:900;color:#fff;margin:0 0 4px;line-height:1;">${overall}</h1>
      <p style="font-size:14px;color:rgba(255,255,255,0.8);margin:0;">${isNl ? 'Niveau' : 'Level'}: <strong style="color:#fff;">${tierLabel}</strong></p>
    </div>
    <div style="padding:28px 32px;">
      <p style="font-size:15px;color:#0D2B20;margin:0 0 20px;">${isNl ? `Hoi ${safeName},` : `Hi ${safeName},`}</p>
      <p style="font-size:14px;color:#4D7A66;line-height:1.7;margin:0 0 24px;">
        ${isNl
          ? 'Hieronder vind je jouw volledige LinkedIn Recruiter Scorekaart. Dit zijn je scores per dimensie en je top-3 aandachtspunten.'
          : 'Below you\'ll find your full LinkedIn Recruiter Scorecard. These are your scores per dimension and your top-3 focus areas.'}
      </p>
      <h2 style="font-size:14px;font-weight:700;color:#0D2B20;margin:0 0 12px;">${isNl ? 'Score per dimensie' : 'Score per dimension'}</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #D8F0E6;border-radius:8px;overflow:hidden;margin-bottom:24px;">
        <tbody>${scoreRows}</tbody>
      </table>
      <h2 style="font-size:14px;font-weight:700;color:#0D2B20;margin:0 0 12px;">🎯 ${isNl ? 'Top-3 aandachtspunten' : 'Top-3 focus areas'}</h2>
      <ul style="padding-left:20px;margin:0 0 28px;">${gapList}</ul>
      <a href="https://ai.brandpwrdmedia.nl/linkedin_scan/assess?lang=${lang}" style="display:inline-block;background:#0F7B55;color:#fff;font-size:14px;font-weight:700;padding:12px 28px;border-radius:100px;text-decoration:none;">
        ${isNl ? 'Opnieuw doen →' : 'Try again →'}
      </a>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #D8F0E6;background:#F2FAF6;">
      <p style="font-size:12px;color:#4D7A66;margin:0;">
        ${isNl ? 'Aangeboden door' : 'Offered by'} <strong>Bas Westland</strong> · e-people · <a href="https://www.baswestland.com" style="color:#0F7B55;">baswestland.com</a>
      </p>
    </div>
  </div>
</body></html>`

      void resend.emails.send({
        from:    'Bas Westland · e-people <results@brandpwrdmedia.com>',
        to:      email,
        subject,
        html,
      })

      // Also notify Bas
      void resend.emails.send({
        from:    'LinkedIn Scan <results@brandpwrdmedia.com>',
        to:      process.env.BAS_NOTIFY_EMAIL ?? 'mark@brandpwrdmedia.nl',
        subject: `[LinkedIn Scan] ${name} — ${overall}/100`,
        html:    `<p>${name} (${email}) completed the LinkedIn Recruiter Scan. Overall: <strong>${overall}/100</strong> (${tierLabel}).</p>`,
      })
    } catch (emailErr) {
      console.error('[linkedin_scan/save] email error:', emailErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[linkedin_scan/save] error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
