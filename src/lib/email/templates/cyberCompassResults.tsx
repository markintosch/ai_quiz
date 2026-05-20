// FILE: src/lib/email/templates/cyberCompassResults.tsx
// HCSS Cyber Compass — resultaten samenvatting naar respondent.

import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import type { CompassScore } from '@/lib/cyber-compass/scoring'
import type { CompassAiOutput } from '@/lib/cyber-compass/ai'
import type { Lang } from '@/lib/cyber-compass/i18n'

interface Props {
  firstName:    string | null
  score:        CompassScore
  ai:           CompassAiOutput
  resultsUrl:   string
  calendlyUrl:  string
  lang:         Lang
}

const COPY: Record<Lang, {
  preview:       (o: number, b: string) => string
  greeting:      (n: string | null) => string
  intro:         string
  perDimension:  string
  whatISee:      string
  riskLabel:     string
  quickWinsLabel:string
  specialistLabel:string
  bookCta:       string
  viewOnline:    string
  brand:         string
  evidenceFooter:string
  ownerFooter:   string
}> = {
  nl: {
    preview:       (o, b) => `Je HCSS Cyber Compass — ${o}/100 (${b})`,
    greeting:      (n) => n ? `Hoi ${n.split(' ')[0]},` : 'Hoi,',
    intro:         'Hieronder je nulmeting cyberweerbaarheid. Geen diagnose — wel een eerlijke startfoto. De quick wins kun je deze week zelf oppakken; voor het specialist-onderwerp kun je kiezen om een gesprek met Diederik in te plannen.',
    perDimension:  'Per dimensie',
    whatISee:      'Wat ik zie',
    riskLabel:     'Drie risico-observaties',
    quickWinsLabel:'Twee quick wins voor deze week',
    specialistLabel:'Een specialist-onderwerp',
    bookCta:       'Plan een gesprek met Diederik →',
    viewOnline:    'bekijk je volledige resultaten online',
    brand:         'HCSS Cyber Compass · Hammer Cyber Security Services',
    evidenceFooter:'Quick wins zijn gekozen uit erkende cyber-richtlijnen: NCSC NL · Digital Trust Center · ENISA · CIS Controls · NIS2 · ISO 27001.',
    ownerFooter:   'Je antwoorden zijn opgeslagen door Brand PWRD Media B.V. (data controller). HCSS / Diederik Hammer is inhoudelijk eigenaar van het assessment.',
  },
  en: {
    preview:       (o, b) => `Your HCSS Cyber Compass — ${o}/100 (${b})`,
    greeting:      (n) => n ? `Hi ${n.split(' ')[0]},` : 'Hi,',
    intro:         'Below is your cyber resilience baseline. Not a diagnosis — an honest starting photo. The quick wins you can take this week yourself; for the specialist topic you can choose to book a call with Diederik.',
    perDimension:  'Per dimension',
    whatISee:      'What I see',
    riskLabel:     'Three risk observations',
    quickWinsLabel:'Two quick wins for this week',
    specialistLabel:'One specialist topic',
    bookCta:       'Book a call with Diederik →',
    viewOnline:    'view your full results online',
    brand:         'HCSS Cyber Compass · Hammer Cyber Security Services',
    evidenceFooter:'Quick wins are chosen from recognised cyber guidelines: NCSC NL · Digital Trust Center · ENISA · CIS Controls · NIS2 · ISO 27001.',
    ownerFooter:   'Your answers are stored by Brand PWRD Media B.V. (data controller). HCSS / Diederik Hammer owns the assessment content.',
  },
}

const BAND_TITLE: Record<Lang, Record<string, string>> = {
  nl: { exposed: 'Exposed', aware: 'Aware', maturing: 'Maturing', resilient: 'Resilient' },
  en: { exposed: 'Exposed', aware: 'Aware', maturing: 'Maturing', resilient: 'Resilient' },
}

