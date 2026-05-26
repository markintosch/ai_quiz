// FILE: src/lib/email/templates/cycleReminder.ts
// Daily check-in reminder email — multilingual, with day counter,
// progress bar, yesterday recap, and rotating motivation messages.

type Lang = 'nl' | 'en' | 'fr' | 'de'

interface YesterdayScores {
  mood: number   // 0-10
  sleep: number  // 1-10
  stress: number // 1-10
}

interface ReminderData {
  lang: Lang
  dayNumber: number
  totalDays: number
  yesterday: YesterdayScores | null  // null = no entry yesterday
  ctaUrl?: string
  unsubscribeUrl?: string
}

// ── i18n copy ────────────────────────────────────────────────────────────────

const COPY: Record<Lang, {
  subject: string
  greeting: string
  dayOf: (day: number, total: number) => string
  yesterdayLabel: string
  missedMessage: string
  ctaText: string
  timeLabel: string
  footerText: string
  unsubscribeText: string
  moodLabel: string
  sleepLabel: string
  stressLabel: string
}> = {
  nl: {
    subject: 'Hoe was je dag?',
    greeting: 'Hoe voel je je vandaag?',
    dayOf: (d, t) => `Dag ${d} van ${t}`,
    yesterdayLabel: 'Gisteren',
    missedMessage: 'Geen check-in gisteren — niet erg, elke dag is een nieuw begin.',
    ctaText: 'Vandaag invullen',
    timeLabel: '30 seconden',
    footerText: 'Je ontvangt deze email omdat je meedoet aan het 30-dagen Perimenopause Compass experiment.',
    unsubscribeText: 'Niet meer ontvangen',
    moodLabel: 'Stemming',
    sleepLabel: 'Slaap',
    stressLabel: 'Stress',
  },
  en: {
    subject: 'How was your day?',
    greeting: 'How are you feeling today?',
    dayOf: (d, t) => `Day ${d} of ${t}`,
    yesterdayLabel: 'Yesterday',
    missedMessage: 'No check-in yesterday — no worries, every day is a new start.',
    ctaText: 'Log today',
    timeLabel: '30 seconds',
    footerText: 'You receive this email because you joined the 30-day Perimenopause Compass experiment.',
    unsubscribeText: 'Unsubscribe',
    moodLabel: 'Mood',
    sleepLabel: 'Sleep',
    stressLabel: 'Stress',
  },
  fr: {
    subject: 'Comment était ta journée ?',
    greeting: 'Comment te sens-tu aujourd\'hui ?',
    dayOf: (d, t) => `Jour ${d} sur ${t}`,
    yesterdayLabel: 'Hier',
    missedMessage: 'Pas de check-in hier — ce n\'est pas grave, chaque jour est un nouveau départ.',
    ctaText: 'Remplir aujourd\'hui',
    timeLabel: '30 secondes',
    footerText: 'Tu reçois cet email parce que tu participes à l\'expérience de 30 jours Perimenopause Compass.',
    unsubscribeText: 'Se désabonner',
    moodLabel: 'Humeur',
    sleepLabel: 'Sommeil',
    stressLabel: 'Stress',
  },
  de: {
    subject: 'Wie war dein Tag?',
    greeting: 'Wie fühlst du dich heute?',
    dayOf: (d, t) => `Tag ${d} von ${t}`,
    yesterdayLabel: 'Gestern',
    missedMessage: 'Kein Check-in gestern — kein Problem, jeder Tag ist ein neuer Anfang.',
    ctaText: 'Heute eintragen',
    timeLabel: '30 Sekunden',
    footerText: 'Du erhältst diese Email weil du am 30-Tage Perimenopause Compass Experiment teilnimmst.',
    unsubscribeText: 'Abmelden',
    moodLabel: 'Stimmung',
    sleepLabel: 'Schlaf',
    stressLabel: 'Stress',
  },
}

