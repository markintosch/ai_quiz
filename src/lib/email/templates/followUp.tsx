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

interface FollowUpEmailProps {
  firstName: string
  score: number
  maturityLevel: string
  resultsUrl: string
  nextStepsUrl: string
  productName?: string
}

export function FollowUpEmail({
  firstName,
  score,
  maturityLevel,
  resultsUrl,
  nextStepsUrl,
  productName = 'AI Maturity Assessment',
}: FollowUpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Still thinking about your {productName} score? Here&apos;s your next step, {firstName}.
      </Preview>
      <Body style={{ backgroundColor: '#f8fafc', fontFamily: 'Inter, -apple-system, sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: '40px auto', padding: '0 16px' }}>

          {/* Header */}
          <Section style={{ backgroundColor: '#354E5E', borderRadius: '12px 12px 0 0', padding: '28px 32px 24px' }}>
            <Text style={{ color: '#ffffff', fontSize: 13, margin: 0, opacity: 0.7 }}>
              Brand PWRD Media · {productName}
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '0 0 12px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Heading style={{ color: '#1a2e3b', fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
              Hi {firstName} — ready to take action?
            </Heading>

            <Text style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px' }}>
              A couple of days ago you scored <strong style={{ color: '#E8611A' }}>{score}/100</strong> on
              the {productName} — putting you at <strong>{maturityLevel}</strong> maturity.
            </Text>

            <Text style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
              Most people look at their score once and move on. The ones who improve are the ones
              who look at the &ldquo;what next&rdquo; — and act on it.
            </Text>

            {/* Primary CTA */}
            <Section style={{ textAlign: 'center', margin: '24px 0' }}>
              <Button
                href={nextStepsUrl}
                style={{
                  backgroundColor: '#E8611A',
                  color: '#ffffff',
                  borderRadius: 8,
                  padding: '14px 28px',
                  fontSize: 15,
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                See your recommended next steps →
              </Button>
            </Section>

            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

            {/* Secondary CTA */}
            <Text style={{ color: '#6b7280', fontSize: 13, margin: '0 0 8px' }}>
              Want to revisit your full results first?
            </Text>
            <Text style={{ margin: 0 }}>
              <a href={resultsUrl} style={{ color: '#354E5E', fontSize: 13, textDecoration: 'underline' }}>
                View your {productName} results →
              </a>
            </Text>

            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

            <Text style={{ color: '#9ca3af', fontSize: 11, lineHeight: 1.5, margin: 0 }}>
              You received this because you completed the {productName}.
              This is a one-time follow-up — you won&apos;t receive further emails from this assessment unless you take it again.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
