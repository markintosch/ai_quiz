'use client'

import { useState } from 'react'

// ─── Brand tokens ────────────────────────────────────────────────────────────
const HDK = {
  navy:     '#1C2E4A',
  navyDark: '#13203A',
  navyMid:  '#243656',
  gold:     '#C8922A',
  goldLight:'#D9A84A',
  cream:    '#F7F5F0',
  white:    '#FFFFFF',
  muted:    '#5A6A82',
  border:   '#D6CCB8',
}

// ─── Static arrays (language-independent) ────────────────────────────────────
const PILLAR_OWNERS = ['Sandra', 'Mark', 'Both', 'Sandra', 'Mark', 'Both', 'Sandra']
const PILLAR_ICONS  = ['⚡', '📈', '🤖', '⚙️', '🎯', '💎', '🛡️']
const PILLAR_COLORS = ['#2D5A8B', '#2E7D5A', '#6B3FA0', '#A0522D', '#B5560A', '#1A6B6B', '#7B4F8E']
const AUDIENCE_ICONS = ['🏢', '📊', '🚀', '🤝']
const PHASE_PRICES  = ['€10.000–€15.000', '€55.000–€75.000', '€12.000–€30.000/mo', '€25.000–€35.000/mo + success fee']
const PHASE_TAGS    = ['4–6 weeks', '100 days', '6–12 months', '6–18 months']

