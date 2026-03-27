// FILE: src/products/utrechtzorg/questions.ts
// ─── Zorgmarkt Readiness Assessment — 24 vragen over 6 dimensies ─────────────
//
// 4 vragen per dimensie. Eerste vraag per dimensie heeft lite=true.
// Alle vragen zijn type='likert', scored=true.
//
// Dimensies:
//   personeel_veerkracht   Personeel & Veerkracht       (weight 0.20)
//   informele_zorg         Informele Zorg & Netwerk     (weight 0.18)
//   digitale_ai_adoptie    Digitale & AI Adoptie        (weight 0.16)
//   ketenregie             Ketenregie & Samenwerking    (weight 0.18)
//   financiele_veerkracht  Financiële Veerkracht        (weight 0.16)
//   governance_veranderen  Governance & Verandervermogen (weight 0.12)

import type { Question } from '@/data/questions'

export const ZORG_QUESTIONS: Question[] = [

  // ── PERSONEEL & VEERKRACHT ───────────────────────────────────────────────────
  {
    code: 'PV1',
    dimension: 'personeel_veerkracht' as Question['dimension'],
    text: 'Hoe groot is de bezettingsdruk op uw medewerkers op dit moment?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Structureel onderbezetting — medewerkers werken consequent onder hoge druk' },
      { value: 2, label: 'Regelmatige tekorten die afgedekt worden met overwerk of inhuur' },
      { value: 3, label: 'Bezetting is acceptabel maar kwetsbaar bij ziekte of verloop' },
      { value: 4, label: 'Bezetting is stabiel met beperkte piekdruk' },
      { value: 5, label: 'Goede bezetting met ruimte voor ontwikkeling en doorstroom' },
    ],
  },
  {
    code: 'PV2',
    dimension: 'personeel_veerkracht' as Question['dimension'],
    text: 'Hoe hoog is het personeelsverloop in uw organisatie vergeleken met voorgaande jaren?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Sterk gestegen — verloop vormt een structureel risico' },
      { value: 2, label: 'Verhoogd — er zijn meer vertrekkers dan gewenst' },
      { value: 3, label: 'Stabiel op een niveau dat licht boven het sectorgemiddelde ligt' },
      { value: 4, label: 'Op of onder het sectorgemiddelde' },
      { value: 5, label: 'Laag verloop — medewerkers zijn langdurig betrokken' },
    ],
  },
  {
    code: 'PV3',
    dimension: 'personeel_veerkracht' as Question['dimension'],
    text: 'In welke mate lukt het om gekwalificeerde nieuwe medewerkers te vinden en aan te trekken?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Vacatures staan lang open of worden niet ingevuld met de gewenste kwalificaties' },
      { value: 2, label: 'Werving lukt maar kost veel tijd en vraagt frequent om compromissen' },
      { value: 3, label: 'We vullen de meeste functies in maar de markt is krap en uitdagend' },
      { value: 4, label: 'Werving verloopt redelijk goed dankzij actief arbeidsmarktbeleid' },
      { value: 5, label: 'We trekken structureel de juiste mensen aan en zijn een aantrekkelijke werkgever' },
    ],
  },
  {
    code: 'PV4',
    dimension: 'personeel_veerkracht' as Question['dimension'],
    text: 'Hoe is de werkbeleving en betrokkenheid van medewerkers in uw organisatie?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Veel signalen van overbelasting, uitstroom en laag moreel' },
      { value: 2, label: 'Werkbeleving staat onder druk — medewerkers geven aan moeite te hebben met de werkdruk' },
      { value: 3, label: 'Gemengd beeld — er zijn positieve signalen maar ook zorgen' },
      { value: 4, label: 'Over het algemeen positief — medewerkers voelen zich gewaardeerd' },
      { value: 5, label: 'Hoge betrokkenheid en werkplezier — medewerkers bevelen de organisatie actief aan' },
    ],
  },

  // ── INFORMELE ZORG & NETWERK ─────────────────────────────────────────────────
  {
    code: 'IZ1',
    dimension: 'informele_zorg' as Question['dimension'],
    text: 'In welke mate werkt uw organisatie structureel samen met mantelzorgers?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Mantelzorgers worden niet of nauwelijks betrokken bij zorgplannen' },
      { value: 2, label: 'Informeel contact maar geen gestructureerde samenwerking' },
      { value: 3, label: 'Mantelzorgers worden geïnformeerd en incidenteel betrokken' },
      { value: 4, label: 'Structurele afstemming met mantelzorgers als onderdeel van het zorgproces' },
      { value: 5, label: 'Mantelzorgers zijn volwaardige partners in zorgplanning en uitvoering' },
    ],
  },
  {
    code: 'IZ2',
    dimension: 'informele_zorg' as Question['dimension'],
    text: 'Hoe actief is de samenwerking met welzijnsorganisaties en buurtinitiatieven?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen structurele verbinding met welzijn of buurtinitiatieven' },
      { value: 2, label: 'Sporadisch contact bij doorverwijzingen' },
      { value: 3, label: 'Regelmatig overleg maar nog niet structureel samenwerken' },
      { value: 4, label: 'Actieve samenwerkingsverbanden met welzijnspartners en buurtnetwerken' },
      { value: 5, label: 'Geïntegreerde samenwerking — welzijn en zorg worden als één geheel aangeboden' },
    ],
  },
  {
    code: 'IZ3',
    dimension: 'informele_zorg' as Question['dimension'],
    text: 'In welke mate zijn wijkteams betrokken bij de zorg rondom uw cliënten?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Nauwelijks contact met wijkteams' },
      { value: 2, label: 'Doorverwijzingen maar geen actieve samenwerking' },
      { value: 3, label: 'Regelmatig overleg voor complexe cliëntsituaties' },
      { value: 4, label: 'Structurele afstemming — wijkteams en zorgorganisatie werken goed samen' },
      { value: 5, label: 'Gedeelde cliëntverantwoordelijkheid met wijkteams op basis van gedeelde dossiers' },
    ],
  },
  {
    code: 'IZ4',
    dimension: 'informele_zorg' as Question['dimension'],
    text: 'Hoe goed is de afstemming tussen formele en informele zorgnetwerken rondom individuele cliënten?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Formeel en informeel werken langs elkaar heen' },
      { value: 2, label: 'Afstemming vindt ad hoc plaats bij escalaties' },
      { value: 3, label: 'Regelmatige afstemming maar niet systematisch' },
      { value: 4, label: 'Netwerkoverzichten en afstemming zijn onderdeel van de zorgplanning' },
      { value: 5, label: 'Naadloze samenwerking — formeel en informeel zijn geïntegreerd rondom de cliënt' },
    ],
  },

  // ── DIGITALE & AI ADOPTIE ────────────────────────────────────────────────────
  {
    code: 'DA1',
    dimension: 'digitale_ai_adoptie' as Question['dimension'],
    text: 'In welke mate gebruikt uw organisatie zorgtechnologie om de zorgverlening te ondersteunen?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Minimaal gebruik — papier en basale systemen domineren' },
      { value: 2, label: 'Basis ECD in gebruik maar beperkt benut' },
      { value: 3, label: 'Zorgtechnologie ingezet voor kernprocessen' },
      { value: 4, label: 'Actief gebruik van meerdere zorgtechnologieën die goed op elkaar aansluiten' },
      { value: 5, label: 'Innovatieve technologie is structureel onderdeel van de zorgverlening' },
    ],
  },
  {
    code: 'DA2',
    dimension: 'digitale_ai_adoptie' as Question['dimension'],
    text: 'Hoe ver is uw organisatie met het automatiseren van administratieve processen?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Administratie is overwegend handmatig en tijdrovend' },
      { value: 2, label: 'Enkele processen gedigitaliseerd maar nog veel handmatig werk' },
      { value: 3, label: 'Kernprocessen zijn gedigitaliseerd; verdere automatisering is gepland' },
      { value: 4, label: 'Administratieve last is aanzienlijk verminderd door automatisering' },
      { value: 5, label: 'Administratie is grotendeels geautomatiseerd — medewerkers besteden meer tijd aan cliënten' },
    ],
  },
  {
    code: 'DA3',
    dimension: 'digitale_ai_adoptie' as Question['dimension'],
    text: 'In welke mate worden AI-ondersteunde tools ingezet binnen uw organisatie?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen gebruik van AI-tools' },
      { value: 2, label: 'Incidenteel experimenteren door individuele medewerkers' },
      { value: 3, label: 'Pilots draaien of concrete verkenning gaande' },
      { value: 4, label: 'AI-tools zijn operationeel ingezet in specifieke processen' },
      { value: 5, label: 'AI is structureel ingebed en levert aantoonbare meerwaarde voor zorg en bedrijfsvoering' },
    ],
  },
  {
    code: 'DA4',
    dimension: 'digitale_ai_adoptie' as Question['dimension'],
    text: 'Hoe actief worden medewerkers begeleid bij de ontwikkeling van digitale vaardigheden?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen aandacht voor digitale vaardigheidsontwikkeling' },
      { value: 2, label: 'Incidentele trainingen bij invoering van nieuwe systemen' },
      { value: 3, label: 'Basistrainingen beschikbaar maar niet verplicht of structureel' },
      { value: 4, label: 'Actief opleidingsprogramma voor digitale vaardigheden' },
      { value: 5, label: 'Doorlopend leertraject met individuele digitale ontwikkelplannen' },
    ],
  },

  // ── KETENREGIE & SAMENWERKING ────────────────────────────────────────────────
  {
    code: 'KS1',
    dimension: 'ketenregie' as Question['dimension'],
    text: 'Hoe structureel is de samenwerking met gemeenten en gemeentelijke diensten?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Nauwelijks contact buiten formele contractmomenten' },
      { value: 2, label: 'Reactief contact bij problemen of contractverlenging' },
      { value: 3, label: 'Regelmatig overleg maar nog geen gezamenlijke agenda' },
      { value: 4, label: 'Actieve relatie met gemeenten — gezamenlijke opgaven worden besproken' },
      { value: 5, label: 'Strategisch partnerschap met gemeente op het gebied van zorg en welzijn' },
    ],
  },
  {
    code: 'KS2',
    dimension: 'ketenregie' as Question['dimension'],
    text: 'In welke mate werkt uw organisatie samen met huisartsen en de eerstelijns zorg?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Nauwelijks — doorverwijzingen verlopen moeizaam' },
      { value: 2, label: 'Basiscontact bij doorverwijzingen en ontslagplanning' },
      { value: 3, label: 'Regelmatige afstemming bij gedeelde cliënten' },
      { value: 4, label: 'Structureel overleg en gedeelde zorgprotocollen met eerstelijns partners' },
      { value: 5, label: 'Hechte samenwerking met geïntegreerde werkprocessen en gedeelde dossiers' },
    ],
  },
  {
    code: 'KS3',
    dimension: 'ketenregie' as Question['dimension'],
    text: 'Hoe actief zijn de samenwerkingsverbanden met woningcorporaties en woonzorgpartners?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen structurele samenwerking op het gebied van wonen en zorg' },
      { value: 2, label: 'Ad hoc contact bij concrete huisvestingsvragen' },
      { value: 3, label: 'Overleg over woonzorgvraagstukken maar geen vaste samenwerkingsstructuur' },
      { value: 4, label: 'Actieve samenwerkingsafspraken met één of meerdere woningcorporaties' },
      { value: 5, label: 'Strategische alliantie — wonen en zorg worden integraal gepland en aangeboden' },
    ],
  },
  {
    code: 'KS4',
    dimension: 'ketenregie' as Question['dimension'],
    text: 'Hoe goed functioneert de ketenregie rondom complexe cliëntvraagstukken?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Cliënten vallen tussen wal en schip — geen duidelijke regisseur' },
      { value: 2, label: 'Regie is ad hoc en persoonsafhankelijk' },
      { value: 3, label: 'Basisafspraken over regie maar niet altijd eenduidig belegd' },
      { value: 4, label: 'Duidelijke ketenregie met heldere rollen en overlegstructuren' },
      { value: 5, label: 'Proactieve ketenregie — complexe situaties worden vroeg gesignaleerd en gecoördineerd' },
    ],
  },

  // ── FINANCIËLE VEERKRACHT ────────────────────────────────────────────────────
  {
    code: 'FV1',
    dimension: 'financiele_veerkracht' as Question['dimension'],
    text: 'Hoe robuust is de financiële positie van uw organisatie om tegenvallers op te vangen?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Kwetsbaar — beperkte reservepositie en weinig financiële buffer' },
      { value: 2, label: 'Beperkte ruimte — kleine tegenvallers kunnen al druk opleveren' },
      { value: 3, label: 'Voldoende voor normale bedrijfsvoering maar kwetsbaar bij grotere schokken' },
      { value: 4, label: 'Solide positie — er is ruimte om tegenvallers op te vangen' },
      { value: 5, label: 'Financieel weerbaar — ook structurele uitdagingen kunnen worden opgevangen' },
    ],
  },
  {
    code: 'FV2',
    dimension: 'financiele_veerkracht' as Question['dimension'],
    text: 'In welke mate heeft uw organisatie inzicht in de financiële gevolgen van arbeidsmarktontwikkelingen?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen systematisch inzicht in de financiële impact van arbeidsmarktontwikkelingen' },
      { value: 2, label: 'Globaal inzicht maar geen doorrekening van scenario\u2019s' },
      { value: 3, label: 'Arbeidskosten worden gemonitord maar toekomstige risico\u2019s niet structureel doorgerekend' },
      { value: 4, label: 'Regelmatige doorrekening van arbeidsmarktscenario\u2019s in de begroting' },
      { value: 5, label: 'Gedetailleerde scenario-analyse en actieve sturing op arbeidskosten en risico\u2019s' },
    ],
  },
  {
    code: 'FV3',
    dimension: 'financiele_veerkracht' as Question['dimension'],
    text: 'Hoe actief stuurt uw organisatie op kostenefficiëntie zonder kwaliteitsverlies?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Weinig aandacht voor efficiëntie — processen zijn niet geoptimaliseerd' },
      { value: 2, label: 'Bezuinigingen reactief ingezet bij budgetdruk' },
      { value: 3, label: 'Efficiëntie staat op de agenda maar nog niet systematisch aangepakt' },
      { value: 4, label: 'Actief sturen op efficiëntie met behoud van zorgkwaliteit' },
      { value: 5, label: 'Continue verbetering is ingebed — kostenefficiëntie en kwaliteit versterken elkaar' },
    ],
  },
  {
    code: 'FV4',
    dimension: 'financiele_veerkracht' as Question['dimension'],
    text: 'In welke mate is uw organisatie in staat te investeren in innovatie en transitie?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen ruimte voor investeringen in innovatie' },
      { value: 2, label: 'Zeer beperkt budget — innovatie is afhankelijk van externe subsidies' },
      { value: 3, label: 'Incidentele investeringen maar geen structureel innovatiebudget' },
      { value: 4, label: 'Jaarlijks budget voor innovatie en transitie beschikbaar' },
      { value: 5, label: 'Innovatie is een structurele begrotingspost met meetbare impact' },
    ],
  },

  // ── GOVERNANCE & VERANDERVERMOGEN ────────────────────────────────────────────
  {
    code: 'GV1',
    dimension: 'governance_veranderen' as Question['dimension'],
    text: 'Hoe helder en besluitvaardig is het bestuur bij strategische keuzes?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Besluitvorming verloopt traag en leidt regelmatig tot verwarring' },
      { value: 2, label: 'Besluiten worden genomen maar de uitvoering is wisselend' },
      { value: 3, label: 'Bestuur is besluitvaardig maar de richting is niet altijd even helder gecommuniceerd' },
      { value: 4, label: 'Heldere besluitvorming met goede communicatie naar de organisatie' },
      { value: 5, label: 'Bestuur is slagvaardig, transparant en stuurt actief op strategische prioriteiten' },
    ],
  },
  {
    code: 'GV2',
    dimension: 'governance_veranderen' as Question['dimension'],
    text: 'In welke mate is de organisatie in staat strategische veranderingen door te voeren?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Verandertrajecten lopen vast door weerstand of gebrek aan capaciteit' },
      { value: 2, label: 'Verandering lukt maar kost veel energie en gaat langzaam' },
      { value: 3, label: 'Veranderingen slagen als er voldoende tijd en aandacht voor is' },
      { value: 4, label: 'Organisatie voert veranderingen gestructureerd en succesvol door' },
      { value: 5, label: 'Verandervermogen is een kernkracht — de organisatie adapteert snel en effectief' },
    ],
  },
  {
    code: 'GV3',
    dimension: 'governance_veranderen' as Question['dimension'],
    text: 'Hoe snel en effectief worden nieuwe beleidslijnen of externe ontwikkelingen geïmplementeerd?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Implementatie verloopt moeizaam en duurt lang' },
      { value: 2, label: 'Implementatie slaagt uiteindelijk maar vereist veel aansturing' },
      { value: 3, label: 'Gemiddelde implementatiesnelheid — vergelijkbaar met de sector' },
      { value: 4, label: 'Beleid wordt snel en consequent geïmplementeerd' },
      { value: 5, label: 'Organisatie loopt voor op de sector — implementeert proactief en leert snel' },
    ],
  },
  {
    code: 'GV4',
    dimension: 'governance_veranderen' as Question['dimension'],
    text: 'In welke mate heeft de organisatie capaciteit om te anticiperen op sectorontwikkelingen?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen aandacht voor omgevingsscanning of strategische anticipatie' },
      { value: 2, label: 'Reactief — veranderingen in het beleid worden pas opgepakt als ze verplicht zijn' },
      { value: 3, label: 'Sectorontwikkelingen worden gevolgd maar niet structureel vertaald naar beleid' },
      { value: 4, label: 'Actieve omgevingsscanning met vertaling naar strategische prioriteiten' },
      { value: 5, label: 'Organisatie anticipeert structureel — strategisch beleid loopt voor op sectorontwikkelingen' },
    ],
  },
]
