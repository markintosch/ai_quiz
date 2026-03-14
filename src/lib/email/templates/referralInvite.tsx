import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Preview, Section, Text,
} from '@react-email/components'

interface ReferralInviteEmailProps {
  inviteeName: string
  referrerName: string
  referrerCompany: string
  referrerScore: number
  referrerLevel: string
  quizUrl: string
}

export function ReferralInviteEmail({
  inviteeName,
  referrerName,
  referrerCompany,
  referrerScore,
  referrerLevel,
  quizUrl,
}: ReferralInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {referrerName} thinks you should know your AI Maturity Score
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Brand PWRD Media</Heading>
            <Text style={headerSub}>AI Maturity Assessment</Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={h2}>Hi {inviteeName},</Heading>
            <Text style={body}>
              <strong>{referrerName}</strong> from {referrerCompany} just completed the AI Maturity Assessment
              and scored <strong>{referrerScore}/100</strong> ({referrerLevel}).
            </Text>
            <Text style={body}>
              They thought you&apos;d find it useful too. The assessment takes under 5 minutes
              and gives you a clear picture of where your organisation stands on AI — and what to do next.
            </Text>
          </Section>

          <Section style={ctaSection}>
            <Button style={button} href={quizUrl}>
              Take the free assessment →
            </Button>
            <Text style={subText}>Free · 7 questions · Instant results</Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              You received this one-time invitation because {referrerName} entered your email address
              to share this assessment with you. Your email address has <strong>not been stored</strong> in
              our systems and will not be used for any further communication.
            </Text>
            <Text style={footerText}>
              If you have concerns about how your data was used, contact us at{' '}
              <a href="mailto:mark@brandpwrdmedia.com?subject=Data concern - referral email" style={footerLink}>
                mark@brandpwrdmedia.com
              </a>{' '}
              and we will respond within 30 days.
            </Text>
            <Text style={footerText}>
              Brand PWRD Media B.V. · Data Controller ·{' '}
              <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/privacy`} style={footerLink}>Privacy Policy</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  borderRadius: '12px',
  maxWidth: '520px',
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
  padding: '28px 32px 8px',
}
const h2: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 12px',
}
const body: React.CSSProperties = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0 0 14px',
}
const ctaSection: React.CSSProperties = {
  padding: '8px 32px 28px',
  textAlign: 'center',
}
const button: React.CSSProperties = {
  backgroundColor: '#E8611A',
  color: '#ffffff',
  padding: '14px 28px',
  borderRadius: '10px',
  fontWeight: '700',
  fontSize: '15px',
  textDecoration: 'none',
  display: 'inline-block',
}
const subText: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '10px 0 0',
}
const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '0',
}
const footer: React.CSSProperties = {
  padding: '20px 32px',
  backgroundColor: '#f9fafb',
}
const footerLink: React.CSSProperties = {
  color: '#E8611A',
  textDecoration: 'underline',
}

const footerText: React.CSSProperties = {
  fontSize: '11px',
  color: '#9ca3af',
  margin: '0 0 6px',
  lineHeight: '1.5',
}
