// FILE: src/lib/email/templates/compassResults.tsx
// Meertalige Resend email — Peri-Compass resultaten samenvatting (NL/EN/FR/DE).

import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import type { CompassScore } from '@/lib/peri-compass/scoring'
import type { CompassAiOutput } from '@/lib/peri-compass/ai'
import { BAND_COPY } from '@/lib/peri-compass/scoring'
import { getExperimentByCode } from '@/lib/peri-compass/experiments'
import type { Lang } from '@/lib/peri-compass/i18n'

interface Props {
  firstName:     string | null
  score:         CompassScore
  ai:            CompassAiOutput
  resultsUrl:    string
  cycleLoginUrl: string
  lang:          Lang
}

const COPY: Record<Lang, {
  previewTpl: (overall: number, title: string) => string
  greeting:   (firstName: string | null) => string
  intro:      string
  perDimension: string
  whatISee:   string
  threeHyp:   string
  hypDisclaimer: string
  experimentLabel: string
  ctaIntro:   string
  ctaButton:  string
  viewOnline: string
  brand:      string
  footerNote: string
}> = {
  nl: {
    previewTpl:    (o, t) => `Je Peri-Compass — ${o}/100 (${t})`,
    greeting:      (n) => n ? `Hoi ${n.split(' ')[0]},` : 'Hoi,',
    intro:         'Hieronder je nulmeting. Wat je hier ziet is geen diagnose — het is je vertrekpunt. Met daily check-ins kunnen we hierop bouwen en patronen zichtbaar maken.',
    perDimension:  'Per dimensie',
    whatISee:      'Wat ik zie',
    threeHyp:      'Drie hypothesen',
    hypDisclaimer: 'Hypothesen — geen diagnose. Voor medische vragen: huisarts of menopauze-arts.',
    experimentLabel: 'Eerste experiment (30 dagen)',
    ctaIntro:      'Klaar om je patronen zichtbaar te maken? Maak een account aan en start je eerste daily check-in.',
    ctaButton:     'Start dagelijkse tracking →',
    viewOnline:    'bekijk je volledige resultaten online',
    brand:         'Brand PWRD Media · Peri-Compass — een persoonlijke nulmeting',
    footerNote:    'Vragen? Antwoord gewoon op deze mail — komt direct bij Mark binnen.',
  },
  en: {
    previewTpl:    (o, t) => `Your Peri-Compass — ${o}/100 (${t})`,
    greeting:      (n) => n ? `Hi ${n.split(' ')[0]},` : 'Hi,',
    intro:         'Below is your baseline. What you see is not a diagnosis — it\'s your starting point. With daily check-ins we can build on this and make patterns visible.',
    perDimension:  'Per dimension',
    whatISee:      'What I see',
    threeHyp:      'Three hypotheses',
    hypDisclaimer: 'Hypotheses — not a diagnosis. For medical questions: GP or menopause specialist.',
    experimentLabel: 'First experiment (30 days)',
    ctaIntro:      'Ready to make your patterns visible? Create an account and start your first daily check-in.',
    ctaButton:     'Start daily tracking →',
    viewOnline:    'view your full results online',
    brand:         'Brand PWRD Media · Peri-Compass — a personal baseline',
    footerNote:    'Questions? Just reply to this email — it goes straight to Mark.',
  },
  fr: {
    previewTpl:    (o, t) => `Votre Peri-Compass — ${o}/100 (${t})`,
    greeting:      (n) => n ? `Bonjour ${n.split(' ')[0]},` : 'Bonjour,',
    intro:         'Voici votre point de départ. Ce que vous voyez n\'est pas un diagnostic — c\'est votre base. Avec des check-ins quotidiens, nous pouvons construire dessus et rendre les schémas visibles.',
    perDimension:  'Par dimension',
    whatISee:      'Ce que je vois',
    threeHyp:      'Trois hypothèses',
    hypDisclaimer: 'Hypothèses — pas un diagnostic. Pour des questions médicales : médecin ou spécialiste de la ménopause.',
    experimentLabel: 'Première expérimentation (30 jours)',
    ctaIntro:      'Prête à rendre vos schémas visibles ? Créez un compte et commencez votre premier check-in quotidien.',
    ctaButton:     'Démarrer le suivi quotidien →',
    viewOnline:    'voir vos résultats complets en ligne',
    brand:         'Brand PWRD Media · Peri-Compass — un point de départ personnel',
    footerNote:    'Questions ? Répondez simplement à cet e-mail — il arrive directement chez Mark.',
  },
  de: {
    previewTpl:    (o, t) => `Dein Peri-Compass — ${o}/100 (${t})`,
    greeting:      (n) => n ? `Hallo ${n.split(' ')[0]},` : 'Hallo,',
    intro:         'Hier ist deine Standortbestimmung. Was du siehst ist keine Diagnose — es ist dein Ausgangspunkt. Mit täglichen Check-ins können wir darauf aufbauen und Muster sichtbar machen.',
    perDimension:  'Pro Dimension',
    whatISee:      'Was ich sehe',
    threeHyp:      'Drei Hypothesen',
    hypDisclaimer: 'Hypothesen — keine Diagnose. Für medizinische Fragen: Hausarzt oder Menopause-Spezialist.',
    experimentLabel: 'Erstes Experiment (30 Tage)',
    ctaIntro:      'Bereit, deine Muster sichtbar zu machen? Erstelle ein Konto und starte deinen ersten täglichen Check-in.',
    ctaButton:     'Tägliches Tracking starten →',
    viewOnline:    'deine vollständigen Ergebnisse online ansehen',
    brand:         'Brand PWRD Media · Peri-Compass — eine persönliche Standortbestimmung',
    footerNote:    'Fragen? Antworte einfach auf diese Mail — sie geht direkt an Mark.',
  },
}

