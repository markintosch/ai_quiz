// Shared branded HTML email template for Cloud Arena emails
// Includes: base wrapper, game-over body, winner body

export interface ArenaEmailOptions {
  title: string
  preheader: string
  bodyHtml: string
  ctaLabel: string
  ctaUrl: string
  joinCode: string
  footerNote?: string
}

// ── Leaderboard entry type ────────────────────────────────────────────────────

export interface LeaderboardEntry {
  display_name: string
  best_score:   number
  rank:         number
}

// ── Game-Over email body ───────────────────────────────────────────────────────
// Sent to every participant with an email when admin ends the game.

export function gameOverBodyHtml({
  playerName,
  playerRank,
  playerScore,
  totalPlayers,
  top3,
  resultsUrl,
}: {
  playerName:   string
  playerRank:   number
  playerScore:  number
  totalPlayers: number
  top3:         LeaderboardEntry[]
  resultsUrl:   string
}): string {
  const medal = ['🥇', '🥈', '🥉']

  const podiumRows = top3.map((e, i) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(0,229,255,0.08)">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="32" style="color:#CBD5E1;font-size:18px;vertical-align:middle">${medal[i] ?? `#${e.rank}`}</td>
            <td style="color:#E2E8F0;font-size:14px;font-weight:700;vertical-align:middle;font-family:monospace;letter-spacing:0.5px">${e.display_name}</td>
            <td align="right" style="color:#00E5FF;font-size:15px;font-weight:800;vertical-align:middle;letter-spacing:1px">${e.best_score.toLocaleString()}</td>
          </tr>
        </table>
      </td>
    </tr>`).join('')

  const isWinner = playerRank === 1
  const rankBadgeColor = playerRank === 1 ? '#F59E0B' : playerRank <= 3 ? '#00E5FF' : '#4B5E74'
  const rankLabel = playerRank === 1 ? '🏆 #1 — WINNER' : `#${playerRank} of ${totalPlayers}`

  return `
    <!-- Game over banner -->
    <div style="background:linear-gradient(135deg,#0a1a2e,#071120);border:1px solid rgba(0,229,255,0.15);border-radius:10px;padding:20px 24px;margin-bottom:24px;text-align:center">
      <p style="margin:0 0 6px;color:#00E5FF;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700">&#9646;&#9646; GAME OVER &#9646;&#9646;</p>
      <p style="margin:0;color:#E2E8F0;font-size:17px;font-weight:700">The battle has concluded.</p>
      <p style="margin:6px 0 0;color:#64748B;font-size:13px">${totalPlayers} player${totalPlayers !== 1 ? 's' : ''} competed &middot; Best score wins</p>
    </div>

    <!-- Player's own result -->
    <div style="background:${isWinner ? 'linear-gradient(135deg,#1a1200,#1f1500)' : '#0a1520'};border:1px solid ${rankBadgeColor}44;border-radius:10px;padding:18px 24px;margin-bottom:24px">
      <p style="margin:0 0 4px;color:#64748B;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600">Your result, ${playerName}</p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="color:${rankBadgeColor};font-size:26px;font-weight:900;letter-spacing:1px;vertical-align:middle">${rankLabel}</td>
          <td align="right" style="vertical-align:middle">
            <p style="margin:0 0 2px;color:#64748B;font-size:10px;text-transform:uppercase;letter-spacing:1.5px">Score</p>
            <p style="margin:0;color:#E2E8F0;font-size:22px;font-weight:900;font-family:monospace">${playerScore.toLocaleString()}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Top 3 podium -->
    <p style="margin:0 0 12px;color:#64748B;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600">&#9654; Final Top ${top3.length}</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      ${podiumRows}
    </table>

    <p style="margin:0;color:#64748B;font-size:13px;line-height:1.6">
      See the complete leaderboard and all scores on the results page.${isWinner ? ' Your host will be in touch about your prize.' : ''}
    </p>
  `
}

// ── Winner email body ──────────────────────────────────────────────────────────
// Sent exclusively to the rank #1 player.

export function winnerBodyHtml({
  winnerName,
  winnerScore,
  totalPlayers,
  top3,
  sessionTitle,
}: {
  winnerName:   string
  winnerScore:  number
  totalPlayers: number
  top3:         LeaderboardEntry[]
  sessionTitle: string
}): string {
  const medal = ['🥇', '🥈', '🥉']

  const podiumRows = top3.map((e, i) => `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid rgba(245,158,11,0.12)">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="32" style="font-size:18px;vertical-align:middle">${medal[i] ?? `#${e.rank}`}</td>
            <td style="color:${i === 0 ? '#F59E0B' : '#CBD5E1'};font-size:14px;font-weight:${i === 0 ? '800' : '600'};vertical-align:middle;font-family:monospace">${e.display_name}</td>
            <td align="right" style="color:${i === 0 ? '#F59E0B' : '#64748B'};font-size:14px;font-weight:800;vertical-align:middle;font-family:monospace">${e.best_score.toLocaleString()}</td>
          </tr>
        </table>
      </td>
    </tr>`).join('')

  return `
    <!-- Trophy banner -->
    <div style="background:linear-gradient(160deg,#1a1000,#2a1900);border:2px solid rgba(245,158,11,0.4);border-radius:12px;padding:28px 24px;margin-bottom:28px;text-align:center">
      <p style="margin:0 0 8px;font-size:42px;line-height:1">🏆</p>
      <p style="margin:0 0 6px;color:#F59E0B;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-weight:800">CHAMPION</p>
      <p style="margin:0 0 4px;color:#FBBF24;font-size:26px;font-weight:900;letter-spacing:1px;font-family:monospace">${winnerName}</p>
      <p style="margin:0;color:#92400E;font-size:13px">${sessionTitle}</p>
    </div>

    <!-- Score stat -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px">
      <tr>
        <td width="48%" style="background:#0a1520;border:1px solid rgba(0,229,255,0.15);border-radius:10px;padding:16px;text-align:center">
          <p style="margin:0 0 4px;color:#4B5E74;font-size:10px;text-transform:uppercase;letter-spacing:2px;font-weight:600">Winning Score</p>
          <p style="margin:0;color:#00E5FF;font-size:28px;font-weight:900;font-family:monospace">${winnerScore.toLocaleString()}</p>
        </td>
        <td width="4%"></td>
        <td width="48%" style="background:#0a1520;border:1px solid rgba(245,158,11,0.15);border-radius:10px;padding:16px;text-align:center">
          <p style="margin:0 0 4px;color:#4B5E74;font-size:10px;text-transform:uppercase;letter-spacing:2px;font-weight:600">Players Beaten</p>
          <p style="margin:0;color:#F59E0B;font-size:28px;font-weight:900;font-family:monospace">${totalPlayers - 1}</p>
        </td>
      </tr>
    </table>

    <!-- Podium -->
    <p style="margin:0 0 12px;color:#64748B;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600">&#9654; Final Podium</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px">
      ${podiumRows}
    </table>

    <p style="margin:0;color:#64748B;font-size:13px;line-height:1.7">
      You topped the leaderboard out of <strong style="color:#CBD5E1">${totalPlayers} players</strong>. Your host will be in touch about your prize. Well played.
    </p>
  `
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
