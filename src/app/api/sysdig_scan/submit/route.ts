import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { computeResults } from '@/products/sysdig_scan/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

const FROM         = 'Sysdig Assessment <noreply@brandpwrdmedia.nl>'
const NOTIFY_EMAIL = process.env.SYSDIG_NOTIFY_EMAIL ?? 'mark@brandpwrdmedia.nl'
const REPORT_URL   = process.env.NEXT_PUBLIC_SYSDIG_REPORT_URL ?? 'https://sysdig.com/resources/cloud-defense-report-2025/'
const CALENDLY_URL = process.env.NEXT_PUBLIC_SYSDIG_CALENDLY_URL ?? 'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'

// ── Email: results to respondent ─────────────────────────────────────────────
function resultsEmailHtml(name: string, overall: number, tierLabel: string, tierColour: string, dimensionRows: string) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your 555 Readiness Score</title></head>
<body style="margin:0;padding:0;background:#0B0F1A;font-family:Inter,system-ui,sans-serif;color:#C8D6E5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr><td>
      <!-- Header -->
      <div style="background:#161D2E;border:1px solid #1E2D40;border-radius:16px;padding:32px;margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
          <div style="width:32px;height:32px;border-radius:8px;background:#00C58E;display:inline-flex;align-items:center;justify-content:center;">
            <span style="font-size:16px;font-weight:900;color:#0B0F1A;">S</span>
          </div>
          <span style="font-size:18px;font-weight:800;color:#FFFFFF;">Sysdig · 555 Assessment</span>
        </div>
        <h1 style="font-size:22px;font-weight:900;color:#FFFFFF;margin:0 0 8px;letter-spacing:-0.02em;">
          Hi ${name.split(' ')[0]}, your 555 Readiness Score is ready.
        </h1>
        <p style="font-size:14px;color:#8B9EB0;margin:0;">Here is a summary of your cloud threat response readiness.</p>
      </div>

      <!-- Score -->
      <div style="background:#161D2E;border:1px solid #1E2D40;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
        <div style="font-size:72px;font-weight:900;color:${tierColour};line-height:1;margin-bottom:8px;">${overall}</div>
        <div style="font-size:13px;color:#8B9EB0;margin-bottom:4px;">out of 100</div>
        <div style="display:inline-block;font-size:14px;font-weight:700;color:${tierColour};background:${tierColour}18;border:1px solid ${tierColour}40;border-radius:100px;padding:6px 18px;margin-top:8px;">
          ${tierLabel}
        </div>
      </div>

      <!-- Dimensions -->
      <div style="background:#161D2E;border:1px solid #1E2D40;border-radius:16px;padding:32px;margin-bottom:24px;">
        <h2 style="font-size:16px;font-weight:800;color:#FFFFFF;margin:0 0 20px;">Score by dimension</h2>
        ${dimensionRows}
      </div>

      <!-- CTA -->
      <div style="background:#161D2E;border:1px solid #00C58E40;border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;">
        <h2 style="font-size:18px;font-weight:800;color:#FFFFFF;margin:0 0 12px;">Want to close the gap?</h2>
        <p style="font-size:14px;color:#C8D6E5;margin:0 0 24px;line-height:1.7;">
          A Sysdig specialist can walk you through exactly where runtime telemetry addresses your specific gaps.
        </p>
        <a href="${CALENDLY_URL}" style="display:inline-block;background:#00C58E;color:#0B0F1A;font-size:15px;font-weight:800;padding:14px 32px;border-radius:10px;text-decoration:none;">
          Book a Sysdig expert →
        </a>
      </div>

      <!-- Footer -->
      <p style="font-size:11px;color:#4B5563;text-align:center;margin:0;">
        This assessment is based on the Sysdig 555 Benchmark. Powered by Kirk &amp; Blackbeard.
      </p>
    </td></tr>
  </table>
</body></html>`
}

function dimensionRow(label: string, score: number, passes: boolean): string {
  const colour = passes ? '#00C58E' : '#EF4444'
  const pct = Math.round(score)
  return `
  <div style="margin-bottom:16px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
      <span style="font-size:13px;color:#FFFFFF;font-weight:600;">${label}</span>
      <span style="font-size:13px;font-weight:700;color:${colour};">${score} ${passes ? '✓' : '✗'}</span>
    </div>
    <div style="height:6px;background:#1E2D40;border-radius:3px;overflow:hidden;">
      <div style="height:100%;width:${pct}%;background:${colour};border-radius:3px;"></div>
    </div>
  </div>`
}

// ── Email: download report ────────────────────────────────────────────────────
function downloadEmailHtml(name: string) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Your Cloud Defense Report</title></head>
<body style="margin:0;padding:0;background:#0B0F1A;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr><td>
      <div style="background:#161D2E;border:1px solid #1E2D40;border-radius:16px;padding:40px;text-align:center;">
        <div style="font-size:48px;margin-bottom:24px;">📄</div>
        <h1 style="font-size:22px;font-weight:900;color:#FFFFFF;margin:0 0 12px;letter-spacing:-0.02em;">
          Hi ${name.split(' ')[0]}, your report is ready.
        </h1>
        <p style="font-size:15px;color:#C8D6E5;margin:0 0 32px;line-height:1.7;max-width:400px;margin-left:auto;margin-right:auto;">
          The <strong style="color:#FFFFFF;">2025 Cloud Defense Report</strong> from Sysdig covers how cloud attacks are accelerating and how AI is changing both offence and defence.
        </p>
        <a href="${REPORT_URL}" style="display:inline-block;background:#00C58E;color:#0B0F1A;font-size:15px;font-weight:800;padding:14px 36px;border-radius:10px;text-decoration:none;margin-bottom:24px;">
          Download the report →
        </a>
        <p style="font-size:12px;color:#4B5563;margin:0;">Powered by Kirk &amp; Blackbeard</p>
      </div>
    </td></tr>
  </table>
</body></html>`
}

