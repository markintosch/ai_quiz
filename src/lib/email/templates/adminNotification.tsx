import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { QuizScore, QuizVersion } from '@/types'

interface AdminNotificationEmailProps {
  respondent: {
    name: string
    email: string
    jobTitle: string
    companyName: string
    industry?: string
    companySize?: string
  }
  score: QuizScore
  version: QuizVersion
  resultsUrl: string
}

export function AdminNotificationEmail({
  respondent,
  score,
  version,
  resultsUrl,
}: AdminNotificationEmailProps) {
  const shadowBadge = score.shadowAI.triggered
    ? ` 🚨 Shadow AI (${score.shadowAI.severity?.toUpperCase()})`
    : ''

  return (
    <Html>
      <Head />
      <Preview>
        New {version} submission: {respondent.name} · {respondent.companyName} · {String(score.overall)}/100{shadowBadge}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>KB Quiz — New Submission</Heading>
            <Text style={headerSub}>
              {version === 'lite' ? 'Lite Assessment' : 'Full Assessment'}
            </Text>
          </Section>

          {/* Score */}
          <Section style={section}>
            <Section style={scoreBadge}>
              <Text style={scoreNumber}>{score.overall}/100</Text>
              <Text style={scoreLabel}>{score.maturityLevel}</Text>
            </Section>

            {score.shadowAI.triggered && (
              <Section style={alertBox}>
                <Text style={alertText}>
                  ⚠️ <strong>Shadow AI Detected</strong> — Severity:{' '}
                  <strong>{score.shadowAI.severity?.toUpperCase()}</strong> · Gap:{' '}
                  <strong>{Math.round(score.shadowAI.gap)} pts</strong>
                </Text>
              </Section>
            )}
          </Section>

          <Hr style={divider} />

          {/* Respondent info */}
          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>Respondent</Heading>
            <Row label="Name" value={respondent.name} />
            <Row label="Email" value={respondent.email} />
            <Row label="Job Title" value={respondent.jobTitle} />
            <Row label="Company" value={respondent.companyName} />
            {respondent.industry && <Row label="Industry" value={respondent.industry} />}
            {respondent.companySize && <Row label="Company Size" value={`${respondent.companySize} employees`} />}
          </Section>

          <Hr style={divider} />

          {/* Dimension breakdown */}
          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>Dimension Scores</Heading>
            {score.dimensionScores.map(ds => (
              <Row key={ds.dimension} label={ds.label} value={`${ds.normalized}/100`} />
            ))}
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={section}>
            <Button style={button} href={resultsUrl}>
              View Full Results Dashboard →
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ─── Helper ───────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <Section style={rowStyle}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={rowValue}>{value}</Text>
    </Section>
  )
}

// ─── Styles ───────────────────────────────────────────────────
const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  borderRadius: '12px',
  maxWidth: '560px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
}

const header: React.CSSProperties = {
  backgroundColor: '#354E5E',
  padding: '24px 32px',
}

const logo: React.CSSProperties = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
}

const headerSub: React.CSSProperties = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '4px 0 0',
}

const section: React.CSSProperties = {
  padding: '24px 32px',
}

const sectionHeading: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 12px',
}

const scoreBadge: React.CSSProperties = {
  textAlign: 'center',
  backgroundColor: '#f9fafb',
  borderRadius: '10px',
  padding: '20px',
  border: '1px solid #e5e7eb',
}

const scoreNumber: React.CSSProperties = {
  fontSize: '42px',
  fontWeight: '900',
  color: '#E8611A',
  margin: '0',
  lineHeight: '1',
}

const scoreLabel: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#354E5E',
  margin: '6px 0 0',
}

const alertBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '12px 16px',
  marginTop: '12px',
}

const alertText: React.CSSProperties = {
  fontSize: '14px',
  color: '#dc2626',
  margin: '0',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '7px 0',
  borderBottom: '1px solid #f3f4f6',
}

const rowLabel: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0',
}

const rowValue: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#111827',
  margin: '0',
}

const button: React.CSSProperties = {
  backgroundColor: '#354E5E',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '14px',
  textDecoration: 'none',
  display: 'inline-block',
}

const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '0',
}
