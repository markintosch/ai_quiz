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

type Locale = 'en' | 'nl' | 'fr'

interface FollowUpEmailProps {
  firstName:     string
  score:         number
  maturityLevel: string
  resultsUrl:    string
  nextStepsUrl:  string
  productName?:  string
  locale?:       Locale
}

// Generic product label per locale, used when productName isn't passed.
const GENERIC: Record<Locale, string> = {
  en: 'AI Maturity Assessment',
  nl: 'AI-maturity assessment',
  fr: 'évaluation AI Maturity',
}

const STRINGS: Record<Locale, {
  preview:        (product: string, firstName: string) => string
  brand:          (product: string) => string
  heading:        (firstName: string) => string
  scoreLine:      (product: string, score: number, level: string) => string
  reflection:     string
  primaryCta:     string
  revisitIntro:   string
  revisitLink:    (product: string) => string
  receivedNote:   (product: string) => string
}> = {
  en: {
    preview:      (p, n) => `Still thinking about your ${p} score? Here's your next step, ${n}.`,
    brand:        (p) => `Brand PWRD Media · ${p}`,
    heading:      (n) => `Hi ${n}, ready to take action?`,
    scoreLine:    (p, s, l) => `A couple of days ago you scored ${s}/100 on the ${p}, putting you at ${l} maturity.`,
    reflection:   'Most people look at their score once and move on. The ones who improve are the ones who look at the "what next" and act on it.',
    primaryCta:   'See your recommended next steps →',
    revisitIntro: 'Want to revisit your full results first?',
    revisitLink:  (p) => `View your ${p} results →`,
    receivedNote: (p) => `You received this because you completed the ${p}. This is a one-time follow-up — you won't receive further emails from this assessment unless you take it again.`,
  },
  nl: {
    preview:      (p, n) => `Nog aan het denken over je ${p}-score? Hier is je volgende stap, ${n}.`,
    brand:        (p) => `Brand PWRD Media · ${p}`,
    heading:      (n) => `Hoi ${n}, klaar voor de volgende stap?`,
    scoreLine:    (p, s, l) => `Een paar dagen geleden scoorde je ${s}/100 op de ${p}. Dat plaatst je op het maturity-niveau ${l}.`,
    reflection:   'De meeste mensen kijken één keer naar hun score en gaan daarna door. Wie écht stappen zet, kijkt naar het "wat nu" en gaat ermee aan de slag.',
    primaryCta:   'Bekijk je aanbevolen volgende stappen →',
    revisitIntro: 'Eerst je volledige resultaat opnieuw bekijken?',
    revisitLink:  (p) => `Bekijk je ${p}-resultaat →`,
    receivedNote: (p) => `Je ontvangt deze e-mail omdat je de ${p} hebt afgerond. Dit is een eenmalige follow-up. Je krijgt geen verdere mails over deze assessment, tenzij je hem opnieuw doet.`,
  },
  fr: {
    preview:      (p, n) => `Vous réfléchissez encore à votre score ${p} ? Voici votre prochaine étape, ${n}.`,
    brand:        (p) => `Brand PWRD Media · ${p}`,
    heading:      (n) => `Bonjour ${n}, prêt à passer à l'action ?`,
    scoreLine:    (p, s, l) => `Il y a quelques jours, vous avez obtenu ${s}/100 à l'${p}, ce qui vous place au niveau ${l}.`,
    reflection:   "La plupart des gens regardent leur score une fois et passent à autre chose. Ceux qui progressent sont ceux qui regardent le \"et maintenant\", puis agissent.",
    primaryCta:   'Voir vos prochaines étapes recommandées →',
    revisitIntro: "Vous souhaitez d'abord revoir vos résultats complets ?",
    revisitLink:  (p) => `Voir vos résultats ${p} →`,
    receivedNote: (p) => `Vous recevez ce message parce que vous avez complété l'${p}. Ceci est un suivi unique : vous ne recevrez plus d'autres e-mails liés à cette évaluation, sauf si vous la refaites.`,
  },
}

export function FollowUpEmail({
  firstName,
  score,
  maturityLevel,
  resultsUrl,
  nextStepsUrl,
  productName,
  locale = 'en',
}: FollowUpEmailProps) {
  const t       = STRINGS[locale] ?? STRINGS.en
  const product = productName ?? GENERIC[locale] ?? GENERIC.en

  return (
    <Html>
      <Head />
      <Preview>{t.preview(product, firstName)}</Preview>
      <Body style={{ backgroundColor: '#f8fafc', fontFamily: 'Inter, -apple-system, sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: '40px auto', padding: '0 16px' }}>

          {/* Header */}
          <Section style={{ backgroundColor: '#354E5E', borderRadius: '12px 12px 0 0', padding: '28px 32px 24px' }}>
            <Text style={{ color: '#ffffff', fontSize: 13, margin: 0, opacity: 0.7 }}>
              {t.brand(product)}
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '0 0 12px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <Heading style={{ color: '#1a2e3b', fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>
              {t.heading(firstName)}
            </Heading>

            <Text style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px' }}>
              {t.scoreLine(product, score, maturityLevel)}
            </Text>

            <Text style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
              {t.reflection}
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
                {t.primaryCta}
              </Button>
            </Section>

            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

            {/* Secondary CTA */}
            <Text style={{ color: '#6b7280', fontSize: 13, margin: '0 0 8px' }}>
              {t.revisitIntro}
            </Text>
            <Text style={{ margin: 0 }}>
              <a href={resultsUrl} style={{ color: '#354E5E', fontSize: 13, textDecoration: 'underline' }}>
                {t.revisitLink(product)}
              </a>
            </Text>

            <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />

            <Text style={{ color: '#9ca3af', fontSize: 11, lineHeight: 1.5, margin: 0 }}>
              {t.receivedNote(product)}
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}
