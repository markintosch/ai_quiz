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
import type { QuizScore } from '@/types'

interface SummaryEmailProps {
  name: string
  score: QuizScore
  resultsUrl: string
  respondentId: string
  isLite: boolean
}

export function SummaryEmail({ name, score, resultsUrl, respondentId, isLite }: SummaryEmailProps) {
  const firstName = name.split(' ')[0]

  return (
    <Html>
      <Head />
      <Preview>
        Your AI Maturity Score: {String(score.overall)}/100 — {score.maturityLevel}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Brand PWRD Media</Heading>
          </Section>

          {/* Score hero */}
          <Section style={scoreSection}>
            <Text style={greeting}>Hi {firstName},</Text>
            <Text style={body}>
              Thank you for completing the{' '}
              {isLite ? 'AI Maturity Lite Assessment' : 'AI Maturity Assessment'}.
              Here is a summary of your results.
            </Text>

            <Section style={scoreBadge}>
              <Text style={scoreNumber}>{score.overall}</Text>
              <Text style={scoreLabel}>{score.maturityLevel}</Text>
            </Section>

            {isLite && (
              <Text style={teaser}>
                This is a <strong>directional score</strong> based on the Lite assessment
                (8 questions). Your full canonical score — including a detailed dimension
                breakdown, Shadow AI analysis and personalised recommendations — is available
                in the Full Assessment.
              </Text>
            )}
          </Section>

          {/* Dimension snapshot */}
          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>
              Dimension Snapshot
            </Heading>
            {score.dimensionScores.map(ds => (
              <Section key={ds.dimension} style={dimensionRow}>
                <Text style={dimensionLabel}>{ds.label}</Text>
                <Text style={dimensionScore}>{ds.normalized}/100</Text>
              </Section>
            ))}
          </Section>

          <Hr style={divider} />

          {/* CTA */}
          <Section style={section}>
            <Text style={body}>
              {isLite
                ? 'View your full directional results and explore how to accelerate your AI journey.'
                : 'Your full results dashboard — including recommendations and a personalised consultation booking — is ready.'}
            </Text>
            <Button style={button} href={resultsUrl}>
              View My Results →
            </Button>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              Brand PWRD Media · AI Transformation Consultancy
            </Text>
            <Text style={footerText}>
              You received this email because you completed the AI Maturity Assessment
              and consented to receive your results. This is a transactional email.
            </Text>
            <Text style={footerText}>
              To stop receiving marketing communications:{' '}
              <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/unsubscribe?rid=${respondentId}`} style={link}>
                Unsubscribe
              </a>
              {' · '}
              <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/privacy`} style={link}>
                Privacy Policy
              </a>
            </Text>
            <Text style={footerText}>
              To request deletion of your data email{' '}
              <a href="mailto:mark@brandpwrdmedia.com?subject=Data deletion request" style={link}>
                mark@brandpwrdmedia.com
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
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
  padding: '0',
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
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
}

const scoreSection: React.CSSProperties = {
  padding: '32px 32px 0',
}

const section: React.CSSProperties = {
  padding: '24px 32px',
}

const sectionHeading: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 16px',
}

const greeting: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#354E5E',
  margin: '0 0 8px',
}

const body: React.CSSProperties = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0 0 20px',
}

const teaser: React.CSSProperties = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '1.6',
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  margin: '0 0 20px',
}

const scoreBadge: React.CSSProperties = {
  textAlign: 'center',
  backgroundColor: '#354E5E',
  borderRadius: '12px',
  padding: '24px',
  margin: '0 0 20px',
}

const scoreNumber: React.CSSProperties = {
  fontSize: '56px',
  fontWeight: '900',
  color: '#E8611A',
  margin: '0',
  lineHeight: '1',
}

const scoreLabel: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '8px 0 0',
}

const dimensionRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid #f3f4f6',
}

const dimensionLabel: React.CSSProperties = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
}

const dimensionScore: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#354E5E',
  margin: '0',
}

const button: React.CSSProperties = {
  backgroundColor: '#E8611A',
  color: '#ffffff',
  padding: '12px 28px',
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

const footer: React.CSSProperties = {
  padding: '20px 32px',
  backgroundColor: '#f9fafb',
}

const footerText: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  lineHeight: '1.5',
  margin: '0 0 6px',
}

const link: React.CSSProperties = {
  color: '#E8611A',
  textDecoration: 'underline',
}
