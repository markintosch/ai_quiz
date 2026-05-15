// FILE: src/lib/email/templates/cyberCompassNotify.tsx
// Notify Diederik bij elke nieuwe Cyber Compass lead.

import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import type { CompassScore } from '@/lib/cyber-compass/scoring'

interface Props {
  respondentName:  string
  respondentEmail: string
  organisation:    string
  orgSize:         string
  sector:          string | null
  score:           CompassScore
  topConcern:      string | null
  adminUrl:        string
  resultsUrl:      string
}

export function CyberCompassNotifyEmail({
  respondentName, respondentEmail, organisation, orgSize, sector,
  score, topConcern, adminUrl, resultsUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>{`Nieuwe Cyber Compass lead: ${organisation} — ${score.overall}/100 (${score.band})`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>HCSS Cyber Compass — lead</Heading>
            <Text style={headerSub}>Brand PWRD Media · automatische notificatie</Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={h2}>Nieuwe assessment ingevuld</Heading>
            <Text style={meta}><strong>Score:</strong> {score.overall}/100 ({score.band})</Text>
            <Text style={meta}><strong>Organisatie:</strong> {organisation} ({orgSize}{sector ? ` · ${sector}` : ''})</Text>
            <Text style={meta}><strong>Naam:</strong> {respondentName}</Text>
            <Text style={meta}><strong>E-mail:</strong> <a href={`mailto:${respondentEmail}`} style={link}>{respondentEmail}</a></Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={h2}>Per dimensie</Heading>
            {score.dimensions.map((d) => (
              <Section key={d.dimension} style={dimensionRow}>
                <Text style={dimensionLabel}>{d.label}</Text>
                <Text style={dimensionScore}>{d.score}/100</Text>
              </Section>
            ))}
          </Section>

          {topConcern && (
            <Section style={quoteSection}>
              <Text style={quoteLabel}>Eigen zorg respondent:</Text>
              <Text style={quote}>{topConcern}</Text>
            </Section>
          )}

          <Section style={ctaSection}>
            <Button style={button} href={resultsUrl}>Bekijk volledige resultaten →</Button>
            <Text style={subText}>Of <a href={adminUrl} style={link}>open de admin-lijst</a> voor alle leads.</Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>HCSS Cyber Compass · gehost op markdekock.com/HCSS</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = { backgroundColor: '#f6f9fc', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }
const container: React.CSSProperties = { backgroundColor: '#ffffff', margin: '40px auto', padding: 0, borderRadius: '12px', maxWidth: '560px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
const header: React.CSSProperties = { backgroundColor: '#1f3a4a', padding: '24px 32px' }
const logo: React.CSSProperties = { color: '#ffffff', fontSize: '18px', fontWeight: 700, margin: 0 }
const headerSub: React.CSSProperties = { color: '#9CA3AF', fontSize: '12px', margin: '4px 0 0' }
const section: React.CSSProperties = { padding: '24px 32px 8px' }
const h2: React.CSSProperties = { color: '#111827', fontSize: '16px', fontWeight: 700, margin: '0 0 12px' }
const meta: React.CSSProperties = { color: '#374151', fontSize: '14px', margin: '0 0 6px' }
const dimensionRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }
const dimensionLabel: React.CSSProperties = { fontSize: '13px', color: '#374151', margin: 0 }
const dimensionScore: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#1f3a4a', margin: 0 }
const link: React.CSSProperties = { color: '#E8611A', textDecoration: 'underline' }
const quoteSection: React.CSSProperties = { padding: '16px 32px' }
const quoteLabel: React.CSSProperties = { fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', margin: '0 0 6px' }
const quote: React.CSSProperties = { borderLeft: '3px solid #E8611A', paddingLeft: 14, fontSize: '14px', color: '#1F2937', lineHeight: 1.55, fontStyle: 'italic', margin: 0 }
const ctaSection: React.CSSProperties = { padding: '20px 32px 28px', textAlign: 'center' }
const button: React.CSSProperties = { backgroundColor: '#E8611A', borderRadius: '6px', color: '#FFFFFF', fontSize: '14px', fontWeight: 600, textDecoration: 'none', padding: '12px 22px', display: 'inline-block' }
const subText: React.CSSProperties = { fontSize: '12px', color: '#6B7280', margin: '12px 0 0' }
const divider: React.CSSProperties = { borderColor: '#E5E7EB', margin: 0 }
const footer: React.CSSProperties = { padding: '14px 32px', backgroundColor: '#F9FAFB' }
const footerText: React.CSSProperties = { fontSize: '11px', color: '#9CA3AF', margin: 0, textAlign: 'center' }