const MOTIVATIONS: Record<Lang, string[]> = {
  nl: [
    'Elke dag dat je logt, bouw je een completer beeld van je lichaam.',
    'Patronen worden zichtbaar na een week. Je bent er bijna.',
    'Er is geen goed of fout antwoord. Alleen jouw ervaring telt.',
    'Kleine veranderingen worden pas zichtbaar als je ze bijhoudt.',
    'Vandaag is weer een puzzelstukje.',
    'Je hoeft niet alles te begrijpen. Alleen te registreren.',
    'Na 30 dagen heb je data die je arts niet heeft.',
    'Consistent bijhouden is belangrijker dan perfect invullen.',
    'Je lichaam vertelt een verhaal. Dit is hoe je het leest.',
    'Halverwege. De patronen worden nu interessant.',
  ],
  en: [
    'Every day you log builds a more complete picture of your body.',
    'Patterns become visible after a week. You\'re almost there.',
    'There are no wrong answers. Only your experience matters.',
    'Small changes only become visible when you track them.',
    'Today is another piece of the puzzle.',
    'You don\'t have to understand everything. Just record it.',
    'After 30 days you\'ll have data your doctor doesn\'t.',
    'Consistent tracking matters more than perfect answers.',
    'Your body is telling a story. This is how you read it.',
    'Halfway there. The patterns are getting interesting now.',
  ],
  fr: [
    'Chaque jour que tu enregistres construit une image plus complète.',
    'Les patterns deviennent visibles après une semaine.',
    'Il n\'y a pas de mauvaise réponse. Seule ton expérience compte.',
    'Les petits changements ne sont visibles que quand on les suit.',
    'Aujourd\'hui est une pièce de plus du puzzle.',
    'Tu n\'as pas besoin de tout comprendre. Juste de noter.',
    'Après 30 jours, tu auras des données que ton médecin n\'a pas.',
    'La régularité compte plus que la perfection.',
    'Ton corps raconte une histoire. Voici comment la lire.',
    'À mi-chemin. Les patterns deviennent intéressants.',
  ],
  de: [
    'Jeder Tag den du festhältst baut ein vollständigeres Bild.',
    'Muster werden nach einer Woche sichtbar. Du bist fast da.',
    'Es gibt keine falschen Antworten. Nur deine Erfahrung zählt.',
    'Kleine Veränderungen werden erst sichtbar wenn man sie verfolgt.',
    'Heute ist ein weiteres Puzzleteil.',
    'Du musst nicht alles verstehen. Nur festhalten.',
    'Nach 30 Tagen hast du Daten die dein Arzt nicht hat.',
    'Regelmäßiges Erfassen ist wichtiger als perfekte Antworten.',
    'Dein Körper erzählt eine Geschichte. So liest du sie.',
    'Halbzeit. Die Muster werden jetzt interessant.',
  ],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function dots(value: number, max: number): string {
  const filled = Math.round((value / max) * 5)
  return '&#9679;'.repeat(filled) + '&#9675;'.repeat(5 - filled)
}

function getMotivation(lang: Lang, dayNumber: number): string {
  const msgs = MOTIVATIONS[lang]
  return msgs[(dayNumber - 1) % msgs.length]
}

// ── Template ─────────────────────────────────────────────────────────────────

export function buildReminderSubject(lang: Lang): string {
  return COPY[lang].subject
}

export function buildReminderHtml(data: ReminderData): string {
  const {
    lang,
    dayNumber,
    totalDays,
    yesterday,
    ctaUrl = 'https://markdekock.com/Cycle/today',
    unsubscribeUrl = '#',
  } = data

  const c = COPY[lang]
  const progressPercent = Math.round((dayNumber / totalDays) * 100)
  const motivation = getMotivation(lang, dayNumber)

  const yesterdayBlock = yesterday
    ? `
      <tr>
        <td style="padding:20px 40px 0 40px">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#faf8f5;border-radius:10px;border:1px solid #f0ebe5">
            <tr>
              <td style="padding:16px 20px">
                <p style="margin:0 0 6px;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;font-size:11px;font-weight:600;color:#a89a8e;letter-spacing:1.5px;text-transform:uppercase">${c.yesterdayLabel}</p>
                <p style="margin:0;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;font-size:14px;color:#4a4540;line-height:1.8;letter-spacing:0.3px">
                  ${c.moodLabel} ${dots(yesterday.mood, 10)} &nbsp;&middot;&nbsp;
                  ${c.sleepLabel} ${dots(yesterday.sleep, 10)} &nbsp;&middot;&nbsp;
                  ${c.stressLabel} ${dots(yesterday.stress, 10)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : `
      <tr>
        <td style="padding:20px 40px 0 40px">
          <p style="margin:0;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;font-size:13px;color:#a89a8e;font-style:italic">${c.missedMessage}</p>
        </td>
      </tr>`

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${c.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f5f2;font-family:-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden">${motivation}</div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f7f5f2">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="max-width:520px;width:100%">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:0 0 8px">
              <div style="font-size:28px;color:#c67a3c;margin-bottom:6px">&#10022;</div>
              <div style="font-family:Georgia,serif;font-size:13px;color:#8b7e74;letter-spacing:2.5px;text-transform:uppercase">Perimenopause Compass</div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;border-radius:16px;overflow:hidden">

                <!-- Gradient strip -->
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg,#d4a574,#c67a3c,#d4a574);font-size:0;line-height:0">&nbsp;</td>
                </tr>

                <!-- Day badge -->
                <tr>
                  <td style="padding:36px 40px 0 40px">
                    <span style="display:inline-block;background-color:#faf6f1;border-radius:20px;padding:6px 16px;font-size:13px;font-weight:600;color:#c67a3c;letter-spacing:0.3px">${c.dayOf(dayNumber, totalDays)}</span>
                  </td>
                </tr>

                <!-- Progress bar -->
                <tr>
                  <td style="padding:16px 40px 0 40px">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="background-color:#f0ebe5;border-radius:4px;height:6px">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="${progressPercent}%" style="min-width:6px">
                            <tr>
                              <td style="background:linear-gradient(90deg,#d4a574,#c67a3c);border-radius:4px;height:6px;font-size:0;line-height:0">&nbsp;</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Greeting -->
                <tr>
                  <td style="padding:28px 40px 0 40px">
                    <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1a202c;line-height:1.3">${c.greeting}</h1>
                  </td>
                </tr>

                <!-- Motivation -->
                <tr>
                  <td style="padding:12px 40px 0 40px">
                    <p style="margin:0;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;font-size:15px;color:#6b6560;line-height:1.6">${motivation}</p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:24px 40px 0 40px">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr><td style="border-top:1px solid #eee8e0;font-size:0;line-height:0">&nbsp;</td></tr>
                    </table>
                  </td>
                </tr>

                <!-- Yesterday recap -->
                ${yesterdayBlock}

                <!-- CTA -->
                <tr>
                  <td style="padding:28px 40px 36px 40px" align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="border-radius:10px;background-color:#c67a3c">
                          <a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:14px 40px;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;letter-spacing:0.3px">${c.ctaText} &rarr;</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:10px 0 0;font-size:12px;color:#b5ada5">&#9201; ${c.timeLabel}</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 20px 0" align="center">
              <p style="margin:0;font-size:12px;color:#a8a09a;line-height:1.6;text-align:center">${c.footerText}<br><a href="${unsubscribeUrl}" style="color:#a8a09a;text-decoration:underline">${c.unsubscribeText}</a></p>
            </td>
          </tr>

          <tr><td style="height:32px;font-size:0;line-height:0">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
