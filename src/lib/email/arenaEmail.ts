// Shared branded HTML email template for Cloud Arena emails

export interface ArenaEmailOptions {
  title: string
  preheader: string
  bodyHtml: string
  ctaLabel: string
  ctaUrl: string
  joinCode: string
  footerNote?: string
}

export function arenaEmailHtml({
  title, preheader, bodyHtml, ctaLabel, ctaUrl, joinCode, footerNote,
}: ArenaEmailOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#050A14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px">${preheader} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050A14;padding:40px 16px">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px">

      <!-- Header: deep space with Mars-toned gradient -->
      <tr><td style="background:linear-gradient(160deg,#07121F 0%,#0D1E30 60%,#152130 100%);border-radius:12px 12px 0 0;padding:28px 36px 24px;border-bottom:2px solid rgba(0,229,255,0.2)">
        <p style="margin:0 0 8px;color:#00E5FF;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;text-shadow:0 0 8px rgba(0,229,255,0.6)">&#9729; CLOUD ARENA</p>
        <p style="margin:0;color:#ffffff;font-size:22px;font-weight:800;line-height:1.3;letter-spacing:0.3px">${title}</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:#0D1724;padding:28px 36px;color:#CBD5E1;font-size:15px;line-height:1.65">
        ${bodyHtml}
      </td></tr>

      <!-- CTA -->
      <tr><td style="background:#0D1724;padding:0 36px 32px">
        <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#C1440E 0%,#FF6B1A 100%);color:#ffffff;font-weight:800;font-size:14px;padding:14px 32px;text-decoration:none;letter-spacing:1.5px;text-transform:uppercase">${ctaLabel}</a>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#07111C;border-radius:0 0 12px 12px;padding:20px 36px 24px;border-top:1px solid rgba(0,229,255,0.1)">
        <p style="margin:0;color:#4B5E74;font-size:11px;line-height:1.7">
          Join code: <strong style="color:#00E5FF;letter-spacing:2px">${joinCode}</strong>
          ${footerNote ? ` &middot; <span style="color:#6B8199">${footerNote}</span>` : ''}
          <br>Cloud Arena &middot; Powered by TrueFullstaq
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`
}