export function CyberCompassResultsEmail({
  firstName, score, ai, resultsUrl, calendlyUrl, lang,
}: Props) {
  const t = COPY[lang]
  const bandTitle = BAND_TITLE[lang][score.band] ?? score.band
  return (
    <Html>
      <Head />
      <Preview>{t.preview(score.overall, bandTitle)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>HCSS Cyber Compass</Heading>
            <Text style={headerSub}>Hammer Cyber Security Services</Text>
          </Section>

          <Section style={scoreSection}>
            <Text style={greetingStyle}>{t.greeting(firstName)}</Text>
            <Text style={body}>{t.intro}</Text>
            <Section style={scoreBadge}>
              <Text style={scoreNumber}>{score.overall}</Text>
              <Text style={scoreLabel}>{bandTitle}</Text>
            </Section>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>{t.perDimension}</Heading>
            {score.dimensions.map((d) => (
              <Section key={d.dimension} style={dimensionRow}>
                <Text style={dimensionLabel}>{d.label}</Text>
                <Text style={dimensionScore}>{d.score}/100</Text>
              </Section>
            ))}
          </Section>

          <Hr style={divider} />

          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>{t.whatISee}</Heading>
            <Text style={body}>{ai.observation}</Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>{t.riskLabel}</Heading>
            {ai.riskObservations.slice(0, 3).map((r, i) => (
              <Text key={i} style={riskItem}>
                <strong style={{ color: '#E8611A' }}>{i + 1}.</strong>&nbsp; {r}
              </Text>
            ))}
          </Section>

          <Section style={quickWinsSection}>
            <Heading as="h2" style={quickWinsHeading}>{t.quickWinsLabel}</Heading>
            {ai.quickWins.map((qw, i) => (
              <Section key={i} style={qwBlock}>
                <Text style={qwTitle}>
                  <strong>{i + 1}. {qw.title}</strong>
                </Text>
                <Text style={qwText}>{qw.text}</Text>
                <Text style={qwMeta}>
                  ⏱ {qw.effort}  ·  Bron: {qw.source}
                </Text>
              </Section>
            ))}
          </Section>

          <Section style={specialistSection}>
            <Heading as="h2" style={specialistHeading}>{t.specialistLabel}</Heading>
            <Text style={specTopic}>{ai.specialistTopic}</Text>
            <Text style={specReason}>{ai.specialistReason}</Text>
            <Button style={button} href={calendlyUrl}>{t.bookCta}</Button>
          </Section>

          <Hr style={divider} />

          <Section style={ctaSection}>
            <Text style={subText}>
              <a href={resultsUrl} style={link}>{t.viewOnline}</a>.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>{t.brand}</Text>
            <Text style={footerText}>{t.evidenceFooter}</Text>
            <Text style={footerText}>{t.ownerFooter}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = { backgroundColor: '#f6f9fc', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }
const container: React.CSSProperties = { backgroundColor: '#ffffff', margin: '40px auto', padding: 0, borderRadius: '12px', maxWidth: '560px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
const header: React.CSSProperties = { backgroundColor: '#1f3a4a', padding: '24px 32px' }
const logo: React.CSSProperties = { color: '#ffffff', fontSize: '20px', fontWeight: 700, margin: 0 }
const headerSub: React.CSSProperties = { color: '#9CA3AF', fontSize: '12px', margin: '4px 0 0' }
const scoreSection: React.CSSProperties = { padding: '32px 32px 0' }
const greetingStyle: React.CSSProperties = { fontSize: '20px', fontWeight: 700, color: '#1f3a4a', margin: '0 0 12px' }
const section: React.CSSProperties = { padding: '24px 32px' }
const sectionHeading: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px' }
const body: React.CSSProperties = { fontSize: '15px', color: '#374151', lineHeight: 1.6, margin: '0 0 16px' }
const scoreBadge: React.CSSProperties = { textAlign: 'center', backgroundColor: '#1f3a4a', borderRadius: '12px', padding: '24px 16px', margin: '8px 0 16px' }
const scoreNumber: React.CSSProperties = { fontSize: '56px', fontWeight: 900, color: '#E8611A', margin: 0, lineHeight: 1 }
const scoreLabel: React.CSSProperties = { fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: '8px 0 0' }
const dimensionRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }
const dimensionLabel: React.CSSProperties = { fontSize: '14px', color: '#374151', margin: 0 }
const dimensionScore: React.CSSProperties = { fontSize: '14px', fontWeight: 600, color: '#1f3a4a', margin: 0 }
const riskItem: React.CSSProperties = { fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: '0 0 10px' }
const divider: React.CSSProperties = { borderColor: '#E5E7EB', margin: 0 }

const quickWinsSection: React.CSSProperties = { backgroundColor: '#F0FAF4', padding: '20px 32px', borderTop: '1px solid #BFE5CC', borderBottom: '1px solid #BFE5CC' }
const quickWinsHeading: React.CSSProperties = { fontSize: '13px', fontWeight: 700, color: '#0F7A3D', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px' }
const qwBlock: React.CSSProperties = { marginBottom: '14px' }
const qwTitle: React.CSSProperties = { fontSize: '15px', color: '#1F2937', margin: '0 0 4px' }
const qwText:  React.CSSProperties = { fontSize: '13px', color: '#374151', lineHeight: 1.55, margin: '0 0 6px' }
const qwMeta:  React.CSSProperties = { fontSize: '11px', color: '#6B7280', fontStyle: 'italic', margin: 0 }

const specialistSection: React.CSSProperties = { backgroundColor: '#FFF6F1', padding: '24px 32px', borderBottom: '1px solid #FCE0CF', textAlign: 'center' }
const specialistHeading: React.CSSProperties = { fontSize: '13px', fontWeight: 700, color: '#E8611A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }
const specTopic: React.CSSProperties = { fontSize: '16px', fontWeight: 600, color: '#1F2937', margin: '0 0 8px' }
const specReason: React.CSSProperties = { fontSize: '14px', color: '#374151', lineHeight: 1.55, margin: '0 0 16px' }
const button: React.CSSProperties = { backgroundColor: '#E8611A', color: '#FFFFFF', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', textDecoration: 'none', display: 'inline-block' }
const ctaSection: React.CSSProperties = { padding: '20px 32px', textAlign: 'center' }
const subText: React.CSSProperties = { fontSize: '13px', color: '#6B7280', margin: 0 }
const link: React.CSSProperties = { color: '#E8611A', textDecoration: 'underline' }
const footer: React.CSSProperties = { padding: '20px 32px', backgroundColor: '#F9FAFB' }
const footerText: React.CSSProperties = { fontSize: '11px', color: '#9CA3AF', lineHeight: 1.5, margin: '0 0 6px' }
