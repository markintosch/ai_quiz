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

type Locale = 'en' | 'nl' | 'fr'

interface SummaryEmailProps {
  name:         string
  score:        QuizScore
  resultsUrl:   string
  respondentId: string
  isLite:       boolean
  locale?:      Locale
}

const STRINGS: Record<Locale, {
  preview:        (overall: number, level: string) => string
  greeting:       (firstName: string) => string
  bodyIntro:      (isLite: boolean) => string
  liteTeaser:     string
  dimensionTitle: string
  ctaIntro:       (isLite: boolean) => string
  buttonLabel:    string
  brand:          string
  receivedNote:   string
  unsubLine:      (unsubUrl: string, privacyUrl: string) => { unsubLabel: string; privacyLabel: string; before: string }
  deletionNote:   string
}> = {
  en: {
    preview:        (o, l) => `Your AI Maturity Score: ${o}/100 — ${l}`,
    greeting:       (n) => `Hi ${n},`,
    bodyIntro:      (lite) => `Thank you for completing the ${lite ? 'AI Maturity Lite Assessment' : 'AI Maturity Assessment'}. Here is a summary of your results.`,
    liteTeaser:     'This is a directional score based on the Lite assessment (8 questions). Your full canonical score, including a detailed dimension breakdown, Shadow AI analysis and personalised recommendations, is available in the Full Assessment.',
    dimensionTitle: 'Dimension Snapshot',
    ctaIntro:       (lite) => lite
      ? 'View your full directional results and explore how to accelerate your AI journey.'
      : 'Your full results dashboard, including recommendations and a personalised consultation booking, is ready.',
    buttonLabel:    'View My Results →',
    brand:          'Brand PWRD Media · AI Transformation Consultancy',
    receivedNote:   'You received this email because you completed the AI Maturity Assessment and consented to receive your results. This is a transactional email.',
    unsubLine:      () => ({ unsubLabel: 'Unsubscribe', privacyLabel: 'Privacy Policy', before: 'To stop receiving marketing communications: ' }),
    deletionNote:   'To request deletion of your data email ',
  },
  nl: {
    preview:        (o, l) => `Jouw AI-maturity score: ${o}/100 — ${l}`,
    greeting:       (n) => `Hoi ${n},`,
    bodyIntro:      (lite) => `Bedankt voor het invullen van ${lite ? 'de AI-maturity Lite-assessment' : 'de AI-maturity assessment'}. Hieronder een samenvatting van je resultaat.`,
    liteTeaser:     'Dit is een indicatieve score op basis van de Lite-assessment (8 vragen). Je volledige score, inclusief gedetailleerde dimensies, Shadow AI-analyse en persoonlijke aanbevelingen, krijg je in de uitgebreide assessment.',
    dimensionTitle: 'Dimensies in één oogopslag',
    ctaIntro:       (lite) => lite
      ? 'Bekijk je volledige indicatieve resultaat en ontdek hoe je je AI-traject kunt versnellen.'
      : 'Je volledige resultatenoverzicht staat klaar, inclusief aanbevelingen en de mogelijkheid om een persoonlijk gesprek in te plannen.',
    buttonLabel:    'Bekijk mijn resultaat →',
    brand:          'Brand PWRD Media · AI-transformatieconsultancy',
    receivedNote:   'Je ontvangt deze e-mail omdat je de AI-maturity assessment hebt ingevuld en hebt aangegeven je resultaat te willen ontvangen. Dit is een transactionele e-mail.',
    unsubLine:      () => ({ unsubLabel: 'Uitschrijven', privacyLabel: 'Privacybeleid', before: 'Geen marketingmails meer ontvangen: ' }),
    deletionNote:   'Wil je dat we je gegevens verwijderen? Mail dan ',
  },
  fr: {
    preview:        (o, l) => `Votre score AI Maturity : ${o}/100 — ${l}`,
    greeting:       (n) => `Bonjour ${n},`,
    bodyIntro:      (lite) => `Merci d'avoir complété ${lite ? "l'évaluation AI Maturity Lite" : "l'évaluation AI Maturity"}. Voici un résumé de vos résultats.`,
    liteTeaser:     "Il s'agit d'un score indicatif basé sur l'évaluation Lite (8 questions). Votre score complet, avec un détail par dimension, une analyse Shadow AI et des recommandations personnalisées, est disponible dans l'évaluation complète.",
    dimensionTitle: 'Aperçu par dimension',
    ctaIntro:       (lite) => lite
      ? "Consultez vos résultats indicatifs complets et découvrez comment accélérer votre parcours IA."
      : "Votre tableau de bord complet est prêt, avec des recommandations et la possibilité de réserver un entretien personnalisé.",
    buttonLabel:    'Voir mes résultats →',
    brand:          'Brand PWRD Media · Conseil en transformation IA',
    receivedNote:   "Vous recevez cet e-mail parce que vous avez complété l'évaluation AI Maturity et accepté de recevoir vos résultats. Ceci est un e-mail transactionnel.",
    unsubLine:      () => ({ unsubLabel: 'Se désabonner', privacyLabel: 'Politique de confidentialité', before: 'Pour ne plus recevoir de communications marketing : ' }),
    deletionNote:   'Pour demander la suppression de vos données, écrivez à ',
  },
}

export function SummaryEmail({ name, score, resultsUrl, respondentId, isLite, locale = 'en' }: SummaryEmailProps) {
  const t = STRINGS[locale] ?? STRINGS.en
  const firstName = name.split(' ')[0]
  const unsubUrl   = `${process.env.NEXT_PUBLIC_BASE_URL}/api/unsubscribe?rid=${respondentId}`
  const privacyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/privacy`
  const { unsubLabel, privacyLabel, before } = t.unsubLine(unsubUrl, privacyUrl)

  return (
    <Html>
      <Head />
      <Preview>{t.preview(score.overall, score.maturityLevel)}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Brand PWRD Media</Heading>
          </Section>

          {/* Score hero */}
          <Section style={scoreSection}>
            <Text style={greeting}>{t.greeting(firstName)}</Text>
            <Text style={body}>{t.bodyIntro(isLite)}</Text>

            <Section style={scoreBadge}>
              <Text style={scoreNumber}>{score.overall}</Text>
              <Text style={scoreLabel}>{score.maturityLevel}</Text>
            </Section>

            {isLite && (
              <Text style={teaser}>{t.liteTeaser}</Text>
            )}
          </Section>

          {/* Dimension snapshot */}
          <Section style={section}>
            <Heading as="h2" style={sectionHeading}>
              {t.dimensionTitle}
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
            <Text style={body}>{t.ctaIntro(isLite)}</Text>
            <Button style={button} href={resultsUrl}>
              {t.buttonLabel}
            </Button>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>{t.brand}</Text>
            <Text style={footerText}>{t.receivedNote}</Text>
            <Text style={footerText}>
              {before}
              <a href={unsubUrl} style={link}>{unsubLabel}</a>
              {' · '}
              <a href={privacyUrl} style={link}>{privacyLabel}</a>
            </Text>
            <Text style={footerText}>
              {t.deletionNote}
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
