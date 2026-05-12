import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Preview, Section, Text,
} from '@react-email/components'

interface Props {
  confirmUrl:     string
  unsubscribeUrl: string
  locale:         'nl' | 'en' | 'de'
}

const COPY: Record<Props['locale'], {
  preview:        string
  greeting:       string
  intro:          string
  body1:          string
  body2:          string
  cta:            string
  brand:          string
  receivedNote:   string
  noConfirmNote:  string
  unsubLabel:     string
  privacyLabel:   string
  unsubBefore:    string
}> = {
  nl: {
    preview:        'Bevestig je inschrijving voor de blog van Mark de Kock',
    greeting:       'Welkom 👋',
    intro:          'Mark de Kock — Brand PWRD Media',
    body1:          'Je hebt je opgegeven voor updates van markdekock.com/blog. Korte updates en lange essays over AI in marketing & sales — wat werkt, wat ik bouw, wat ik zie veranderen.',
    body2:          'Klik hieronder om je e-mailadres te bevestigen. Daarna voeg ik je toe aan de lijst.',
    cta:            'Bevestig mijn inschrijving →',
    brand:          'Brand PWRD Media · AI strategie & executie',
    receivedNote:   'Je ontvangt deze mail omdat dit e-mailadres is opgegeven op markdekock.com/blog.',
    noConfirmNote:  'Heb je dit niet zelf gedaan? Doe dan niets — zonder bevestiging wordt het adres binnen 7 dagen automatisch verwijderd.',
    unsubLabel:     'Inschrijving annuleren',
    privacyLabel:   'Privacybeleid',
    unsubBefore:    'Liever niet bevestigen? ',
  },
  en: {
    preview:        'Confirm your subscription to Mark de Kock\'s blog',
    greeting:       'Welcome 👋',
    intro:          'Mark de Kock — Brand PWRD Media',
    body1:          'You\'ve signed up for updates from markdekock.com/blog. Short updates and long essays on AI in marketing & sales — what works, what I build, what I see changing.',
    body2:          'Click below to confirm your email address. After that, I\'ll add you to the list.',
    cta:            'Confirm my subscription →',
    brand:          'Brand PWRD Media · AI strategy & execution',
    receivedNote:   'You\'re receiving this email because this address was entered on markdekock.com/blog.',
    noConfirmNote:  'Didn\'t do this yourself? No action needed — without confirmation the address will be removed automatically within 7 days.',
    unsubLabel:     'Cancel subscription',
    privacyLabel:   'Privacy Policy',
    unsubBefore:    'Rather not confirm? ',
  },
  de: {
    preview:        'Bestätige dein Abonnement für den Blog von Mark de Kock',
    greeting:       'Willkommen 👋',
    intro:          'Mark de Kock — Brand PWRD Media',
    body1:          'Du hast dich für Updates von markdekock.com/blog angemeldet. Kurze Updates und längere Essays zu KI in Marketing & Sales — was funktioniert, was ich baue, was sich verändert.',
    body2:          'Klicke unten, um deine E-Mail-Adresse zu bestätigen. Danach füge ich dich zur Liste hinzu.',
    cta:            'Anmeldung bestätigen →',
    brand:          'Brand PWRD Media · KI-Strategie & Umsetzung',
    receivedNote:   'Du erhältst diese Mail, weil diese Adresse auf markdekock.com/blog eingegeben wurde.',
    noConfirmNote:  'Du hast das nicht selbst gemacht? Tu nichts — ohne Bestätigung wird die Adresse innerhalb von 7 Tagen automatisch gelöscht.',
    unsubLabel:     'Anmeldung abbrechen',
    privacyLabel:   'Datenschutz',
    unsubBefore:    'Lieber nicht bestätigen? ',
  },
}

export function BlogConfirmationEmail({ confirmUrl, unsubscribeUrl, locale }: Props) {
  const t = COPY[locale]
  const privacyUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://markdekock.com'}/privacy`

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header — same brand teal as the other templates */}
          <Section style={header}>
            <Heading style={logo}>Brand PWRD Media</Heading>
          </Section>

          {/* Hero — welkom + intro */}
          <Section style={heroSection}>
            <Text style={greeting}>{t.greeting}</Text>
            <Text style={subhead}>{t.intro}</Text>
          </Section>

          {/* Body */}
          <Section style={section}>
            <Text style={body}>{t.body1}</Text>
            <Text style={body}>{t.body2}</Text>
          </Section>

          {/* CTA card — orange accent box, same vibe as scoreBadge in summary */}
          <Section style={ctaSection}>
            <Section style={ctaCard}>
              <Button style={button} href={confirmUrl}>
                {t.cta}
              </Button>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Footer — gray bg, identical to summary template */}
          <Section style={footer}>
            <Text style={footerText}>{t.brand}</Text>
            <Text style={footerText}>{t.receivedNote}</Text>
            <Text style={footerText}>{t.noConfirmNote}</Text>
            <Text style={footerText}>
              {t.unsubBefore}
              <a href={unsubscribeUrl} style={link}>{t.unsubLabel}</a>
              {' · '}
              <a href={privacyUrl} style={link}>{t.privacyLabel}</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ─── Styles — match summary.tsx ───────────────────────────────────────────
const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily:      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin:          '40px auto',
  padding:         0,
  borderRadius:    '12px',
  maxWidth:        '560px',
  overflow:        'hidden',
  boxShadow:       '0 2px 8px rgba(0,0,0,0.08)',
}

const header: React.CSSProperties = {
  backgroundColor: '#354E5E',
  padding:         '24px 32px',
}

const logo: React.CSSProperties = {
  color:           '#ffffff',
  fontSize:        '18px',
  fontWeight:      '700',
  margin:          0,
  letterSpacing:   '-0.01em',
}

const heroSection: React.CSSProperties = {
  padding:         '32px 32px 0',
}

const greeting: React.CSSProperties = {
  fontSize:        '24px',
  fontWeight:      '700',
  color:           '#354E5E',
  margin:          '0 0 4px',
}

const subhead: React.CSSProperties = {
  fontSize:        '13px',
  color:           '#6b7280',
  fontWeight:      '500',
  margin:          0,
  textTransform:   'uppercase',
  letterSpacing:   '0.05em',
}

const section: React.CSSProperties = {
  padding:         '24px 32px 0',
}

const body: React.CSSProperties = {
  fontSize:        '15px',
  color:           '#374151',
  lineHeight:      '1.6',
  margin:          '0 0 16px',
}

const ctaSection: React.CSSProperties = {
  padding:         '8px 32px 32px',
}

const ctaCard: React.CSSProperties = {
  backgroundColor: '#FFF6F1',          // soft orange tint, picks up the accent
  borderRadius:    '12px',
  padding:         '24px',
  textAlign:       'center',
  border:          '1px solid #FCE0CF',
}

const button: React.CSSProperties = {
  backgroundColor: '#E8611A',
  color:           '#ffffff',
  padding:         '14px 28px',
  borderRadius:    '8px',
  fontWeight:      '600',
  fontSize:        '15px',
  textDecoration:  'none',
  display:         'inline-block',
}

const divider: React.CSSProperties = {
  borderColor:     '#e5e7eb',
  margin:          0,
}

const footer: React.CSSProperties = {
  padding:         '20px 32px',
  backgroundColor: '#f9fafb',
}

const footerText: React.CSSProperties = {
  fontSize:        '12px',
  color:           '#9ca3af',
  lineHeight:      '1.5',
  margin:          '0 0 6px',
}

const link: React.CSSProperties = {
  color:           '#E8611A',
  textDecoration:  'underline',
}
