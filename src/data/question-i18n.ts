// Localized question text and answer labels.
// EN is the canonical source in questions.ts — this file contains NL and FR overrides.
// When a locale is not found here, the component falls back to the EN text.

export interface QuestionTranslation {
  text: string
  options: string[] // ordered labels matching the options array in questions.ts
}

export type QuestionI18nMap = Record<string, QuestionTranslation>

// ── Dutch (NL) ────────────────────────────────────────────────────────────────

export const NL: QuestionI18nMap = {
  SV1: {
    text: 'Hoe centraal staat AI in de huidige strategie van jullie organisatie?',
    options: [
      'Staat helemaal niet op de agenda',
      'Wordt af en toe besproken, maar zonder concrete plannen',
      'Onderdeel van de strategie op sommige gebieden',
      'Actief geïntegreerd in de strategische planning',
      'Centraal in hoe we opereren en concurreren',
    ],
  },
  SV2: {
    text: 'Hoe zou je de betrokkenheid van het leiderschap bij AI-adoptie omschrijven?',
    options: [
      'Geen zichtbare interesse vanuit het leiderschap',
      'Bewustzijn, maar geen toegewijd sponsorship',
      'Eén of twee senior sponsors zijn actief betrokken',
      'Breed draagvlak bij het leiderschap met toegewezen middelen',
      'AI is een bestuursprioriteit met dedicated investering',
    ],
  },
  SV3: {
    text: 'Heeft jullie organisatie een vastgestelde AI-roadmap of implementatieplan?',
    options: [
      'Er is geen roadmap',
      'Wordt opgesteld maar is nog niet definitief',
      'Bestaat voor specifieke afdelingen of use cases',
      'Bedrijfsbrede roadmap met duidelijke mijlpalen',
      'Levende roadmap die actief per kwartaal wordt herzien en bijgewerkt',
    ],
  },
  SV4: {
    text: 'Hoe goed is de AI-visie afgestemd tussen afdelingen?',
    options: [
      'Iedere afdeling doet zijn eigen ding',
      'Enig bewustzijn, maar geen formele afstemming',
      'Gedeeltelijke afstemming op sommige gebieden',
      'Regelmatige afdelingsoverstijgende coördinatie rondom AI',
      'Volledig afgestemde AI-strategie over alle afdelingen',
    ],
  },
  UA1: {
    text: 'Hoe vaak gebruik je zelf AI-tools in je werk?',
    options: [
      'Nooit',
      'Zelden — een paar keer per maand',
      'Maandelijks — incidenteel gebruik',
      'Wekelijks — regelmatig gebruik',
      'Dagelijks — onderdeel van mijn standaard werkwijze',
    ],
  },
  UA2: {
    text: 'Hoe breed worden AI-tools ingezet binnen jullie organisatie?',
    options: [
      'Slechts enkele individuen experimenteren op eigen initiatief',
      'Alleen specifieke teams of afdelingen',
      'De meeste afdelingen gebruiken het in enige mate',
      'Bedrijfsbrede adoptie met wisselende diepgang',
      'Gestructureerd, organisatiebreed gebruik met meetbare resultaten',
    ],
  },
  UA3: {
    text: 'Hoe zou je de volwassenheid van AI-gebruik in jullie organisatie omschrijven?',
    options: [
      'Puur experimenteel — geen gestructureerde aanpak',
      'Enkele use cases bewezen maar niet opgeschaald',
      'Meerdere use cases draaien in productie',
      'AI is ingebed in belangrijke bedrijfsprocessen',
      'AI is centraal in ons concurrentievoordeel',
    ],
  },
  UA4: {
    text: 'Welke AI-tools worden momenteel gebruikt in jullie organisatie?',
    options: [
      'ChatGPT / OpenAI',
      'Claude (Anthropic)',
      'Microsoft Copilot',
      'Google Gemini',
      'Notion AI',
      'Midjourney / DALL·E',
      'Salesforce Einstein / HubSpot AI',
      'GitHub Copilot',
      'Eigen interne AI-tools',
      'Anders',
      'Geen',
    ],
  },
  DR1: {
    text: 'Wat beschrijft de datasituatie van jullie organisatie het best?',
    options: [
      'Data is verspreid over systemen en moeilijk toegankelijk',
      'Data is beschikbaar maar slecht gestructureerd',
      'Schone data bestaat op sommige gebieden',
      'De meeste data is gestructureerd en toegankelijk',
      'Volwassen data-infrastructuur met governance op orde',
    ],
  },
  DR2: {
    text: 'Hoe goed is de data governance binnen jullie organisatie geregeld?',
    options: [
      'Geen data governance aanwezig',
      'Ad hoc werkwijzen zonder formeel beleid',
      'Enige governance op belangrijke gebieden',
      'Formeel data governance-beleid en eigenaarschap gedefinieerd',
      'Volwassen governance met datacatalogus, lineage en kwaliteitsbewaking',
    ],
  },
  DR3: {
    text: 'Hoe beoordeel je de datakwaliteit binnen jullie organisatie?',
    options: [
      'Data is vaak onvolledig, gedupliceerd of onbetrouwbaar',
      'Kwaliteit verschilt sterk per bron',
      'Acceptabele kwaliteit in de kernsystemen',
      'Consistent hoge kwaliteit op de meeste gebieden',
      'Datakwaliteit wordt actief gemonitord en gehandhaafd',
    ],
  },
  DR4: {
    text: 'Kunnen jullie teams de data benaderen die ze nodig hebben voor AI-toepassingen?',
    options: [
      'Aanzienlijke drempels — toegang is traag en bureaucratisch',
      'Mogelijk, maar vereist elke keer betrokkenheid van IT',
      'Self-service toegang beschikbaar voor sommige teams',
      'De meeste teams hebben directe toegang tot relevante data',
      'Drempelloze self-service datatoegang in de hele organisatie',
    ],
  },
  TC1: {
    text: 'Hoe zou je de algemene houding van je team ten opzichte van AI omschrijven?',
    options: [
      'Weerstand of gevoel van bedreiging door AI',
      'Voorzichtig — afwachtend maar niet actief betrokken',
      'Nieuwsgierig — bereid om te experimenteren',
      'Enthousiast — actief aan het verkennen',
      'Zelfverzekerd — AI-vaardigheid is een teamverwachting',
    ],
  },
  TC2: {
    text: 'Hoe beoordeel je de algemene AI-geletterdheid binnen jullie organisatie?',
    options: [
      'Zeer laag — de meeste mensen hebben geen AI-kennis',
      'Laag — een paar AI-vaardige individuen',
      'Groeiend — training is onderweg op sommige gebieden',
      'Goed — gestructureerde bijscholing is ingericht',
      'Hoog — AI-vaardigheden zijn onderdeel van rolverwachtingen in de hele organisatie',
    ],
  },
  TC3: {
    text: 'Maakt AI-tooling onderdeel uit van het standaard onboardingprogramma voor nieuwe medewerkers?',
    options: [
      'Nee, helemaal niet',
      'Wordt genoemd maar niet gestructureerd',
      'Basisrichtlijnen zijn opgenomen',
      'AI-tools worden actief geïntroduceerd en getraind tijdens onboarding',
      'Volledige AI-onboardingmodule met hands-on oefening',
    ],
  },
  TC4: {
    text: 'Hoe breed worden AI-tools ingezet onder jullie medewerkers?',
    options: [
      'Slechts enkele individuen experimenteren op eigen initiatief',
      'Alleen specifieke teams of afdelingen',
      'De meeste afdelingen gebruiken het in enige mate',
      'Bedrijfsbrede adoptie met wisselende diepgang',
      'Gestructureerde, organisatiebrede adoptie met actieve meting',
    ],
  },
  TC5: {
    text: "Investeert jullie organisatie in AI-bijscholing of trainingsprogramma's?",
    options: [
      'Geen investering op dit gebied',
      'Ad hoc — medewerkers trainen zichzelf in eigen tijd',
      'Enige team- of afdelingstraining beschikbaar',
      'Gestructureerd trainingsprogramma ingericht',
      'Continue leercultuur met dedicated AI-leerbudget',
    ],
  },
  TC6: {
    text: 'Hoe psychologisch veilig voelen medewerkers zich bij het experimenteren met AI-tools?',
    options: [
      'Angst voor falen of oordeel verhindert experimenteren',
      'Experimenteren wordt getolereerd maar niet gestimuleerd',
      'Over het algemeen veilig om nieuwe dingen te proberen',
      'Experimenteren wordt actief aangemoedigd',
      'Falen wordt gevierd als leermoment — innovatie wordt beloond',
    ],
  },
  GR1: {
    text: 'Heeft jullie organisatie vastgesteld beleid of kaders voor AI-gebruik door medewerkers?',
    options: [
      'Er is geen beleid',
      'Wordt besproken maar nog niets formeels',
      'Informele richtlijnen zijn aanwezig',
      'Formeel AI-gebruiksbeleid bestaat',
      'Uitgebreid governance-raamwerk inclusief ethiek, dataprivacy en compliance',
    ],
  },
  GR2: {
    text: "Hoe gaat jullie organisatie om met AI-gerelateerde dataprivacy- en beveiligingsrisico's?",
    options: [
      'Niet geadresseerd — we hebben hier niet over nagedacht',
      'Bewustzijn van risico\'s maar geen formele aanpak',
      'Enkele beheersmaatregelen op specifieke gebieden',
      'Formeel risicoraamwerk met regelmatige review',
      'Ingebed risicomanagement met monitoring en audittrails',
    ],
  },
  GR3: {
    text: 'Zijn medewerkers op de hoogte van wat wel en niet is toegestaan bij AI-gebruik?',
    options: [
      'Er is geen richtlijn gecommuniceerd',
      'Minimaal bewustzijn — geen formele communicatie',
      'Richtlijnen bestaan maar het bewustzijn is wisselend',
      'De meeste medewerkers kennen de belangrijkste regels',
      'Helder, goed gecommuniceerd beleid — medewerkers weten precies wat is toegestaan',
    ],
  },
  GR4: {
    text: 'Hoe gaat jullie organisatie om met AI-ethiek?',
    options: [
      'Wordt niet overwogen',
      'Informeel bewustzijn maar geen raamwerk',
      'Ethische principes gedefinieerd maar niet geoperationaliseerd',
      'Ethisch raamwerk ingebed in AI-ontwikkeling en -inkoop',
      'Actieve ethische governance inclusief bias-reviews en modelaudits',
    ],
  },
  GR5: {
    text: 'Hoe worden AI-tools geëvalueerd voordat ze worden goedgekeurd voor gebruik?',
    options: [
      'Geen evaluatieproces — medewerkers kiezen hun eigen tools',
      'Ad hoc beoordeling per geval',
      'Basischecklist of goedkeuringsproces aanwezig',
      'Gestructureerde leveranciersbeoordeling op beveiliging en compliance',
      'Rigoureus inkoopproces met doorlopende monitoring van goedgekeurde tools',
    ],
  },
  OA1: {
    text: 'Hoe duidelijk kun je verwoorden waar AI de meeste waarde creëert in jullie organisatie?',
    options: [
      'We hebben AI-kansen niet in kaart gebracht',
      'Vaag gevoel van potentieel maar geen specifieke use cases geïdentificeerd',
      'Enkele use cases geïdentificeerd maar niet geprioriteerd',
      'Duidelijke use case-kaart met geprioriteerde kansen',
      'Continu bijgewerkte kansenkaart met ROI-tracking',
    ],
  },
  OA2: {
    text: 'Waar zie je de grootste AI-kans binnen jullie organisatie?',
    options: [
      'Sales',
      'Marketing',
      'Product',
      'Operations',
      'Finance',
      'HR',
      'Klantenservice',
      'IT',
      'Strategische besluitvorming',
      'Anders',
    ],
  },
  OA3: {
    text: 'Hoe eensgezind is jullie leiderschapsteam over waar AI-investeringen op gericht moeten zijn?',
    options: [
      'Geen gedeelde visie — iedereen heeft een andere mening',
      'Enige afstemming maar significante onenigheid blijft',
      'Brede consensus over 1–2 prioriteitsgebieden',
      'Duidelijke gedeelde prioriteiten met draagvlak in het leiderschapsteam',
      "Volledig afgestemde investeringsthese met gedefinieerde KPI's per gebied",
    ],
  },
}

