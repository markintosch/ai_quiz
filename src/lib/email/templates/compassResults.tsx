// FILE: src/lib/email/templates/compassResults.tsx
// Resend email template — Perimenopause Compass resultaten samenvatting.

import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import type { CompassScore } from '@/lib/peri-compass/scoring'
import type { CompassAiOutput } from '@/lib/peri-compass/ai'
import { BAND_COPY } from '@/lib/peri-compass/scoring'

interface Props {
  firstName:     string | null
  score:         CompassScore
  ai:            CompassAiOutput
  resultsUrl:    string
  cycleLoginUrl: string
}

export function CompassResultsEmail({
  firstName, score, ai, resultsUrl, cycleLoginUrl,
}: Props) {
  const greeting = firstName ? `Hoi ${firstName.split(' ')[0]},` : 'Hoi,'
  const bandCopy = BAND_COPY[score.band]
  return (
    <Html>
      <Head />
      <Preview>{`Je Perimenopause Compass — ${score.overall}/100 (${bandCopy.title})`}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Perimenopause Compass</Heading>
            <Text style={headerSub}>Brand PWRD Media · Mark de Kock</Text>
          </Section>

          {/* Score badge */}
          <Section style={scoreSection}>
            <Text style={greetingStyle}>{greeting}</Text>
            <Text style={body}>
              Hieronder je nulmeting. Wat je hier ziet is geen diagnose — het is je vertrekpunt.
              Met daily check-ins kunnen we hierop bouwen en patronen zichtbaar maken.
            </Text>
            <Section style={scoreBadge}>
              <Text style={scoreNumber}>{score.overall}</Text>
              <Text style={scoreLabel}>{bandCopy.title}</Text>
              <Text style={scoreSub}>{bandCopy.sub}</Text>
            </Section>
          </Section>

          {/* Dimensies */}
          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>Per dimensie</Heading>
            {score.dimensions.map((d) => (
              <Section key={d.dimension} style={dimensionRow}>
                <Text style={dimensionLabel}>{d.label}</Text>
                <Text style={dimensionScore}>{d.score}/100</Text>
              </Section>
            ))}
          </Section>

          <Hr style={divider} />

          {/* AI observatie */}
          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>Wat ik zie</Heading>
            <Text style={body}>{ai.observation}</Text>
          </Section>

          {/* Hypotheses */}
          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>Drie hypothesen</Heading>
            {ai.hypotheses.slice(0, 3).map((h, i) => (
              <Text key={i} style={hypothesisItem}>
                <strong style={{ color: '#E8611A' }}>{i + 1}.</strong>&nbsp; {h}
              </Text>
            ))}
            <Text style={disclaimer}>
              Hypothesen — geen diagnose. Voor medische vragen: huisarts of menopauze-arts.
            </Text>
          </Section>

          {/* Micro-experiment */}
          <Section style={experimentSection}>
            <Heading as="h2" style={experimentHeading}>Eerste experiment (30 dagen)</Heading>
            <Text style={experimentBody}>{ai.microExperiment}</Text>
          </Section>

          <Hr style={divider} />

          {/* CTA — start tracken */}
          <Section style={ctaSection}>
            <Text style={body}>
              Klaar om je patronen zichtbaar te maken? Maak een account aan en start je eerste daily check-in.
            </Text>
            <Button style={button} href={cycleLoginUrl}>
              Start dagelijkse tracking →
            </Button>
            <Text style={subText}>
              Of <a href={resultsUrl} style={link}>bekijk je volledige resultaten online</a>.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Brand PWRD Media · Perimenopause Compass — een persoonlijke nulmeting
            </Text>
            <Text style={footerText}>
              Vragen? Antwoord gewoon op deze mail — komt direct bij Mark binnen.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────
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
  padding:         '28px 32px',
}
const logo: React.CSSProperties = {
  color:           '#ffffff',
  fontSize:        '20px',
  fontWeight:      700,
  margin:          0,
  letterSpacing:   '-0.01em',
}
const headerSub: React.CSSProperties = {
  color:           '#9CA3AF',
  fontSize:        '13px',
  margin:          '4px 0 0',
}
const scoreSection: React.CSSProperties = { padding: '32px 32px 0' }
const greetingStyle: React.CSSProperties = {
  fontSize: '20px', fontWeight: 700, color: '#354E5E', margin: '0 0 12px',
}
const section: React.CSSProperties = { padding: '24px 32px' }
const sectionHeading: React.CSSProperties = {
  fontSize: '13px', fontWeight: 600, color: '#6B7280',
  textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px',
}
const body: React.CSSProperties = {
  fontSize: '15px', color: '#374151', lineHeight: 1.6, margin: '0 0 16px',
}
const scoreBadge: React.CSSProperties = {
  textAlign: 'center', backgroundColor: '#354E5E', borderRadius: '12px',
  padding: '24px 16px', margin: '8px 0 16px',
}
const scoreNumber: React.CSSProperties = {
  fontSize: '56px', fontWeight: 900, color: '#E8611A', margin: 0, lineHeight: 1,
}
const scoreLabel: React.CSSProperties = {
  fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: '8px 0 4px',
}
const scoreSub: React.CSSProperties = {
  fontSize: '13px', color: '#D1D5DB', margin: 0, padding: '0 8px', lineHeight: 1.5,
}
const dimensionRow: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between',
  padding: '10px 0', borderBottom: '1px solid #F3F4F6',
}
const dimensionLabel: React.CSSProperties = { fontSize: '14px', color: '#374151', margin: 0 }
const dimensionScore: React.CSSProperties = {
  fontSize: '14px', fontWeight: 600, color: '#354E5E', margin: 0,
}
const hypothesisItem: React.CSSProperties = {
  fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: '0 0 10px',
}
const disclaimer: React.CSSProperties = {
  fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic',
  margin: '14px 0 0', borderTop: '1px solid #F3F4F6', paddingTop: '10px',
}
const experimentSection: React.CSSProperties = {
  backgroundColor: '#FFF6F1', padding: '20px 32px', borderTop: '1px solid #FCE0CF', borderBottom: '1px solid #FCE0CF',
}
const experimentHeading: React.CSSProperties = {
  fontSize: '13px', fontWeight: 700, color: '#E8611A',
  textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px',
}
const experimentBody: React.CSSProperties = {
  fontSize: '15px', color: '#1F2937', lineHeight: 1.6, margin: 0,
}
const divider: React.CSSProperties = { borderColor: '#E5E7EB', margin: 0 }
const ctaSection: React.CSSProperties = { padding: '24px 32px', textAlign: 'center' }
const button: React.CSSProperties = {
  backgroundColor: '#E8611A', color: '#FFFFFF', padding: '14px 28px',
  borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none',
  display: 'inline-block',
}
const subText: React.CSSProperties = {
  fontSize: '13px', color: '#6B7280', margin: '14px 0 0',
}
const link: React.CSSProperties = { color: '#E8611A', textDecoration: 'underline' }
const footer: React.CSSProperties = {
  padding: '20px 32px', backgroundColor: '#F9FAFB',
}
const footerText: React.CSSProperties = {
  fontSize: '12px', color: '#9CA3AF', lineHeight: 1.5, margin: '0 0 6px',
}