// ─── Copy object ─────────────────────────────────────────────────────────────
const COPY = {
  en: {
    nav: {
      tagline: 'Leadership That Delivers Growth',
      cta: 'Start Assessment →',
    },
    hero: {
      badge: 'AI & M&A Readiness Assessment — Beta',
      h1a: 'Does your company survive',
      h1b: "a buyer's lens?",
      sub1: "Portfolio companies don't fail because of bad strategy.<br/>They fail because <strong>strategy never reaches the market.</strong>",
      sub2: 'Ten minutes. Seven dimensions. One clear picture of your AI & M&A readiness — before the buyer, investor or board gets there first.',
      roles: ['Company Owner', 'PE / VC Investor', 'Portfolio Company', 'M&A Advisor'],
      ctaMain: 'Start your free readiness scan →',
      ctaSub: '10 minutes · No login required · Instant results',
    },
    problemBar: 'Leadership gets aligned. Governance gets installed. And then — <em>nothing moves.</em> The commercial engine stalls while everyone waits for someone to translate decisions into revenue.',
    audiences: {
      label: 'Who is this for',
      heading: 'One assessment. Four entry points.',
      cards: [
        { role: 'Company Owner / CEO', trigger: 'Preparing for sale, merger or investment round', value: 'Know your gaps before the buyer does. Fix what matters, disclose on your terms. Walk in prepared.', cta: 'Assess my company' },
        { role: 'PE / VC Investor', trigger: 'In due diligence or pre-LOI phase', value: 'De-risk your value creation plan. Objective AI & leadership readiness data — before you sign.', cta: 'Assess a target' },
        { role: 'Portfolio Company', trigger: 'Post-close, growth stalling or exit approaching', value: 'Baseline where you actually stand. Align leadership and commercial execution from day one.', cta: 'Assess our operations' },
        { role: 'M&A Advisor / Dealmaker', trigger: 'Adding depth to your due diligence process', value: 'An independent operational and AI readiness layer for your deal analysis. One report, two disciplines.', cta: 'Run a deal scan' },
      ],
    },
    pillars: {
      label: 'What gets assessed',
      heading: 'Seven dimensions. Two disciplines. One verdict.',
      sub: "Each pillar maps to either Sandra's leadership lens or Mark's commercial lens — or both. Together they give you the full picture buyers, investors and boards actually look for.",
      pillarLabel: 'Pillar',
      items: [
        { title: 'Leadership & Change Readiness', description: 'Does your leadership team have the clarity, accountability and change capacity to survive a deal? We assess succession depth, decision speed, ownership mindset and board maturity.', signals: ['Succession clarity', 'Decision speed', 'Change track record', 'Board governance'] },
        { title: 'Commercial Engine Maturity', description: "How predictable, scalable and defensible is your revenue? We evaluate ICP sharpness, funnel health, CAC/LTV ratios and go-to-market execution quality.", signals: ['ICP & positioning clarity', 'Pipeline predictability', 'CAC / LTV health', 'GTM execution'] },
        { title: 'AI Adoption & Digital Capability', description: "How deeply is AI embedded in your operations and strategy — and how does that look through an investor's lens? We assess tool adoption, data infrastructure, automation depth and AI literacy.", signals: ['AI tool adoption', 'Data infrastructure', 'Automation maturity', 'AI strategy & literacy'] },
        { title: 'Operational Scalability', description: 'Can your operation survive a deal, integration or rapid growth phase? We examine process documentation, key-person risk, systems maturity and integration track record.', signals: ['Process documentation', 'Key-person risk', 'Tech stack health', 'Integration readiness'] },
        { title: 'Commercial Narrative & Investor Story', description: 'Is your story compelling enough to survive the room? We assess positioning sharpness, differentiation defensibility, growth evidence quality and board pack readiness.', signals: ['Positioning clarity', 'Differentiation proof', 'Growth story evidence', 'Board pack quality'] },
        { title: 'Value Creation Potential', description: 'What is the real upside case — and can leadership actually deliver it? We map untapped opportunity, quick-win potential, AI-enabled growth levers and execution capacity.', signals: ['Untapped market potential', 'Quick-win backlog', 'AI growth levers', 'Execution capacity'] },
        { title: 'Psychological Safety & Culture', description: 'The hidden risk every buyer misses. Do teams speak up before problems become crises? Do people trust leadership enough to flag failure early? Psychological safety is the canary in the coalmine for post-deal success.', signals: ['Team voice & candour', 'Leadership trust', 'Change appetite', 'Cross-team collaboration'] },
      ],
    },
    howItWorks: {
      label: 'How it works',
      heading: 'From question to conversation in three steps',
      steps: [
        { title: 'Take the assessment', desc: '26 questions across 7 dimensions. Honest answers only — this is your mirror, not a pitch deck.' },
        { title: 'Get your readiness report', desc: "Instant scores per pillar. Shadow AI detection. A clear view of where you're strong and where deals get difficult." },
        { title: 'Talk to Wouter, Sandra & Mark', desc: "Book a free 30-minute debrief. We'll tell you where you stand, what it means for your M&A situation, and whether we can help." },
      ],
      cta: 'Start your free assessment →',
    },
    partnership: {
      label: 'The partnership',
      heading: 'One partnership. Three disciplines. No gap.',
      sub: 'We close the space where strategy gets defined but execution stalls. Deal desk to market.',
      sandraRole: 'Strategic Leadership & Integration',
      sandraBio: 'Governance, M&A integration, turnaround. When organisations stall or scale, Sandra steps in as the leader who creates ownership and restores momentum.',
      sandraCurrentLabel: 'Currently',
      sandraCurrent: 'Managing Director at Hibou/Contenture — leading the merger and integration of two companies into one unified brand and team.',
      markRole: 'Commercial Acceleration & Growth',
      markBio: 'Revenue growth, go-to-market, brand positioning. Mark translates strategy into market results. 20+ years scaling B2B/B2C tech and consumer brands across multiple sectors.',
      markCurrentLabel: 'Currently',
      markCurrent: 'Fractional CMO through Kirk & Blackbeard, serving B2B/B2C companies (Tech / Fast movers / Health).',
      wouterRole: 'M&A Strategy & Deal Advisory',
      wouterBio: 'Deal structuring, investor relations and strategic advisory. Wouter guides leadership teams through acquisitions, fundraising and exit processes — bringing the transactional perspective that Sandra and Mark translate into operations and commercial results.',
      wouterCurrentLabel: 'Currently',
      wouterCurrent: 'Senior Consultant and Fractional CMO at Aquasium Consultants, advising growth companies on strategy, deals and commercial positioning.',
    },
    services: {
      label: 'Services',
      heading: 'From first conversation to successful exit',
      sub: 'Combined trajectories — the real power is in the integration.',
      vat: 'All prices excl. VAT. Indicative and context-dependent. Portfolio pricing available for multi-company pipelines.',
      phases: [
        { phase: 'Pre-Deal', title: 'Due Diligence Tandem', description: "Full operational + commercial due diligence. One report, one go/no-go judgement. Know what you're buying — and what it can become.", items: ['Quick Scan op Operatie', 'Rapid Growth Scan', 'Integrated DD report'] },
        { phase: 'First 100 Days', title: 'Post-Close Accelerator', description: 'Stabilise the organisation and accelerate commercial momentum — in parallel. No sequential waiting. Direct impact on both fronts.', items: ['Turnaround Sprint', 'GTM Deep Dive', 'Governance + commercial momentum'] },
        { phase: 'Value Creation', title: 'Full Value Creation Partnership', description: 'Fractional COO + Fractional CMO as an integrated team. Operational leadership and commercial acceleration, hand in hand.', items: ['Weekly sync', 'Joint board updates', 'One value creation narrative'] },
        { phase: 'Exit Readiness', title: 'Exit Readiness Program', description: 'The house and the curb appeal. Organisation transferable, commercial story investor-ready. DD-proof on both fronts.', items: ['Build to Grow', 'Build to Scale', 'Commercial narrative + DD prep'] },
      ],
    },
    whenToCall: {
      label: 'When to call us',
      triggers: ['Growth stalling', 'CAC rising', 'Narrative unclear', 'Team stuck', 'Structure missing', 'Deal in preparation', 'Post-close chaos', 'Exit approaching'],
    },
    finalCta: {
      h2a: 'Find out where you stand.',
      h2b: 'Before someone else does.',
      sub: 'Ten minutes. Seven pillars. A clear readiness score across AI adoption, leadership, commercial engine, scalability, investor narrative and value creation potential.',
      ctaMain: 'Start free assessment →',
      ctaSecondary: 'Talk to us first',
    },
    footer: {
      tagline: 'Leadership That Delivers Growth',
      poweredBy: 'Assessment powered by Brand PWRD Media',
    },
  },

  nl: {
    nav: {
      tagline: 'Leiderschap dat Groei Levert',
      cta: 'Start Assessment →',
    },
    hero: {
      badge: 'AI & M&A Gereedheidsassessment — Beta',
      h1a: 'Overleeft jouw bedrijf',
      h1b: 'de blik van een koper?',
      sub1: 'Portfolio-bedrijven falen niet door een slechte strategie.<br/>Ze falen omdat <strong>strategie de markt nooit bereikt.</strong>',
      sub2: 'Tien minuten. Zeven dimensies. Eén helder beeld van jouw AI & M&A-gereedheid — voordat de koper, investeerder of board er zelf achter komt.',
      roles: ['Bedrijfseigenaar / CEO', 'PE / VC Investeerder', 'Portfoliobedrijf', 'M&A Adviseur'],
      ctaMain: 'Start jouw gratis gereedheidscan →',
      ctaSub: '10 minuten · Geen login vereist · Direct resultaat',
    },
    problemBar: 'Leiderschap wordt uitgelijnd. Governance wordt geïnstalleerd. En dan — <em>beweegt er niets.</em> De commerciële motor stokt terwijl iedereen wacht op iemand die beslissingen naar omzet vertaalt.',
    audiences: {
      label: 'Voor wie is dit',
      heading: 'Één assessment. Vier invalshoeken.',
      cards: [
        { role: 'Bedrijfseigenaar / CEO', trigger: 'Voorbereiding op verkoop, fusie of investeringsronde', value: 'Ken je zwakke plekken voordat de koper dat doet. Herstel wat telt, communiceer op jouw voorwaarden. Ga goed voorbereid de kamer in.', cta: 'Mijn bedrijf beoordelen' },
        { role: 'PE / VC Investeerder', trigger: 'In due diligence of pre-LOI fase', value: 'Verlaag het risico op je waardecreatieprogramma. Objectieve AI- en leiderschapsgereedheidsdata — voordat je tekent.', cta: 'Een target beoordelen' },
        { role: 'Portfoliobedrijf', trigger: 'Post-close, groei stagneert of exit nadert', value: 'Stel vast waar je écht staat. Lijn leiderschap en commerciële executie af vanaf dag één.', cta: 'Onze operatie beoordelen' },
        { role: 'M&A Adviseur / Dealmaker', trigger: 'Verdieping toevoegen aan je due diligence', value: 'Een onafhankelijke operationele en AI-gereedheidslaag voor jouw dealanalyse. Één rapport, twee disciplines.', cta: 'Een dealscan uitvoeren' },
      ],
    },
    pillars: {
      label: 'Wat wordt beoordeeld',
      heading: 'Zeven dimensies. Twee disciplines. Één oordeel.',
      sub: 'Elke pijler is gekoppeld aan de leiderschapsvisie van Sandra of de commerciële lens van Mark — of aan beiden. Samen geven ze het volledige beeld dat kopers, investeerders en boards daadwerkelijk zoeken.',
      pillarLabel: 'Pijler',
      items: [
        { title: 'Leiderschap & Veranderingsbereidheid', description: 'Heeft jouw leiderschapsteam de helderheid, accountability en verandervermogen om een deal te overleven? We beoordelen opvolgingsdiepte, beslissingssnelheid, ownership-mentaliteit en boardvolwassenheid.', signals: ['Opvolgingshelderheid', 'Beslissingssnelheid', 'Track record in verandering', 'Board governance'] },
        { title: 'Commerciële Motor Volwassenheid', description: 'Hoe voorspelbaar, schaalbaar en verdedigbaar is jouw omzet? We evalueren ICP-scherpte, funnelgezondheid, CAC/LTV-ratio\'s en de kwaliteit van GTM-executie.', signals: ['ICP & positioneringshelderheid', 'Pipeline-voorspelbaarheid', 'CAC / LTV gezondheid', 'GTM-executie'] },
        { title: 'AI-adoptie & Digitale Capaciteit', description: 'Hoe diep is AI ingebed in jouw operatie en strategie — en hoe ziet dat eruit door de lens van een investeerder? We beoordelen tooladoptie, data-infrastructuur, automatiseringsdiepte en AI-geletterdheid.', signals: ['AI-tooladoptie', 'Data-infrastructuur', 'Automatiseringsvolwassenheid', 'AI-strategie & geletterdheid'] },
        { title: 'Operationele Schaalbaarheid', description: 'Kan jouw operatie een deal, integratie of snelle groeifase overleven? We onderzoeken procesdocumentatie, sleutelpersoonrisico, systeemvolwassenheid en integratietrack record.', signals: ['Procesdocumentatie', 'Sleutelpersoonrisico', 'Tech stack gezondheid', 'Integratiegereedheid'] },
        { title: 'Commercieel Verhaal & Investeerdersverhaal', description: 'Is jouw verhaal sterk genoeg om de boardroom te overleven? We beoordelen positioneringsscherpte, differentiatieverdedigbaarheid, groeibewijskwaliteit en board pack-gereedheid.', signals: ['Positioneringshelderheid', 'Differentiatiebewijs', 'Groeiverhaalbewijzen', 'Board pack kwaliteit'] },
        { title: 'Waardecreatie Potentieel', description: 'Wat is de echte upside — en kan het leiderschap die daadwerkelijk realiseren? We brengen onbenut potentieel, quick-win kansen, AI-groeihefbomen en executiecapaciteit in kaart.', signals: ['Onbenut marktpotentieel', 'Quick-win backlog', 'AI groeihefbomen', 'Executiecapaciteit'] },
        { title: 'Psychologische Veiligheid & Cultuur', description: 'Het verborgen risico dat elke koper mist. Spreken teams zich uit voordat problemen crises worden? Vertrouwen mensen het leiderschap genoeg om vroeg te signaleren? Psychologische veiligheid is de kanarie in de kolenmijn voor succes na de deal.', signals: ['Teamstem & openheid', 'Vertrouwen in leiderschap', 'Veranderbereidheid', 'Cross-team samenwerking'] },
      ],
    },
    howItWorks: {
      label: 'Hoe het werkt',
      heading: 'Van vraag naar gesprek in drie stappen',
      steps: [
        { title: 'Doe het assessment', desc: '26 vragen over 7 dimensies. Alleen eerlijke antwoorden — dit is jouw spiegel, geen pitchdeck.' },
        { title: 'Ontvang jouw gereedheidsrapport', desc: 'Direct scores per pijler. Shadow AI-detectie. Een helder beeld van waar je sterk staat en waar deals moeilijk worden.' },
        { title: 'Praat met Wouter, Sandra & Mark', desc: 'Boek een gratis debrief van 30 minuten. We vertellen je waar je staat, wat het betekent voor jouw M&A-situatie en of we kunnen helpen.' },
      ],
      cta: 'Start jouw gratis assessment →',
    },
    partnership: {
      label: 'Het partnerschap',
      heading: 'Één partnerschap. Drie disciplines. Geen kloof.',
      sub: 'We sluiten de ruimte waar strategie wordt gedefinieerd maar executie stagneert. Van dealdesk tot markt.',
      sandraRole: 'Strategisch Leiderschap & Integratie',
      sandraBio: 'Governance, M&A-integratie, turnaround. Als organisaties stagneren of schalen, stapt Sandra in als de leider die eigenaarschap creëert en momentum herstelt.',
      sandraCurrentLabel: 'Huidig',
      sandraCurrent: 'Managing Director bij Hibou/Contenture — leidt de fusie en integratie van twee bedrijven tot één unified merk en team.',
      markRole: 'Commerciële Versnelling & Groei',
      markBio: 'Omzetgroei, go-to-market, merkpositionering. Mark vertaalt strategie naar marktresultaten. 20+ jaar B2B/B2C tech en consumentenmerken schalen in meerdere sectoren.',
      markCurrentLabel: 'Huidig',
      markCurrent: 'Fractional CMO via Kirk & Blackbeard, voor B2B/B2C-bedrijven (Tech / Fast movers / Health).',
      wouterRole: 'M&A Strategie & Deal Advisory',
      wouterBio: 'Dealstructurering, investeerdersrelaties en strategisch advies. Wouter begeleidt leiderschapsteams door overnames, financieringsrondes en exitprocessen — hij brengt het transactionele perspectief dat Sandra en Mark vertalen naar operatie en commercieel resultaat.',
      wouterCurrentLabel: 'Huidig',
      wouterCurrent: 'Senior Consultant en Fractional CMO bij Aquasium Consultants, adviseert groeibedrijven op het gebied van strategie, deals en commerciële positionering.',
    },
    services: {
      label: 'Diensten',
      heading: 'Van eerste gesprek tot succesvolle exit',
      sub: 'Gecombineerde trajecten — de echte kracht zit in de integratie.',
      vat: 'Alle prijzen excl. BTW. Indicatief en contextafhankelijk. Portfoliobeprijzing beschikbaar voor multi-company pipelines.',
      phases: [
        { phase: 'Pre-Deal', title: 'Due Diligence Tandem', description: 'Volledige operationele + commerciële due diligence. Één rapport, één go/no-go oordeel. Weet wat je koopt — en wat het kan worden.', items: ['Quick Scan op Operatie', 'Rapid Growth Scan', 'Geïntegreerd DD-rapport'] },
        { phase: 'Eerste 100 Dagen', title: 'Post-Close Accelerator', description: 'Stabiliseer de organisatie en versnel commercieel momentum — parallel. Geen sequentieel wachten. Direct impact op beide fronten.', items: ['Turnaround Sprint', 'GTM Deep Dive', 'Governance + commercieel momentum'] },
        { phase: 'Waardecreatie', title: 'Volledig Waardecreatie Partnerschap', description: 'Fractional COO + Fractional CMO als geïntegreerd team. Operationeel leiderschap en commerciële versnelling, hand in hand.', items: ['Wekelijkse sync', 'Gezamenlijke board updates', 'Één waardecreatie-narratief'] },
        { phase: 'Exit Gereedheid', title: 'Exit Gereedheidsprogramma', description: 'Het huis en de uitstraling. Organisatie overdraagbaar, commercieel verhaal investor-ready. DD-proof op beide fronten.', items: ['Build to Grow', 'Build to Scale', 'Commercieel narratief + DD-voorbereiding'] },
      ],
    },
    whenToCall: {
      label: 'Wanneer bel je ons',
      triggers: ['Groei stagneert', 'CAC stijgt', 'Verhaal onduidelijk', 'Team loopt vast', 'Structuur ontbreekt', 'Deal in voorbereiding', 'Post-close chaos', 'Exit nadert'],
    },
    finalCta: {
      h2a: 'Weet waar je staat.',
      h2b: 'Voordat iemand anders dat doet.',
      sub: 'Tien minuten. Zeven pijlers. Een duidelijke gereedheidsscore over AI-adoptie, leiderschap, commerciële motor, schaalbaarheid, investeerdersnarratief en waardecreatiepotentieel.',
      ctaMain: 'Start gratis assessment →',
      ctaSecondary: 'Eerst met ons praten',
    },
    footer: {
      tagline: 'Leiderschap dat Groei Levert',
      poweredBy: 'Assessment aangedreven door Brand PWRD Media',
    },
  },

  de: {
    nav: {
      tagline: 'Führung, die Wachstum liefert',
      cta: 'Assessment starten →',
    },
    hero: {
      badge: 'KI & M&A Readiness Assessment — Beta',
      h1a: 'Übersteht Ihr Unternehmen',
      h1b: 'den Blick eines Käufers?',
      sub1: 'Portfoliounternehmen scheitern nicht an schlechter Strategie.<br/>Sie scheitern, weil <strong>Strategie nie den Markt erreicht.</strong>',
      sub2: 'Zehn Minuten. Sieben Dimensionen. Ein klares Bild Ihrer KI & M&A-Readiness — bevor Käufer, Investor oder Board es herausfinden.',
      roles: ['Unternehmensinhaber / CEO', 'PE / VC Investor', 'Portfoliounternehmen', 'M&A Berater'],
      ctaMain: 'Kostenlosen Readiness-Scan starten →',
      ctaSub: '10 Minuten · Keine Anmeldung · Sofortige Ergebnisse',
    },
    problemBar: 'Führung wird ausgerichtet. Governance wird eingeführt. Und dann — <em>bewegt sich nichts.</em> Die kommerzielle Maschine stockt, während alle darauf warten, dass jemand Entscheidungen in Umsatz übersetzt.',
    audiences: {
      label: 'Für wen ist das',
      heading: 'Ein Assessment. Vier Einstiegspunkte.',
      cards: [
        { role: 'Unternehmensinhaber / CEO', trigger: 'Vorbereitung auf Verkauf, Fusion oder Investitionsrunde', value: 'Kennen Sie Ihre Lücken, bevor der Käufer es tut. Beheben Sie, was wichtig ist, und kommunizieren Sie zu Ihren Bedingungen.', cta: 'Unternehmen bewerten' },
        { role: 'PE / VC Investor', trigger: 'In Due Diligence oder Pre-LOI Phase', value: 'Reduzieren Sie das Risiko in Ihrem Wertschöpfungsplan. Objektive KI- und Führungs-Readiness-Daten — bevor Sie unterschreiben.', cta: 'Zielunternehmen bewerten' },
        { role: 'Portfoliounternehmen', trigger: 'Post-Close, Wachstum stockt oder Exit naht', value: 'Baseline, wo Sie wirklich stehen. Führung und kommerzielle Ausführung von Tag eins ausrichten.', cta: 'Unsere Operationen bewerten' },
        { role: 'M&A Berater / Dealmaker', trigger: 'Mehr Tiefe in Due Diligence einbringen', value: 'Eine unabhängige operative und KI-Readiness-Schicht für Ihre Deal-Analyse. Ein Bericht, zwei Disziplinen.', cta: 'Deal-Scan durchführen' },
      ],
    },
    pillars: {
      label: 'Was bewertet wird',
      heading: 'Sieben Dimensionen. Zwei Disziplinen. Ein Urteil.',
      sub: 'Jeder Pfeiler ist entweder Sandras Führungslinse oder Marks kommerzieller Linse zugeordnet — oder beiden. Zusammen liefern sie das vollständige Bild, nach dem Käufer, Investoren und Boards tatsächlich suchen.',
      pillarLabel: 'Pfeiler',
      items: [
        { title: 'Führung & Veränderungsbereitschaft', description: 'Hat Ihr Führungsteam die Klarheit, Verantwortung und Veränderungskapazität, um einen Deal zu überstehen? Wir bewerten Nachfolgetiefe, Entscheidungsgeschwindigkeit, Eigentümer-Mentalität und Board-Reife.', signals: ['Nachfolgeklarheit', 'Entscheidungsgeschwindigkeit', 'Change-Track-Record', 'Board-Governance'] },
        { title: 'Reife der kommerziellen Maschine', description: 'Wie vorhersehbar, skalierbar und verteidigbar ist Ihr Umsatz? Wir evaluieren ICP-Schärfe, Funnel-Gesundheit, CAC/LTV-Verhältnisse und GTM-Ausführungsqualität.', signals: ['ICP & Positionierungsklarheit', 'Pipeline-Vorhersehbarkeit', 'CAC / LTV Gesundheit', 'GTM-Ausführung'] },
        { title: 'KI-Adoption & Digitale Kompetenz', description: "Wie tief ist KI in Ihre Abläufe und Strategie eingebettet — und wie sieht das durch die Linse eines Investors aus? Wir bewerten Tool-Adoption, Dateninfrastruktur, Automatisierungstiefe und KI-Kompetenz.", signals: ['KI-Tool-Adoption', 'Dateninfrastruktur', 'Automatisierungsreife', 'KI-Strategie & Kompetenz'] },
        { title: 'Operative Skalierbarkeit', description: 'Kann Ihre Operation einen Deal, eine Integration oder eine schnelle Wachstumsphase überstehen? Wir untersuchen Prozessdokumentation, Schlüsselpersonenrisiko, Systemreife und Integrations-Track-Record.', signals: ['Prozessdokumentation', 'Schlüsselpersonenrisiko', 'Tech-Stack-Gesundheit', 'Integrationsbereitschaft'] },
        { title: 'Kommerzielle Narrative & Investorenstory', description: 'Ist Ihre Geschichte überzeugend genug, um den Boardroom zu überstehen? Wir bewerten Positionierungsschärfe, Differenzierungsverteidigung, Wachstumsbelege und Board-Pack-Bereitschaft.', signals: ['Positionierungsklarheit', 'Differenzierungsnachweis', 'Wachstumsstory-Belege', 'Board-Pack-Qualität'] },
        { title: 'Wertschöpfungspotenzial', description: 'Was ist der echte Upside — und kann die Führung ihn tatsächlich liefern? Wir kartieren ungenutztes Potenzial, Quick-Win-Möglichkeiten, KI-Wachstumshebel und Ausführungskapazität.', signals: ['Ungenutztes Marktpotenzial', 'Quick-Win-Backlog', 'KI-Wachstumshebel', 'Ausführungskapazität'] },
        { title: 'Psychologische Sicherheit & Kultur', description: 'Das versteckte Risiko, das jeder Käufer übersieht. Sprechen Teams Probleme an, bevor sie zu Krisen werden? Vertrauen Menschen der Führung genug, um früh Misserfolge zu melden? Psychologische Sicherheit ist der Kanarienvogel im Kohlebergwerk für Post-Deal-Erfolg.', signals: ['Teamstimme & Offenheit', 'Führungsvertrauen', 'Veränderungsbereitschaft', 'Teamübergreifende Zusammenarbeit'] },
      ],
    },
    howItWorks: {
      label: 'So funktioniert es',
      heading: 'Von der Frage zum Gespräch in drei Schritten',
      steps: [
        { title: 'Assessment durchführen', desc: '26 Fragen über 7 Dimensionen. Nur ehrliche Antworten — das ist Ihr Spiegel, kein Pitch-Deck.' },
        { title: 'Readiness-Bericht erhalten', desc: 'Sofortige Scores pro Pfeiler. Shadow-KI-Erkennung. Ein klares Bild, wo Sie stark sind und wo Deals schwierig werden.' },
        { title: 'Mit Wouter, Sandra & Mark sprechen', desc: 'Buchen Sie ein kostenloses 30-minütiges Debrief. Wir sagen Ihnen, wo Sie stehen, was das für Ihre M&A-Situation bedeutet und ob wir helfen können.' },
      ],
      cta: 'Kostenloses Assessment starten →',
    },
    partnership: {
      label: 'Die Partnerschaft',
      heading: 'Eine Partnerschaft. Drei Disziplinen. Keine Lücke.',
      sub: 'Wir schließen den Raum, in dem Strategie definiert, aber Ausführung gestoppt wird. Vom Deal-Desk zum Markt.',
      sandraRole: 'Strategische Führung & Integration',
      sandraBio: 'Governance, M&A-Integration, Turnaround. Wenn Organisationen stagnieren oder skalieren, tritt Sandra als Führungskraft ein, die Eigenverantwortung schafft und Momentum wiederherstellt.',
      sandraCurrentLabel: 'Aktuell',
      sandraCurrent: 'Managing Director bei Hibou/Contenture — leitet die Fusion und Integration zweier Unternehmen zu einer einheitlichen Marke und einem Team.',
      markRole: 'Kommerzielle Beschleunigung & Wachstum',
      markBio: 'Umsatzwachstum, Go-to-Market, Markenpositionierung. Mark übersetzt Strategie in Marktergebnisse. 20+ Jahre B2B/B2C Tech- und Konsumentenmarken in mehreren Sektoren skalieren.',
      markCurrentLabel: 'Aktuell',
      markCurrent: 'Fractional CMO über Kirk & Blackbeard, für B2B/B2C-Unternehmen (Tech / Fast Movers / Health).',
      wouterRole: 'M&A-Strategie & Deal Advisory',
      wouterBio: 'Deal-Strukturierung, Investorenbeziehungen und strategische Beratung. Wouter begleitet Führungsteams durch Akquisitionen, Finanzierungsrunden und Exit-Prozesse — er bringt die transaktionale Perspektive, die Sandra und Mark in operative und kommerzielle Ergebnisse übersetzen.',
      wouterCurrentLabel: 'Aktuell',
      wouterCurrent: 'Senior Consultant und Fractional CMO bei Aquasium Consultants, berät Wachstumsunternehmen zu Strategie, Deals und kommerzieller Positionierung.',
    },
    services: {
      label: 'Leistungen',
      heading: 'Vom ersten Gespräch bis zum erfolgreichen Exit',
      sub: 'Kombinierte Trajektorien — die echte Stärke liegt in der Integration.',
      vat: 'Alle Preise zzgl. MwSt. Indikativ und kontextabhängig. Portfolio-Preise für Multi-Company-Pipelines verfügbar.',
      phases: [
        { phase: 'Pre-Deal', title: 'Due Diligence Tandem', description: 'Vollständige operative + kommerzielle Due Diligence. Ein Bericht, ein Go/No-Go-Urteil. Wissen, was Sie kaufen — und was es werden kann.', items: ['Quick Scan der Operation', 'Rapid Growth Scan', 'Integrierter DD-Bericht'] },
        { phase: 'Erste 100 Tage', title: 'Post-Close Accelerator', description: 'Organisation stabilisieren und kommerzielles Momentum beschleunigen — parallel. Kein sequenzielles Warten. Direkter Impact auf beiden Fronten.', items: ['Turnaround Sprint', 'GTM Deep Dive', 'Governance + kommerzielles Momentum'] },
        { phase: 'Wertschöpfung', title: 'Vollständige Wertschöpfungspartnerschaft', description: 'Fractional COO + Fractional CMO als integriertes Team. Operative Führung und kommerzielle Beschleunigung, Hand in Hand.', items: ['Wöchentlicher Sync', 'Gemeinsame Board-Updates', 'Eine Wertschöpfungsnarrative'] },
        { phase: 'Exit-Vorbereitung', title: 'Exit-Readiness-Programm', description: 'Das Haus und die Außenwirkung. Organisation übertragbar, kommerzielle Geschichte investor-ready. DD-sicher auf beiden Fronten.', items: ['Build to Grow', 'Build to Scale', 'Kommerzielle Narrative + DD-Vorbereitung'] },
      ],
    },
    whenToCall: {
      label: 'Wann Sie uns anrufen',
      triggers: ['Wachstum stockt', 'CAC steigt', 'Narrative unklar', 'Team blockiert', 'Struktur fehlt', 'Deal in Vorbereitung', 'Post-Close Chaos', 'Exit naht'],
    },
    finalCta: {
      h2a: 'Finden Sie heraus, wo Sie stehen.',
      h2b: 'Bevor jemand anderes es tut.',
      sub: 'Zehn Minuten. Sieben Pfeiler. Ein klarer Readiness-Score über KI-Adoption, Führung, kommerzielle Maschine, Skalierbarkeit, Investorennarrative und Wertschöpfungspotenzial.',
      ctaMain: 'Kostenloses Assessment starten →',
      ctaSecondary: 'Erst mit uns sprechen',
    },
    footer: {
      tagline: 'Führung, die Wachstum liefert',
      poweredBy: 'Assessment powered by Brand PWRD Media',
    },
  },
} as const