// ── Email: expert booking confirmation ────────────────────────────────────────
function expertEmailHtml(name: string) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Book your Sysdig expert</title></head>
<body style="margin:0;padding:0;background:#0B0F1A;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <tr><td>
      <div style="background:#161D2E;border:1px solid #1E2D40;border-radius:16px;padding:40px;text-align:center;">
        <div style="font-size:48px;margin-bottom:24px;">📅</div>
        <h1 style="font-size:22px;font-weight:900;color:#FFFFFF;margin:0 0 12px;letter-spacing:-0.02em;">
          A Sysdig expert will be in touch.
        </h1>
        <p style="font-size:15px;color:#C8D6E5;margin:0 0 16px;line-height:1.7;max-width:420px;margin-left:auto;margin-right:auto;">
          Hi ${name.split(' ')[0]}, a Sysdig specialist will reach out within one business day to schedule a conversation based on your 555 score.
        </p>
        <p style="font-size:14px;color:#C8D6E5;margin:0 0 32px;">
          Can't wait? Book a slot directly:
        </p>
        <a href="${CALENDLY_URL}" style="display:inline-block;background:#3B82F6;color:#FFFFFF;font-size:15px;font-weight:800;padding:14px 36px;border-radius:10px;text-decoration:none;margin-bottom:24px;">
          Book a time slot →
        </a>
        <p style="font-size:12px;color:#4B5563;margin:0;">Powered by Kirk &amp; Blackbeard</p>
      </div>
    </td></tr>
  </table>
</body></html>`
}

// ── Internal notify email (to Sysdig / Mark) ──────────────────────────────────
function notifyEmailHtml(name: string, email: string, overall: number, tierLabel: string, opts: string[]) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#F9FAFB;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:12px;padding:32px;border:1px solid #E5E7EB;">
    <h2 style="font-size:18px;font-weight:800;margin:0 0 20px;color:#111827;">🔔 New 555 Assessment lead</h2>
    <table width="100%" style="font-size:14px;color:#374151;border-collapse:collapse;">
      <tr><td style="padding:8px 0;font-weight:600;width:120px;">Name</td><td>${name}</td></tr>
      <tr><td style="padding:8px 0;font-weight:600;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding:8px 0;font-weight:600;">Score</td><td><strong>${overall}/100</strong> — ${tierLabel}</td></tr>
      <tr><td style="padding:8px 0;font-weight:600;">Opted in</td><td>${opts.join(', ') || 'Nothing selected'}</td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0;">
    <p style="font-size:12px;color:#9CA3AF;margin:0;">Sysdig 555 Assessment · Kirk &amp; Blackbeard</p>
  </div>
</body></html>`
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, answers, optNewsletter, optExpert, optDownload } = body

    if (!name || !email || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Compute scores
    const results = computeResults(answers)
    const dimScores = Object.fromEntries(results.dimensions.map(d => [d.id, d.score]))

    // Save to Supabase
    const { error: dbError } = await supabase.from('sysdig_scan_leads').insert({
      name,
      email,
      overall_score:    results.overall,
      tier:             results.tier,
      dimension_scores: dimScores,
      answers,
      opt_newsletter:   !!optNewsletter,
      opt_expert:       !!optExpert,
      opt_download:     !!optDownload,
    })

    if (dbError) console.error('DB insert error:', dbError)

    // Build dimension rows for email
    const dimRows = results.dimensions
      .map(d => dimensionRow(d.label, d.score, d.passes555))
      .join('')

    const tier = TIER_META_EMAIL[results.tier]

    // Opted-in labels for notify email
    const optLabels: string[] = []
    if (optDownload)   optLabels.push('Download report')
    if (optExpert)     optLabels.push('Book expert')
    if (optNewsletter) optLabels.push('Newsletter')

    // Fire all emails concurrently (fire-and-forget)
    void Promise.allSettled([
      // 1. Results email — always
      resend.emails.send({
        from:    FROM,
        to:      email,
        subject: `Your 555 Readiness Score: ${results.overall}/100 — ${tier.label}`,
        html:    resultsEmailHtml(name, results.overall, tier.label, tier.colour, dimRows),
      }),

      // 2. Download email — if opted in
      ...(optDownload ? [resend.emails.send({
        from:    FROM,
        to:      email,
        subject: '2025 Cloud Defense Report — your download is ready',
        html:    downloadEmailHtml(name),
      })] : []),

      // 3. Expert booking — if opted in
      ...(optExpert ? [resend.emails.send({
        from:    FROM,
        to:      email,
        subject: 'A Sysdig expert will reach out shortly',
        html:    expertEmailHtml(name),
      })] : []),

      // 4. Internal notify
      resend.emails.send({
        from:    FROM,
        to:      NOTIFY_EMAIL,
        subject: `[Sysdig 555] New lead: ${name} — ${results.overall}/100`,
        html:    notifyEmailHtml(name, email, results.overall, tier.label, optLabels),
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('sysdig_scan submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Local tier meta (avoids importing full data file's type system here)
const TIER_META_EMAIL: Record<string, { label: string; colour: string }> = {
  critical:   { label: 'Flying Blind',         colour: '#EF4444' },
  developing: { label: 'Building Foundations',  colour: '#F59E0B' },
  capable:    { label: 'Operationally Capable', colour: '#3B82F6' },
  advanced:   { label: 'Operationally Mature',  colour: '#00C58E' },
}