// ── French (FR) ───────────────────────────────────────────────────────────────
// Placeholder — to be filled once FR translation is received
export const FR: QuestionI18nMap = {}

// ── Dimension labels per locale ───────────────────────────────────────────────
export const DIMENSION_LABELS: Record<string, Record<string, string>> = {
  en: {
    strategy_vision:       'Strategy & Vision',
    current_usage:         'Current Usage',
    data_readiness:        'Data Readiness',
    talent_culture:        'Talent & Culture',
    governance_risk:       'Governance & Risk',
    opportunity_awareness: 'Opportunity Awareness',
  },
  nl: {
    strategy_vision:       'Strategie & Visie',
    current_usage:         'Huidig gebruik',
    data_readiness:        'Data-gereedheid',
    talent_culture:        'Talent & Cultuur',
    governance_risk:       'Governance & Risico',
    opportunity_awareness: 'Kansenbewustzijn',
  },
  fr: {
    strategy_vision:       'Stratégie & Vision',
    current_usage:         'Utilisation actuelle',
    data_readiness:        'Maturité des données',
    talent_culture:        'Talent & Culture',
    governance_risk:       'Gouvernance & Risque',
    opportunity_awareness: "Conscience des opportunités",
  },
}

// ── Helper ────────────────────────────────────────────────────────────────────

const LOCALE_MAP: Record<string, QuestionI18nMap> = { nl: NL, fr: FR }

/**
 * Returns localized text + option labels for a question.
 * Falls back to EN values when no translation exists.
 */
export function localizeQuestion(
  code: string,
  enText: string,
  enOptionLabels: string[],
  locale: string
): { text: string; optionLabels: string[] } {
  const map = LOCALE_MAP[locale]
  const t = map?.[code]
  if (!t) return { text: enText, optionLabels: enOptionLabels }
  return {
    text: t.text,
    optionLabels: t.options.length === enOptionLabels.length ? t.options : enOptionLabels,
  }
}

/**
 * Returns the localized dimension label, falling back to EN.
 */
export function localizeDimension(dimension: string, locale: string): string {
  return DIMENSION_LABELS[locale]?.[dimension]
    ?? DIMENSION_LABELS['en']?.[dimension]
    ?? dimension
}
