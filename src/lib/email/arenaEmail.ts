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
<body style="margin:0;padding:0;background:#f0f2f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px">${preheader} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f2f4;padding:40px 16px">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px">

      <!-- Header -->
      <tr><td style="background:#354E5E;border-radius:16px 16px 0 0;padding:28px 36px 24px">
        <p style="margin:0 0 6px;color:rgba(255,255,255,0.55);font-size:10px;letter-spacing:2.5px;text-transform:uppercase;font-weight:600">&#9729; Cloud Arena</p>
        <p style="margin:0;color:#ffffff;font-size:24px;font-weight:800;line-height:1.25">${title}</p>
      </td></tr>

      <!-- Body -->
      <tr><td style="background:#ffffff;padding:28px 36px">
        ${bodyHtml}
      </td></tr>

      <!-- CTA -->
      <tr><td style="background:#ffffff;padding:0 36px 32px">
        <a href="${ctaUrl}" style="display:inline-block;background:#E8611A;color:#ffffff;font-weight:700;font-size:15px;padding:14px 30px;border-radius:10px;text-decoration:none;letter-spacing:0.2px">${ctaLabel}</a>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#ffffff;border-radius:0 0 16px 16px;padding:20px 36px 28px;border-top:1px solid #f0f2f4">
        <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.6">
          Join code: <strong style="color:#6b7280;letter-spacing:1.5px">${joinCode}</strong>
          ${footerNote ? ` &middot; ${footerNote}` : ''}
          <br>Cloud Arena &middot; Powered by TrueFullstaq
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`
}
