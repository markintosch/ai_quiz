import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface RespondentEntry {
  name: string
  email: string
  jobTitle: string
  overallScore: number
  maturityLevel: string
  shadowAI: boolean
  date: string
}

interface DimensionAvg {
  label: string
  avg: number
}

interface CompanyReportEmailProps {
  companyName: string
  respondentCount: number
  avgScore: number
  dimensionAverages: DimensionAvg[]
  topRespondents: RespondentEntry[]
  reportDate: string
}

export function CompanyReportEmail({
  companyName,
  respondentCount,
  avgScore,
  dimensionAverages,
  topRespondents,
  reportDate,
}: CompanyReportEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        AI Maturity Report — {companyName} · {String(respondentCount)} respondents · Avg score {String(avgScore)}/100
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Brand PWRD Media</Heading>
            <Text style={headerSub}>AI Maturity Assessment — Company Report</Text>
          </Section>

          {/* Company + summary */}
          <Section style={section}>
            <Heading as="h2" style={companyHeading}>{companyName}</Heading>
            <Text style={reportDateStyle}>Generated {reportDate}</Text>

            <Section style={summaryGrid}>
              <Section style={summaryCard}>
                <Text style={summaryValue}>{respondentCount}</Text>
                <Text style={summaryLabel}>Respondents</Text>
              </Section>
              <Section style={summaryCard}>
                <Text style={summaryValue}>{avgScore}/100</Text>
                <Text style={summaryLabel}>Avg Score</Text>
              </Section>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Dimension averages */}
          {dimensionAverages.length > 0 && (
            <Section style={section}>
              <Heading as="h2" style={sectionHeading}>Dimension Averages</Heading>
              {dimensionAverages.map((d) => (
                <Section key={d.label} style={dimRow}>
                  <Text style={dimLabel}>{d.label}</Text>
                  <Text style={dimValue}>{d.avg}/100</Text>
                </Section>
              ))}
            </Section>
          )}

          <Hr style={divider} />

          {/* Respondent list */}
          {topRespondents.length > 0 && (
            <Section style={section}>
              <Heading as="h2" style={sectionHeading}>
                Respondents {topRespondents.length < respondentCount ? `(Top ${topRespondents.length})` : ''}
              </Heading>
              {topRespondents.map((r, i) => (
                <Section key={i} style={respondentRow}>
                  <Text style={respondentName}>
                    {r.name}{r.shadowAI ? ' 🚨' : ''}
                  </Text>
                  <Text style={respondentMeta}>
                    {r.jobTitle} · {r.overallScore}/100 · {r.maturityLevel} · {r.date}
                  </Text>
                </Section>
              ))}
            </Section>
          )}

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              Brand PWRD Media · AI Maturity Assessment Platform · mark@brandpwrdmedia.com
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
  borderRadius: '12px',
  maxWidth: '580px',
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
const companyHeading: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '800',
  color: '#111827',
  margin: '0 0 4px',
}
const reportDateStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0 0 20px',
}
const summaryGrid: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
}
const summaryCard: React.CSSProperties = {
  backgroundColor: '#f9fafb',
  borderRadius: '10px',
  padding: '16px 24px',
  border: '1px solid #e5e7eb',
  textAlign: 'center',
  flex: '1',
}
const summaryValue: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: '900',
  color: '#E8611A',
  margin: '0',
  lineHeight: '1',
}
const summaryLabel: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '4px 0 0',
}
const sectionHeading: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 12px',
}
const dimRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid #f3f4f6',
}
const dimLabel: React.CSSProperties = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
}
const dimValue: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '700',
  color: '#354E5E',
  margin: '0',
}
const respondentRow: React.CSSProperties = {
  padding: '10px 0',
  borderBottom: '1px solid #f3f4f6',
}
const respondentName: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#111827',
  margin: '0',
}
const respondentMeta: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '2px 0 0',
}
const divider: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '0',
}
const footer: React.CSSProperties = {
  padding: '16px 32px',
  backgroundColor: '#f9fafb',
}
const footerText: React.CSSProperties = {
  fontSize: '11px',
  color: '#9ca3af',
  margin: '0',
  textAlign: 'center',
}