type Lang = 'en' | 'nl' | 'de'

export default function MandaLandingPage() {
  const [lang, setLang] = useState<Lang>('en')
  const copy = COPY[lang]

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: HDK.cream, color: HDK.navy }}>

      {/* ── NAV ── */}
      <nav style={{ background: HDK.navy, borderBottom: `3px solid ${HDK.gold}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ color: HDK.white, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>BLOK, HOFSTEDE &amp; DE KOCK</span>
            <span style={{ color: HDK.gold, fontSize: '0.75rem', fontStyle: 'italic', fontWeight: 400 }}>{copy.nav.tagline}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Language switcher */}
            <div style={{ display: 'flex', gap: 4, marginRight: 12 }}>
              {(['en', 'nl', 'de'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    background: lang === l ? HDK.gold : 'transparent',
                    color: lang === l ? HDK.navyDark : 'rgba(255,255,255,0.55)',
                    border: `1px solid ${lang === l ? HDK.gold : 'rgba(255,255,255,0.2)'}`,
                    padding: '0.3rem 0.65rem',
                    borderRadius: 5,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <a
              href="#assessment"
              style={{
                background: HDK.gold,
                color: HDK.navyDark,
                padding: '0.5rem 1.25rem',
                borderRadius: 6,
                fontSize: '0.875rem',
                fontWeight: 700,
                textDecoration: 'none',
                letterSpacing: '0.01em',
              }}
            >
              {copy.nav.cta}
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          background: `linear-gradient(135deg, ${HDK.navyDark} 0%, ${HDK.navyMid} 60%, #2D4A6E 100%)`,
          padding: '5rem 2rem 4rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(#C8922A 1px, transparent 1px), linear-gradient(90deg, #C8922A 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(200,146,42,0.15)',
            border: `1px solid ${HDK.gold}`,
            color: HDK.gold,
            padding: '0.35rem 1rem',
            borderRadius: 20,
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}>
            {copy.hero.badge}
          </div>

          <h1 style={{
            color: HDK.white,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '1.5rem',
            letterSpacing: '-0.03em',
          }}>
            {copy.hero.h1a}<br />
            <span style={{ color: HDK.gold }}>{copy.hero.h1b}</span>
          </h1>

          <p
            dangerouslySetInnerHTML={{ __html: copy.hero.sub1 }}
            style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '1rem', maxWidth: 680, margin: '0 auto 1rem' }}
          />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem' }}>
            {copy.hero.sub2}
          </p>

          {/* Role pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
            {copy.hero.roles.map(role => (
              <span key={role} style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'rgba(255,255,255,0.85)',
                padding: '0.35rem 0.9rem',
                borderRadius: 20,
                fontSize: '0.82rem',
                fontWeight: 500,
              }}>
                {role}
              </span>
            ))}
          </div>

          <a
            id="assessment"
            href="/en/a/public"
            style={{
              display: 'inline-block',
              background: HDK.gold,
              color: HDK.navyDark,
              padding: '1rem 2.5rem',
              borderRadius: 8,
              fontSize: '1.05rem',
              fontWeight: 800,
              textDecoration: 'none',
              letterSpacing: '0.01em',
              boxShadow: '0 4px 24px rgba(200,146,42,0.4)',
            }}
          >
            {copy.hero.ctaMain}
          </a>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            {copy.hero.ctaSub}
          </p>
        </div>
      </section>

      {/* ── PROBLEM BAR ── */}
      <section style={{ background: HDK.gold, padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p
            dangerouslySetInnerHTML={{ __html: copy.problemBar }}
            style={{ color: HDK.navyDark, fontWeight: 700, fontSize: '1.05rem', margin: 0, letterSpacing: '-0.01em' }}
          />
        </div>
      </section>

      {/* ── WHO IS THIS FOR ── */}
      <section style={{ padding: '5rem 2rem', background: HDK.white }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{copy.audiences.label}</p>
            <h2 style={{ color: HDK.navy, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              {copy.audiences.heading}
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {copy.audiences.cards.map((a, i) => (
              <div key={a.role} style={{
                background: HDK.cream,
                border: `1px solid ${HDK.border}`,
                borderRadius: 12,
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ fontSize: '2rem' }}>{AUDIENCE_ICONS[i]}</div>
                <div>
                  <h3 style={{ color: HDK.navy, fontWeight: 800, fontSize: '1rem', margin: '0 0 0.25rem', letterSpacing: '-0.01em' }}>{a.role}</h3>
                  <p style={{ color: HDK.gold, fontSize: '0.78rem', fontWeight: 600, margin: 0, fontStyle: 'italic' }}>When: {a.trigger}</p>
                </div>
                <p style={{ color: HDK.muted, fontSize: '0.9rem', lineHeight: 1.55, margin: 0, flex: 1 }}>{a.value}</p>
                <a
                  href="/en/a/public"
                  style={{
                    display: 'inline-block',
                    borderTop: `1px solid ${HDK.border}`,
                    paddingTop: '0.75rem',
                    color: HDK.navy,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                  }}
                >
                  {a.cta} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section style={{ padding: '5rem 2rem', background: HDK.cream }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{copy.pillars.label}</p>
            <h2 style={{ color: HDK.navy, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.75rem' }}>
              {copy.pillars.heading}
            </h2>
            <p style={{ color: HDK.muted, fontSize: '1rem', maxWidth: 580, margin: '0 auto' }}>
              {copy.pillars.sub}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {copy.pillars.items.map((p, idx) => {
              const number = String(idx + 1).padStart(2, '0')
              const owner = PILLAR_OWNERS[idx]
              const icon = PILLAR_ICONS[idx]
              const color = PILLAR_COLORS[idx]
              return (
                <div key={number} style={{
                  background: HDK.white,
                  borderRadius: 12,
                  border: `1px solid ${HDK.border}`,
                  borderLeft: `4px solid ${color}`,
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.75rem' }}>{icon}</span>
                      <div>
                        <div style={{ color: HDK.muted, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{copy.pillars.pillarLabel} {number}</div>
                        <h3 style={{ color: HDK.navy, fontWeight: 800, fontSize: '0.95rem', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{p.title}</h3>
                      </div>
                    </div>
                    <span style={{
                      background: owner === 'Both' ? HDK.gold : owner === 'Sandra' ? '#2D5A8B' : '#2E7D5A',
                      color: HDK.white,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: 10,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      letterSpacing: '0.04em',
                    }}>
                      {owner === 'Both' ? '⊕ Both' : owner === 'Sandra' ? 'Sandra' : 'Mark'}
                    </span>
                  </div>
                  <p style={{ color: HDK.muted, fontSize: '0.875rem', lineHeight: 1.55, margin: 0 }}>{p.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                    {p.signals.map(s => (
                      <span key={s} style={{
                        background: `${color}18`,
                        color: color,
                        border: `1px solid ${color}30`,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 8,
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '5rem 2rem', background: HDK.navy }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{copy.howItWorks.label}</p>
            <h2 style={{ color: HDK.white, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
              {copy.howItWorks.heading}
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', position: 'relative' }}>
            {copy.howItWorks.steps.map((s, i) => {
              const step = String(i + 1).padStart(2, '0')
              return (
                <div key={step} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 56, height: 56,
                    borderRadius: '50%',
                    border: `2px solid ${HDK.gold}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem',
                    color: HDK.gold,
                    fontWeight: 900,
                    fontSize: '1.1rem',
                  }}>{step}</div>
                  <h3 style={{ color: HDK.white, fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{s.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
                </div>
              )
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <a
              href="/en/a/public"
              style={{
                display: 'inline-block',
                background: HDK.gold,
                color: HDK.navyDark,
                padding: '0.9rem 2.25rem',
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 800,
                textDecoration: 'none',
                letterSpacing: '0.01em',
              }}
            >
              {copy.howItWorks.cta}
            </a>
          </div>
        </div>
      </section>

      {/* ── THE PARTNERSHIP ── */}
      <section style={{ padding: '5rem 2rem', background: HDK.white }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{copy.partnership.label}</p>
            <h2 style={{ color: HDK.navy, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.75rem' }}>
              {copy.partnership.heading}
            </h2>
            <p style={{ color: HDK.muted, fontSize: '1rem', maxWidth: 600, margin: '0 auto' }}>
              {copy.partnership.sub}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Sandra */}
            <div style={{ background: HDK.cream, border: `1px solid ${HDK.border}`, borderTop: `4px solid #2D5A8B`, borderRadius: 12, padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#2D5A8B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: HDK.white, fontWeight: 900, fontSize: '1.25rem', flexShrink: 0,
                }}>S</div>
                <div>
                  <h3 style={{ color: HDK.navy, fontWeight: 800, fontSize: '1.1rem', margin: '0 0 0.2rem' }}>Sandra Hofstede</h3>
                  <p style={{ color: '#2D5A8B', fontSize: '0.82rem', fontWeight: 600, margin: 0, fontStyle: 'italic' }}>{copy.partnership.sandraRole}</p>
                </div>
              </div>
              <p style={{ color: HDK.muted, fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1rem' }}>
                {copy.partnership.sandraBio}
              </p>
              <p style={{ color: HDK.muted, fontSize: '0.85rem', margin: '0 0 1rem' }}>20+ years leading complex transformations across professionalizing, merging and scaling organisations.</p>
              <div style={{ borderTop: `1px solid ${HDK.border}`, paddingTop: '1rem' }}>
                <p style={{ color: '#2D5A8B', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.25rem' }}>{copy.partnership.sandraCurrentLabel}</p>
                <p style={{ color: HDK.muted, fontSize: '0.82rem', margin: 0, fontStyle: 'italic' }}>{copy.partnership.sandraCurrent}</p>
              </div>
              <a href="https://linkedin.com/in/sandrahofstede" target="_blank" rel="noopener" style={{ display: 'inline-block', marginTop: '1rem', color: '#2D5A8B', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                linkedin.com/in/sandrahofstede →
              </a>
            </div>

            {/* Mark */}
            <div style={{ background: HDK.cream, border: `1px solid ${HDK.border}`, borderTop: `4px solid #2E7D5A`, borderRadius: 12, padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#2E7D5A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: HDK.white, fontWeight: 900, fontSize: '1.25rem', flexShrink: 0,
                }}>M</div>
                <div>
                  <h3 style={{ color: HDK.navy, fontWeight: 800, fontSize: '1.1rem', margin: '0 0 0.2rem' }}>Mark de Kock</h3>
                  <p style={{ color: '#2E7D5A', fontSize: '0.82rem', fontWeight: 600, margin: 0, fontStyle: 'italic' }}>{copy.partnership.markRole}</p>
                </div>
              </div>
              <p style={{ color: HDK.muted, fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1rem' }}>
                {copy.partnership.markBio}
              </p>
              <div style={{ borderTop: `1px solid ${HDK.border}`, paddingTop: '1rem' }}>
                <p style={{ color: '#2E7D5A', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.25rem' }}>{copy.partnership.markCurrentLabel}</p>
                <p style={{ color: HDK.muted, fontSize: '0.82rem', margin: 0, fontStyle: 'italic' }}>{copy.partnership.markCurrent}</p>
              </div>
              <a href="https://linkedin.com/in/markdekock" target="_blank" rel="noopener" style={{ display: 'inline-block', marginTop: '1rem', color: '#2E7D5A', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                linkedin.com/in/markdekock →
              </a>
            </div>

            {/* Wouter */}
            <div style={{ background: HDK.cream, border: `1px solid ${HDK.border}`, borderTop: `4px solid #8B3A5A`, borderRadius: 12, padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: '#8B3A5A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: HDK.white, fontWeight: 900, fontSize: '1.25rem', flexShrink: 0,
                }}>W</div>
                <div>
                  <h3 style={{ color: HDK.navy, fontWeight: 800, fontSize: '1.1rem', margin: '0 0 0.2rem' }}>Wouter Blok</h3>
                  <p style={{ color: '#8B3A5A', fontSize: '0.82rem', fontWeight: 600, margin: 0, fontStyle: 'italic' }}>{copy.partnership.wouterRole}</p>
                </div>
              </div>
              <p style={{ color: HDK.muted, fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1rem' }}>
                {copy.partnership.wouterBio}
              </p>
              <div style={{ borderTop: `1px solid ${HDK.border}`, paddingTop: '1rem' }}>
                <p style={{ color: '#8B3A5A', fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.25rem' }}>{copy.partnership.wouterCurrentLabel}</p>
                <p style={{ color: HDK.muted, fontSize: '0.82rem', margin: 0, fontStyle: 'italic' }}>{copy.partnership.wouterCurrent}</p>
              </div>
              <a href="https://linkedin.com/in/wouterblok" target="_blank" rel="noopener" style={{ display: 'inline-block', marginTop: '1rem', color: '#8B3A5A', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                linkedin.com/in/wouterblok →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section style={{ padding: '5rem 2rem', background: HDK.cream }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{copy.services.label}</p>
            <h2 style={{ color: HDK.navy, fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.5rem' }}>
              {copy.services.heading}
            </h2>
            <p style={{ color: HDK.muted, fontSize: '0.9rem' }}>{copy.services.sub}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {copy.services.phases.map((ph, i) => (
              <div key={ph.phase} style={{
                background: HDK.white,
                border: `1px solid ${HDK.border}`,
                borderRadius: 12,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ background: HDK.navy, padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ color: HDK.gold, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{ph.phase}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>{PHASE_TAGS[i]}</span>
                  </div>
                  <h3 style={{ color: HDK.white, fontWeight: 800, fontSize: '0.95rem', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{ph.title}</h3>
                  <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', margin: '0.35rem 0 0', fontStyle: 'italic' }}>{PHASE_PRICES[i]}</p>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <p style={{ color: HDK.muted, fontSize: '0.85rem', lineHeight: 1.55, margin: 0 }}>{ph.description}</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: 'auto' }}>
                    {ph.items.map(item => (
                      <li key={item} style={{ color: HDK.navy, fontSize: '0.8rem', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <span style={{ color: HDK.gold, flexShrink: 0 }}>✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: HDK.muted, fontSize: '0.8rem', fontStyle: 'italic' }}>
              {copy.services.vat}
            </p>
          </div>
        </div>
      </section>

      {/* ── WHEN TO CALL ── */}
      <section style={{ padding: '4rem 2rem', background: HDK.navyMid }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: HDK.gold, fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>{copy.whenToCall.label}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {copy.whenToCall.triggers.map(trigger => (
              <span key={trigger} style={{
                background: 'rgba(200,146,42,0.15)',
                border: `1px solid ${HDK.gold}`,
                color: HDK.white,
                padding: '0.45rem 1rem',
                borderRadius: 20,
                fontSize: '0.85rem',
                fontWeight: 500,
              }}>
                {trigger}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{
        padding: '5rem 2rem',
        background: `linear-gradient(135deg, ${HDK.navyDark} 0%, ${HDK.navyMid} 100%)`,
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ color: HDK.white, fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            {copy.finalCta.h2a}<br />
            <span style={{ color: HDK.gold }}>{copy.finalCta.h2b}</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            {copy.finalCta.sub}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/en/a/public"
              style={{
                display: 'inline-block',
                background: HDK.gold,
                color: HDK.navyDark,
                padding: '1rem 2.5rem',
                borderRadius: 8,
                fontSize: '1.05rem',
                fontWeight: 800,
                textDecoration: 'none',
                letterSpacing: '0.01em',
                boxShadow: '0 4px 24px rgba(200,146,42,0.35)',
              }}
            >
              {copy.finalCta.ctaMain}
            </a>
            <a
              href="mailto:mark@kirkandblackbeard.com"
              style={{
                display: 'inline-block',
                background: 'transparent',
                border: `2px solid rgba(255,255,255,0.3)`,
                color: HDK.white,
                padding: '1rem 2.25rem',
                borderRadius: 8,
                fontSize: '1.05rem',
                fontWeight: 700,
                textDecoration: 'none',
                letterSpacing: '0.01em',
              }}
            >
              {copy.finalCta.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: HDK.navyDark, borderTop: `3px solid ${HDK.gold}`, padding: '2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <p style={{ color: HDK.white, fontWeight: 800, fontSize: '0.95rem', margin: '0 0 0.2rem', letterSpacing: '-0.01em' }}>BLOK, HOFSTEDE &amp; DE KOCK</p>
            <p style={{ color: HDK.gold, fontSize: '0.78rem', margin: 0, fontStyle: 'italic' }}>{copy.footer.tagline}</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <a href="https://linkedin.com/in/wouterblok" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', textDecoration: 'none' }}>Wouter Blok · Aquasium</a>
            <a href="https://linkedin.com/in/sandrahofstede" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', textDecoration: 'none' }}>Sandra Hofstede</a>
            <a href="https://linkedin.com/in/markdekock" target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', textDecoration: 'none' }}>Mark de Kock · Kirk &amp; Blackbeard</a>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', margin: 0 }}>
            {copy.footer.poweredBy}
          </p>
        </div>
      </footer>
    </div>
  )
}
