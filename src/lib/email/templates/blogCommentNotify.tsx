// FILE: src/lib/email/templates/blogCommentNotify.tsx
// Notificatie aan Mark bij elke nieuwe blog-reactie. Komt van Resend zodra
// iemand een comment plaatst — Mark kan direct goedkeuren via de mod-link.

import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Preview, Section, Text,
} from '@react-email/components'

interface Props {
  authorName:  string
  authorEmail: string
  body:        string
  postTitle:   string
  postUrl:     string
  modUrl:      string
}

export function BlogCommentNotifyEmail({
  authorName, authorEmail, body, postTitle, postUrl, modUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>{`Nieuwe reactie van ${authorName} op "${postTitle}"`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Brand PWRD Media</Heading>
            <Text style={headerSub}>Blog moderatie</Text>
          </Section>

          <Section style={section}>
            <Heading as="h2" style={h2}>Nieuwe reactie wacht op moderatie</Heading>
            <Text style={meta}>
              Op: <a href={postUrl} style={link}><strong>{postTitle}</strong></a>
            </Text>
            <Text style={meta}>
              Van: <strong>{authorName}</strong> &lt;{authorEmail}&gt;
            </Text>
          </Section>

          <Section style={quoteSection}>
            <Text style={quote}>{body}</Text>
          </Section>

          <Section style={ctaSection}>
            <Button style={button} href={modUrl}>
              Beoordelen in admin →
            </Button>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              Brand PWRD Media · automatische notificatie
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = { backgroundColor: '#f6f9fc', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }
const container: React.CSSProperties = { backgroundColor: '#ffffff', margin: '40px auto', padding: 0, borderRadius: '12px', maxWidth: '560px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
const header: React.CSSProperties = { backgroundColor: '#354E5E', padding: '24px 32px' }
const logo: React.CSSProperties = { color: '#ffffff', fontSize: '18px', fontWeight: 700, margin: 0 }
const headerSub: React.CSSProperties = { color: '#9CA3AF', fontSize: '12px', margin: '4px 0 0' }
const section: React.CSSProperties = { padding: '24px 32px 8px' }
const h2: React.CSSProperties = { color: '#111827', fontSize: '18px', fontWeight: 700, margin: '0 0 12px' }
const meta: React.CSSProperties = { color: '#374151', fontSize: '14px', margin: '0 0 6px' }
const link: React.CSSProperties = { color: '#E8611A', textDecoration: 'underline' }
const quoteSection: React.CSSProperties = { padding: '8px 32px 24px' }
const quote: React.CSSProperties = {
  borderLeft: '3px solid #E8611A',
  paddingLeft: 14,
  fontSize: '14px',
  color: '#1F2937',
  lineHeight: 1.6,
  fontStyle: 'italic',
  whiteSpace: 'pre-wrap',
  margin: 0,
}
const ctaSection: React.CSSProperties = { padding: '16px 32px 32px', textAlign: 'center' }
const button: React.CSSProperties = {
  backgroundColor: '#E8611A',
  borderRadius: '6px',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '12px 22px',
  display: 'inline-block',
}
const divider: React.CSSProperties = { borderColor: '#E5E7EB', margin: 0 }
const footer: React.CSSProperties = { padding: '16px 32px', backgroundColor: '#F9FAFB' }
const footerText: React.CSSProperties = { fontSize: '11px', color: '#9CA3AF', margin: 0, textAlign: 'center' }