export function CompassResultsEmail({
  firstName, score, ai, resultsUrl, cycleLoginUrl, lang,
}: Props) {
  const t = COPY[lang]
  const bandCopy = BAND_COPY[lang][score.band]
  return (
    <Html>
      <Head />
      <Preview>{t.previewTpl(score.overall, bandCopy.title)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Peri-Compass</Heading>
            <Text style={headerSub}>Brand PWRD Media · Mark de Kock</Text>
          </Section>

          <Section style={scoreSection}>
            <Text style={greetingStyle}>{t.greeting(firstName)}</Text>
            <Text style={body}>{t.intro}</Text>
            <Section style={scoreBadge}>
              <Text style={scoreNumber}>{score.overall}</Text>
              <Text style={scoreLabel}>{bandCopy.title}</Text>
              <Text style={scoreSub}>{bandCopy.sub}</Text>
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
            <Heading as="h2" style={sectionHeading}>{t.threeHyp}</Heading>
            {ai.hypotheses.slice(0, 3).map((h, i) => (
              <Text key={i} style={hypothesisItem}>
                <strong style={{ color: '#E8611A' }}>{i + 1}.</strong>&nbsp; {h}
              </Text>
            ))}
            <Text style={disclaimer}>{t.hypDisclaimer}</Text>
          </Section>

          <Section style={experimentSection}>
            <Heading as="h2" style={experimentHeading}>{t.experimentLabel}</Heading>
            <Text style={experimentBody}>{ai.microExperiment}</Text>
            {ai.experimentCode && (() => {
              const exp = getExperimentByCode(ai.experimentCode)
              if (!exp?.rationale) return null
              return (
                <Text style={experimentRationale}>
                  <strong style={{ color: '#E8611A' }}>{whyLabel(lang)}:</strong> {exp.rationale}
                </Text>
              )
            })()}
            {ai.experimentSource && (
              <Text style={experimentSource}>
                {sourceLabel(lang)}: {ai.experimentSource}
              </Text>
            )}
          </Section>

          <Hr style={divider} />

          <Section style={ctaSection}>
            <Text style={body}>{t.ctaIntro}</Text>
            <Button style={button} href={cycleLoginUrl}>{t.ctaButton}</Button>
            <Text style={subText}>
              <a href={resultsUrl} style={link}>{t.viewOnline}</a>.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>{t.brand}</Text>
            <Text style={footerText}>{t.footerNote}</Text>
            <Text style={footerText}>{EVIDENCE_FOOTER[lang]}</Text>
            <Text style={footerText}>{DATA_CONTROLLER[lang]}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = { backgroundColor: '#f6f9fc', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container: React.CSSProperties = { backgroundColor: '#ffffff', margin: '40px auto', padding: 0, borderRadius: '12px', maxWidth: '560px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
const header: React.CSSProperties = { backgroundColor: '#354E5E', padding: '28px 32px' }
const logo: React.CSSProperties = { color: '#ffffff', fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }
const headerSub: React.CSSProperties = { color: '#9CA3AF', fontSize: '13px', margin: '4px 0 0' }
const scoreSection: React.CSSProperties = { padding: '32px 32px 0' }
const greetingStyle: React.CSSProperties = { fontSize: '20px', fontWeight: 700, color: '#354E5E', margin: '0 0 12px' }
const section: React.CSSProperties = { padding: '24px 32px' }
const sectionHeading: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px' }
const body: React.CSSProperties = { fontSize: '15px', color: '#374151', lineHeight: 1.6, margin: '0 0 16px' }
const scoreBadge: React.CSSProperties = { textAlign: 'center', backgroundColor: '#354E5E', borderRadius: '12px', padding: '24px 16px', margin: '8px 0 16px' }
const scoreNumber: React.CSSProperties = { fontSize: '56px', fontWeight: 900, color: '#E8611A', margin: 0, lineHeight: 1 }
const scoreLabel: React.CSSProperties = { fontSize: '18px', fontWeight: 600, color: '#FFFFFF', margin: '8px 0 4px' }
const scoreSub: React.CSSProperties = { fontSize: '13px', color: '#D1D5DB', margin: 0, padding: '0 8px', lineHeight: 1.5 }
const dimensionRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }
const dimensionLabel: React.CSSProperties = { fontSize: '14px', color: '#374151', margin: 0 }
const dimensionScore: React.CSSProperties = { fontSize: '14px', fontWeight: 600, color: '#354E5E', margin: 0 }
const hypothesisItem: React.CSSProperties = { fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: '0 0 10px' }
const disclaimer: React.CSSProperties = { fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic', margin: '14px 0 0', borderTop: '1px solid #F3F4F6', paddingTop: '10px' }
const experimentSection: React.CSSProperties = { backgroundColor: '#FFF6F1', padding: '20px 32px', borderTop: '1px solid #FCE0CF', borderBottom: '1px solid #FCE0CF' }
const experimentHeading: React.CSSProperties = { fontSize: '13px', fontWeight: 700, color: '#E8611A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }
const experimentBody: React.CSSProperties = { fontSize: '15px', color: '#1F2937', lineHeight: 1.6, margin: 0 }
const experimentSource: React.CSSProperties = { fontSize: '12px', fontStyle: 'italic', color: '#6B7280', margin: '10px 0 0' }

const SOURCE_LABEL: Record<Lang, string> = { nl: 'Bron', en: 'Source', fr: 'Source', de: 'Quelle' }
function sourceLabel(lang: Lang): string { return SOURCE_LABEL[lang] }
const WHY_LABEL: Record<Lang, string> = { nl: 'Waarom dit experiment', en: 'Why this experiment', fr: 'Pourquoi cette expérimentation', de: 'Warum dieses Experiment' }
function whyLabel(lang: Lang): string { return WHY_LABEL[lang] }
const experimentRationale: React.CSSProperties = { fontSize: '13px', color: '#374151', lineHeight: 1.55, margin: '12px 0 0' }
const EVIDENCE_FOOTER: Record<Lang, string> = {
  nl: 'Alle voorgestelde experimenten zijn gekozen uit erkende menopauze-richtlijnen (NAMS, NICE, IMS, NHS, AASM, ACSM, WHO).',
  en: 'All suggested experiments are chosen from recognised menopause guidelines (NAMS, NICE, IMS, NHS, AASM, ACSM, WHO).',
  fr: 'Toutes les expérimentations proposées sont choisies dans des recommandations menopause reconnues (NAMS, NICE, IMS, NHS, AASM, ACSM, OMS).',
  de: 'Alle vorgeschlagenen Experimente sind aus anerkannten Menopause-Leitlinien gewählt (NAMS, NICE, IMS, NHS, AASM, ACSM, WHO).',
}
const DATA_CONTROLLER: Record<Lang, string> = {
  nl: 'Platform en data worden beheerd door Brand PWRD Media B.V. (data controller).',
  en: 'Platform and data are managed by Brand PWRD Media B.V. (data controller).',
  fr: 'La plateforme et les données sont gérées par Brand PWRD Media B.V. (responsable du traitement).',
  de: 'Plattform und Daten werden von Brand PWRD Media B.V. verwaltet (Datenverantwortliche).',
}
const divider: React.CSSProperties = { borderColor: '#E5E7EB', margin: 0 }
const ctaSection: React.CSSProperties = { padding: '24px 32px', textAlign: 'center' }
const button: React.CSSProperties = { backgroundColor: '#E8611A', color: '#FFFFFF', padding: '14px 28px', borderRadius: '8px', fontWeight: 600, fontSize: '15px', textDecoration: 'none', display: 'inline-block' }
const subText: React.CSSProperties = { fontSize: '13px', color: '#6B7280', margin: '14px 0 0' }
const link: React.CSSProperties = { color: '#E8611A', textDecoration: 'underline' }
const footer: React.CSSProperties = { padding: '20px 32px', backgroundColor: '#F9FAFB' }
const footerText: React.CSSProperties = { fontSize: '12px', color: '#9CA3AF', lineHeight: 1.5, margin: '0 0 6px' }
