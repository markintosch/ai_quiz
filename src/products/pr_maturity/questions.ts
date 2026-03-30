// FILE: src/products/pr_maturity/questions.ts
// ─── PR Volwassenheidsscan — 18 vragen · 6 dimensies ────────────────────────
//
// Doelgroep: organisaties die hun PR-volwassenheid willen meten.
// Aangeboden door: Mareille Prevo, PR & Communicatiestrateeg.
//
// Dimensies:
//   pr_strategy           PR Strategie & Beleid          (weight 0.20)
//   media_relations       Mediarelaties                  (weight 0.20)
//   messaging_positioning Boodschap & Positionering      (weight 0.20)
//   crisis_communication  Crisiscommunicatie             (weight 0.20)
//   content_visibility    Content & Zichtbaarheid        (weight 0.15)
//   internal_alignment    Interne Afstemming             (weight 0.05)
//
// 3 vragen per dimensie · alle lite: true (organisatiescan)

import type { Question } from '@/data/questions'

export const PR_QUESTIONS: Question[] = [

  // ── PR STRATEGIE & BELEID ────────────────────────────────────────────────────
  {
    code: 'PR1',
    dimension: 'pr_strategy' as Question['dimension'],
    text: 'In hoeverre heeft uw organisatie een expliciete, gedocumenteerde PR-strategie?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Er is geen PR-strategie aanwezig' },
      { value: 2, label: 'Er zijn losse ideeën, maar niets is vastgelegd' },
      { value: 3, label: 'We hebben een basisplan, maar het wordt niet structureel gevolgd' },
      { value: 4, label: 'We hebben een PR-strategie die regelmatig wordt geëvalueerd' },
      { value: 5, label: 'PR is volledig geïntegreerd in onze bredere bedrijfsstrategie' },
    ],
  },
  {
    code: 'PR2',
    dimension: 'pr_strategy' as Question['dimension'],
    text: 'Hoe ver vooruit plant uw organisatie PR-activiteiten?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'We reageren op het moment zelf — er is geen planning' },
      { value: 2, label: 'We plannen maximaal enkele weken vooruit' },
      { value: 3, label: 'We werken met een kwartaalplanning' },
      { value: 4, label: 'We plannen op jaarbasis met periodieke evaluatiemomenten' },
      { value: 5, label: 'We hebben een meerjarenplanning die aansluit op bedrijfsdoelen' },
    ],
  },
  {
    code: 'PR3',
    dimension: 'pr_strategy' as Question['dimension'],
    text: 'In hoeverre zijn uw PR-doelstellingen verbonden aan meetbare bedrijfsdoelstellingen?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Er zijn geen PR-doelstellingen geformuleerd' },
      { value: 2, label: "We hebben vage doelen, maar geen KPI's" },
      { value: 3, label: 'We meten sporadisch, maar niet structureel' },
      { value: 4, label: "We hebben duidelijke KPI's en meten regelmatig" },
      { value: 5, label: 'PR-resultaten zijn direct gekoppeld aan bedrijfsresultaten en worden structureel gerapporteerd' },
    ],
  },

  // ── MEDIARELATIES ─────────────────────────────────────────────────────────────
  {
    code: 'PR4',
    dimension: 'media_relations' as Question['dimension'],
    text: 'Hoe zou u de relatie van uw organisatie met relevante journalisten en media omschrijven?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'We hebben geen contacten met journalisten of media' },
      { value: 2, label: 'We sturen soms persberichten, maar kennen de journalisten niet persoonlijk' },
      { value: 3, label: 'We hebben contacten met enkele media, maar de relaties zijn oppervlakkig' },
      { value: 4, label: 'We onderhouden actieve relaties met meerdere relevante media en journalisten' },
      { value: 5, label: 'We worden door media proactief benaderd als expert of bron' },
    ],
  },
  {
    code: 'PR5',
    dimension: 'media_relations' as Question['dimension'],
    text: 'Hoe vaak plaatst uw organisatie proactief verhalen of nieuws in de media?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Vrijwel nooit — we wachten tot de media ons benaderen' },
      { value: 2, label: 'Zelden, hooguit een paar keer per jaar' },
      { value: 3, label: 'Een paar keer per kwartaal' },
      { value: 4, label: 'Maandelijks of vaker, met een duidelijk doel' },
      { value: 5, label: 'Structureel en frequent, als onderdeel van onze communicatiestrategie' },
    ],
  },
  {
    code: 'PR6',
    dimension: 'media_relations' as Question['dimension'],
    text: 'In hoeverre beschikt uw organisatie over een actuele medialijst en een helder woordvoerdersbeleid?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Er is geen medialijst en geen beleid voor woordvoering' },
      { value: 2, label: 'We hebben een verouderde lijst en onduidelijke afspraken over wie spreekt' },
      { value: 3, label: 'We hebben een basislijst en globale afspraken, maar niet formeel vastgelegd' },
      { value: 4, label: 'We hebben een actuele medialijst en duidelijke woordvoerdersafspraken' },
      { value: 5, label: 'Onze medialijst en woordvoerdersbeleid worden structureel bijgehouden en geoefend' },
    ],
  },

  // ── BOODSCHAP & POSITIONERING ─────────────────────────────────────────────────
  {
    code: 'PR7',
    dimension: 'messaging_positioning' as Question['dimension'],
    text: 'Hoe helder en consistent is de kernboodschap van uw organisatie gedefinieerd?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Er is geen vastgestelde kernboodschap' },
      { value: 2, label: 'Iedereen heeft zijn eigen versie van wat we doen en waar we voor staan' },
      { value: 3, label: 'Er is een boodschap, maar die wordt niet consequent gebruikt' },
      { value: 4, label: 'We hebben een duidelijke boodschap die intern bekend is' },
      { value: 5, label: 'Onze kernboodschap is scherp, intern verankerd en extern herkenbaar' },
    ],
  },
  {
    code: 'PR8',
    dimension: 'messaging_positioning' as Question['dimension'],
    text: 'In hoeverre spreken alle medewerkers een consistente boodschap naar buiten?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Iedereen zegt zijn eigen verhaal — er is geen afstemming' },
      { value: 2, label: 'Er zijn grote verschillen in hoe medewerkers over de organisatie praten' },
      { value: 3, label: 'Er is enige consistentie, maar ook regelmatig tegenstrijdige berichten' },
      { value: 4, label: 'Medewerkers kennen de boodschap en gebruiken deze grotendeels correct' },
      { value: 5, label: 'Onze medewerkers zijn echte ambassadeurs met een consistente en overtuigende stem' },
    ],
  },
  {
    code: 'PR9',
    dimension: 'messaging_positioning' as Question['dimension'],
    text: 'Hoe onderscheidend is de positionering van uw organisatie ten opzichte van concurrenten?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'We lijken sterk op onze concurrenten in hoe we communiceren' },
      { value: 2, label: 'Er zijn kleine verschillen, maar die zijn niet helder gecommuniceerd' },
      { value: 3, label: 'We hebben een eigen verhaal, maar het onderscheidt ons nog niet sterk genoeg' },
      { value: 4, label: 'Onze positionering is herkenbaar en onderscheidend' },
      { value: 5, label: 'We zijn de referentie in onze markt — klanten en media weten precies wat ons uniek maakt' },
    ],
  },

  // ── CRISISCOMMUNICATIE ────────────────────────────────────────────────────────
  {
    code: 'PR10',
    dimension: 'crisis_communication' as Question['dimension'],
    text: 'Heeft uw organisatie een actueel crisisplan voor communicatie bij onverwachte situaties?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Nee — we hebben nog nooit nagedacht over crisisprotocollen' },
      { value: 2, label: 'Er is iets op papier gezet, maar nooit geactualiseerd of getest' },
      { value: 3, label: 'We hebben een globaal plan, maar het is niet uitgewerkt voor alle scenario\'s' },
      { value: 4, label: 'We hebben een actueel crisisplan dat intern bekend is' },
      { value: 5, label: 'Ons crisisplan is gedetailleerd, actueel, geoefend én geëvalueerd na elke crisissituatie' },
    ],
  },
  {
    code: 'PR11',
    dimension: 'crisis_communication' as Question['dimension'],
    text: 'Is er een aangewezen en getrainde woordvoerder voor crisissituaties?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Nee — bij een crisis weten we niet wie er naar buiten treedt' },
      { value: 2, label: 'Er is iemand aangewezen, maar die is niet getraind of voorbereid' },
      { value: 3, label: 'We hebben een woordvoerder, maar de voorbereiding is beperkt' },
      { value: 4, label: 'Onze woordvoerder is aangewezen en heeft basistraining gehad' },
      { value: 5, label: 'Onze woordvoerder is professioneel getraind en oefent regelmatig met crisissimulaties' },
    ],
  },
  {
    code: 'PR12',
    dimension: 'crisis_communication' as Question['dimension'],
    text: 'In hoeverre is uw organisatie in staat om snel en correct te communiceren bij een incident of reputatiedreiging?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'We zouden in paniek raken en niet weten wat te doen' },
      { value: 2, label: 'We zouden wat doen, maar waarschijnlijk te laat en inconsistent' },
      { value: 3, label: 'We zouden kunnen reageren, maar het zou niet soepel verlopen' },
      { value: 4, label: 'We zijn redelijk voorbereid en zouden adequaat kunnen reageren' },
      { value: 5, label: 'We zijn volledig klaar: snelle besluitvorming, duidelijke boodschap, gecoördineerde uitvoering' },
    ],
  },

  // ── CONTENT & ZICHTBAARHEID ───────────────────────────────────────────────────
  {
    code: 'PR13',
    dimension: 'content_visibility' as Question['dimension'],
    text: 'Hoe actief produceert uw organisatie content die bijdraagt aan zichtbaarheid en reputatie?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Nauwelijks of nooit — we publiceren geen eigen content' },
      { value: 2, label: 'Sporadisch, zonder duidelijk plan of doel' },
      { value: 3, label: 'Soms, maar niet structureel of consistent' },
      { value: 4, label: 'Regelmatig, met een redactioneel plan en herkenbare stijl' },
      { value: 5, label: 'Structureel en strategisch — content is een kernonderdeel van onze PR-aanpak' },
    ],
  },
  {
    code: 'PR14',
    dimension: 'content_visibility' as Question['dimension'],
    text: 'In hoeverre bereikt uw organisatie de gewenste doelgroepen via eigen kanalen (website, social media, nieuwsbrief)?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'We weten niet of we de juiste mensen bereiken — we meten het niet' },
      { value: 2, label: 'We hebben kanalen, maar het bereik is beperkt en onze doelgroep weinig aanwezig' },
      { value: 3, label: 'We bereiken een deel van onze doelgroep, maar lang niet iedereen die we zouden willen' },
      { value: 4, label: 'We bereiken onze doelgroep goed via meerdere kanalen' },
      { value: 5, label: 'Onze kanalen zijn sterk ingericht op onze doelgroep met bewezen bereik en engagement' },
    ],
  },
  {
    code: 'PR15',
    dimension: 'content_visibility' as Question['dimension'],
    text: 'In hoeverre meet uw organisatie de effectiviteit van PR en communicatie-inspanningen?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'We meten niets — we hebben geen idee wat PR oplevert' },
      { value: 2, label: 'We kijken soms naar bereik of views, maar trekken er geen conclusies uit' },
      { value: 3, label: 'We meten sporadisch en gebruiken de data niet structureel' },
      { value: 4, label: "We hebben duidelijke KPI's en rapporteren hier periodiek over" },
      { value: 5, label: 'PR-resultaten zijn volledig meetbaar en direct gekoppeld aan bedrijfsdoelstellingen' },
    ],
  },

  // ── INTERNE AFSTEMMING ────────────────────────────────────────────────────────
  {
    code: 'PR16',
    dimension: 'internal_alignment' as Question['dimension'],
    text: 'In hoeverre is de directie actief betrokken bij en draagt zij de PR-strategie actief uit?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'De directie bemoeit zich nauwelijks met PR en communicatie' },
      { value: 2, label: 'Er is beperkte betrokkenheid, maar geen actieve rol' },
      { value: 3, label: 'De directie is op de hoogte en geeft incidenteel richting' },
      { value: 4, label: 'De directie is actief betrokken en ondersteunt PR-initiatieven' },
      { value: 5, label: 'De directie is een actieve ambassador die de strategie uitdraagt en versterkt' },
    ],
  },
  {
    code: 'PR17',
    dimension: 'internal_alignment' as Question['dimension'],
    text: 'In hoeverre zijn medewerkers op de hoogte van de communicatiestrategie en hun eigen rol daarin?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Medewerkers weten niets van een communicatiestrategie' },
      { value: 2, label: 'Enkelen zijn op de hoogte, maar het is geen gedeeld bewustzijn' },
      { value: 3, label: 'Er is globale bekendheid, maar weinig gevoel voor de eigen rol' },
      { value: 4, label: 'Medewerkers zijn goed geïnformeerd en weten hoe zij bijdragen' },
      { value: 5, label: 'Onze medewerkers zijn echte communicatie-ambassadeurs met een gedeeld verhaal' },
    ],
  },
  {
    code: 'PR18',
    dimension: 'internal_alignment' as Question['dimension'],
    text: 'In hoeverre zijn marketing, sales en communicatie intern op één lijn?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Er is nauwelijks afstemming — de afdelingen werken in silo\'s' },
      { value: 2, label: 'Er is occasioneel overleg, maar geen structurele samenwerking' },
      { value: 3, label: 'We stemmen regelmatig af, maar de integratie is nog onvolledig' },
      { value: 4, label: 'Marketing, sales en communicatie zijn goed op elkaar afgestemd' },
      { value: 5, label: 'We werken volledig geïntegreerd — één verhaal, één aanpak, meetbare gezamenlijke resultaten' },
    ],
  },
]
