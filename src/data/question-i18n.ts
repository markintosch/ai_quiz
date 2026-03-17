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

export const FR: QuestionI18nMap = {
  SV1: {
    text: "Quelle place occupe l'IA dans la stratégie actuelle de votre entreprise ?",
    options: [
      "Pas du tout à l'ordre du jour",
      'Discutée occasionnellement, mais sans plans concrets',
      'Intégrée à la stratégie dans certains domaines',
      'Activement intégrée dans la planification stratégique',
      "Au cœur de notre façon d'opérer et de rivaliser",
    ],
  },
  SV2: {
    text: "Comment décririez-vous l'engagement de la direction envers l'adoption de l'IA ?",
    options: [
      'Aucun intérêt visible de la part de la direction',
      'Sensibilisation sans sponsorship dédié',
      'Un ou deux sponsors seniors activement impliqués',
      'Adhésion large de la direction avec ressources allouées',
      "L'IA est une priorité au niveau du conseil d'administration avec un investissement dédié",
    ],
  },
  SV3: {
    text: "Votre organisation dispose-t-elle d'une feuille de route ou d'un plan de déploiement IA défini ?",
    options: [
      "Aucune feuille de route n'existe",
      'En cours de rédaction mais pas encore finalisée',
      "Existe pour des départements ou cas d'usage spécifiques",
      "Feuille de route à l'échelle de l'entreprise avec des jalons clairs",
      'Feuille de route vivante, activement revue et mise à jour chaque trimestre',
    ],
  },
  SV4: {
    text: 'Dans quelle mesure la vision IA est-elle alignée entre les départements ?',
    options: [
      'Chaque département agit de son côté',
      "Une certaine sensibilisation mais pas d'alignement formel",
      'Alignement partiel dans certains domaines',
      "Coordination interdépartementale régulière sur l'IA",
      'Stratégie IA pleinement alignée dans tous les départements',
    ],
  },
  UA1: {
    text: "À quelle fréquence utilisez-vous personnellement des outils d'IA dans votre travail ?",
    options: [
      'Jamais',
      'Rarement — quelques fois par mois',
      'Mensuellement — utilisation occasionnelle',
      'Hebdomadairement — utilisation régulière',
      'Quotidiennement — intégré à mon flux de travail standard',
    ],
  },
  UA2: {
    text: "Dans quelle mesure les outils d'IA sont-ils utilisés dans votre organisation ?",
    options: [
      'Seuls quelques individus expérimentent de manière indépendante',
      'Uniquement dans des équipes ou départements spécifiques',
      'La plupart des départements ont un certain usage',
      "Adoption à l'échelle de l'entreprise avec une profondeur variable",
      "Utilisation structurée à l'échelle de l'organisation avec mesure des résultats",
    ],
  },
  UA3: {
    text: "Comment décririez-vous la maturité de l'utilisation de l'IA dans votre organisation ?",
    options: [
      'Purement expérimentale — aucune approche structurée',
      "Quelques cas d'usage prouvés mais non déployés à l'échelle",
      "Plusieurs cas d'usage en production",
      "L'IA est intégrée dans les processus métier clés",
      "L'IA est au cœur de notre avantage concurrentiel",
    ],
  },
  UA4: {
    text: "Quels outils d'IA sont actuellement utilisés dans votre organisation ?",
    options: [
      'ChatGPT / OpenAI',
      'Claude (Anthropic)',
      'Microsoft Copilot',
      'Google Gemini',
      'Notion AI',
      'Midjourney / DALL·E',
      'Salesforce Einstein / HubSpot AI',
      'GitHub Copilot',
      'Outils IA internes sur mesure',
      'Autre',
      'Aucun',
    ],
  },
  DR1: {
    text: 'Quelle description correspond le mieux à la situation des données dans votre organisation ?',
    options: [
      'Les données sont dispersées entre les systèmes et difficiles d\'accès',
      'Les données sont disponibles mais mal structurées',
      'Des données propres existent dans certains domaines',
      'La plupart des données sont structurées et accessibles',
      'Infrastructure de données mature avec une gouvernance en place',
    ],
  },
  DR2: {
    text: 'Dans quelle mesure la gouvernance des données est-elle assurée dans votre organisation ?',
    options: [
      'Aucune pratique de gouvernance des données',
      'Pratiques ad hoc sans politique formelle',
      'Certaine gouvernance dans les domaines clés',
      'Politique formelle de gouvernance des données avec propriété définie',
      'Gouvernance mature avec catalogue de données, traçabilité et suivi de qualité',
    ],
  },
  DR3: {
    text: 'Comment évaluez-vous la qualité des données dans votre organisation ?',
    options: [
      'Les données sont souvent incomplètes, dupliquées ou peu fiables',
      'La qualité varie considérablement selon les sources',
      'Qualité acceptable dans les systèmes principaux',
      'Qualité élevée et constante dans la plupart des domaines',
      'La qualité des données est activement surveillée et appliquée',
    ],
  },
  DR4: {
    text: "Vos équipes peuvent-elles accéder aux données dont elles ont besoin pour les cas d'usage IA ?",
    options: [
      'Obstacles importants — l\'accès est lent et bureaucratique',
      "Possible mais nécessite l'intervention de l'IT à chaque fois",
      'Accès en libre-service disponible pour certaines équipes',
      'La plupart des équipes ont un accès direct aux données pertinentes',
      "Accès aux données en libre-service et sans friction dans toute l'organisation",
    ],
  },
  TC1: {
    text: "Comment décririez-vous l'attitude générale de votre équipe envers l'IA ?",
    options: [
      "Résistance ou sentiment de menace face à l'IA",
      'Prudence — observation sans engagement actif',
      'Curiosité — disposition à expérimenter',
      'Enthousiasme — exploration active',
      "Confiance — la maîtrise de l'IA est une attente de l'équipe",
    ],
  },
  TC2: {
    text: "Comment évaluez-vous le niveau général de littératie IA dans votre organisation ?",
    options: [
      "Très faible — la plupart des collaborateurs n'ont aucune connaissance en IA",
      'Faible — quelques individus compétents en IA',
      'En croissance — des formations sont en cours dans certains domaines',
      'Bon — montée en compétences structurée en place',
      "Élevé — les compétences IA font partie des attentes de poste dans toute l'organisation",
    ],
  },
  TC3: {
    text: "Les outils d'IA font-ils partie du programme d'intégration standard des nouveaux collaborateurs ?",
    options: [
      'Non, pas du tout',
      'Mentionnés mais pas de manière structurée',
      'Des orientations de base sont incluses',
      "Les outils IA sont activement présentés et formés lors de l'intégration",
      "Module d'intégration IA complet avec exercices pratiques",
    ],
  },
  TC4: {
    text: "Dans quelle mesure les outils d'IA sont-ils utilisés par l'ensemble de vos collaborateurs ?",
    options: [
      'Seuls quelques individus expérimentent de manière indépendante',
      'Uniquement dans des équipes ou départements spécifiques',
      'La plupart des départements ont un certain usage',
      "Adoption à l'échelle de l'entreprise avec une profondeur variable",
      "Adoption structurée à l'échelle de l'organisation avec mesure active",
    ],
  },
  TC5: {
    text: "Votre organisation investit-elle dans la montée en compétences ou des programmes de formation en IA ?",
    options: [
      'Aucun investissement dans ce domaine',
      'Ad hoc — les collaborateurs se forment seuls sur leur temps libre',
      'Certaines formations d\'équipe ou de département disponibles',
      'Programme de formation structuré en place',
      'Culture d\'apprentissage continu avec budget dédié à la formation IA',
    ],
  },
  TC6: {
    text: "Dans quelle mesure les collaborateurs se sentent-ils en sécurité psychologique pour expérimenter avec les outils d'IA ?",
    options: [
      "La peur de l'échec ou du jugement empêche l'expérimentation",
      "L'expérimentation est tolérée mais pas encouragée",
      "Généralement sûr d'essayer de nouvelles choses",
      "L'expérimentation est activement encouragée",
      "L'échec est célébré comme apprentissage — l'innovation est récompensée",
    ],
  },
  GR1: {
    text: "Votre organisation a-t-elle défini des politiques ou des garde-fous pour l'utilisation de l'IA par les collaborateurs ?",
    options: [
      "Aucune politique n'existe",
      'En cours de discussion mais rien de formel',
      'Des lignes directrices informelles sont en place',
      "Une politique formelle d'utilisation de l'IA existe",
      'Cadre de gouvernance complet incluant éthique, protection des données et conformité',
    ],
  },
  GR2: {
    text: "Comment votre organisation gère-t-elle les risques liés à la confidentialité des données et à la sécurité de l'IA ?",
    options: [
      "Non traité — nous n'y avons pas réfléchi",
      "Sensibilisation aux risques mais pas d'approche formelle",
      'Certains contrôles dans des domaines spécifiques',
      'Cadre de gestion des risques formel avec revue régulière',
      "Gestion des risques intégrée avec surveillance et pistes d'audit",
    ],
  },
  GR3: {
    text: "Les collaborateurs savent-ils ce qui est autorisé ou non en matière d'utilisation de l'IA ?",
    options: [
      "Aucune directive n'a été communiquée",
      'Sensibilisation minimale — pas de communication formelle',
      'Des directives existent mais la sensibilisation est inégale',
      'La plupart des collaborateurs connaissent les règles principales',
      'Politique claire et bien communiquée — les collaborateurs savent exactement ce qui est permis',
    ],
  },
  GR4: {
    text: "Comment votre organisation aborde-t-elle l'éthique de l'IA ?",
    options: [
      'Pas prise en compte',
      'Sensibilisation informelle mais pas de cadre',
      'Principes éthiques définis mais non opérationnalisés',
      "Cadre éthique intégré dans le développement et l'achat d'IA",
      'Gouvernance éthique active incluant revues de biais et audits de modèles',
    ],
  },
  GR5: {
    text: "Comment les outils d'IA sont-ils évalués avant d'être approuvés pour utilisation ?",
    options: [
      'Pas de processus d\'évaluation — les collaborateurs choisissent leurs propres outils',
      'Évaluation ad hoc au cas par cas',
      "Checklist de base ou processus d'approbation en place",
      'Évaluation structurée des fournisseurs couvrant sécurité et conformité',
      "Processus d'achat rigoureux avec surveillance continue des outils approuvés",
    ],
  },
  OA1: {
    text: "Avec quelle clarté pouvez-vous identifier où l'IA crée le plus de valeur dans votre organisation ?",
    options: [
      "Nous n'avons pas cartographié les opportunités IA",
      'Impression vague du potentiel mais aucun cas d\'usage identifié',
      "Quelques cas d'usage identifiés mais non priorisés",
      "Cartographie claire des cas d'usage avec opportunités priorisées",
      'Cartographie des opportunités continuellement mise à jour avec suivi du ROI',
    ],
  },
  OA2: {
    text: 'Où voyez-vous la plus grande opportunité IA dans votre organisation ?',
    options: [
      'Ventes',
      'Marketing',
      'Produit',
      'Opérations',
      'Finance',
      'RH',
      'Service client',
      'IT',
      'Prise de décision stratégique',
      'Autre',
    ],
  },
  OA3: {
    text: "Dans quelle mesure votre équipe de direction est-elle alignée sur les priorités d'investissement en IA ?",
    options: [
      'Pas de vision partagée — chacun a un avis différent',
      'Certain alignement mais des désaccords significatifs subsistent',
      'Large consensus sur 1 à 2 domaines prioritaires',
      "Priorités partagées claires avec adhésion de l'équipe de direction",
      'Thèse d\'investissement pleinement alignée avec des KPI définis par domaine',
    ],
  },
}

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
