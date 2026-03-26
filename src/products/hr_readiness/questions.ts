// FILE: src/products/hr_readiness/questions.ts
// ─── HR Gereedheidscan — 24 vragen over 6 dimensies ───────────────────────────
//
// 4 vragen per dimensie. Eerste vraag per dimensie heeft lite=true.
// Alle vragen zijn type='likert', scored=true.
//
// Dimensies:
//   hr_strategie      HR & Strategische richting     (weight 0.22)
//   verandervermogen  Verandering & Adaptief vermogen (weight 0.20)
//   leiderschap       Leiderschap & Sturing           (weight 0.18)
//   talent            Talent & Ontwikkeling           (weight 0.18)
//   hr_data           HR-data & Analyse               (weight 0.12)
//   hr_operationeel   Operationele HR-effectiviteit   (weight 0.10)

import type { Question } from '@/data/questions'

export const HR_QUESTIONS: Question[] = [

  // ── HR & STRATEGISCHE RICHTING ───────────────────────────────────────────────
  {
    code: 'HR1',
    dimension: 'hr_strategie' as Question['dimension'],
    text: 'In welke mate is de HR-strategie direct afgeleid van de organisatiestrategie?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'HR heeft geen formele koppeling aan de strategie' },
      { value: 2, label: 'HR-strategie is informeel afgestemd' },
      { value: 3, label: 'HR-strategie is vastgelegd maar niet actief bijgehouden' },
      { value: 4, label: 'HR-strategie is helder geformuleerd en jaarlijks bijgesteld' },
      { value: 5, label: 'HR-strategie is volledig geïntegreerd en stuurt mee op businessdoelstellingen' },
    ],
  },
  {
    code: 'HR2',
    dimension: 'hr_strategie' as Question['dimension'],
    text: 'Hoe actief is HR betrokken bij strategische besluitvorming?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'HR is niet aanwezig bij strategische overleggen' },
      { value: 2, label: 'HR wordt incidenteel geconsulteerd' },
      { value: 3, label: 'HR is regelmatig betrokken bij relevante beslissingen' },
      { value: 4, label: 'HR heeft een vaste rol in het MT of directie-overleg' },
      { value: 5, label: 'HR is een volwaardige strategische partner op alle niveaus' },
    ],
  },
  {
    code: 'HR3',
    dimension: 'hr_strategie' as Question['dimension'],
    text: 'In welke mate denkt HR proactief mee over toekomstige talentbehoeften?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen inzicht in toekomstige behoeften' },
      { value: 2, label: 'Reactief — we reageren op urgente vacatures' },
      { value: 3, label: 'Jaarlijkse capaciteitsplanning op hoofdlijnen' },
      { value: 4, label: 'Actieve workforce planning voor 1-2 jaar vooruit' },
      { value: 5, label: 'Structurele scenario-planning voor talent op lange termijn' },
    ],
  },
  {
    code: 'HR4',
    dimension: 'hr_strategie' as Question['dimension'],
    text: 'Hoe helder is de HR-agenda vertaald naar meetbare doelstellingen voor teams?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen HR-doelstellingen op teamniveau' },
      { value: 2, label: 'Doelstellingen bestaan maar worden niet gemeten' },
      { value: 3, label: 'Enkele HR-KPI\'s zijn zichtbaar bij management' },
      { value: 4, label: 'HR-doelstellingen zijn geïntegreerd in teamplannen' },
      { value: 5, label: 'HR-doelstellingen zijn cascaded door de hele organisatie en worden actief gemonitord' },
    ],
  },

  // ── VERANDERING & ADAPTIEF VERMOGEN ─────────────────────────────────────────
  {
    code: 'VC1',
    dimension: 'verandervermogen' as Question['dimension'],
    text: 'In welke mate is de organisatie in staat veranderingen snel en effectief door te voeren?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Verandering stuit vrijwel altijd op weerstand en loopt vast' },
      { value: 2, label: 'Verandering lukt maar kost veel tijd en energie' },
      { value: 3, label: 'Verandering verloopt redelijk maar is nog niet systematisch' },
      { value: 4, label: 'De organisatie heeft bewezen verandertrajecten succesvol door te voeren' },
      { value: 5, label: 'Veranderen zit in de DNA van de organisatie — het gaat snel en gestructureerd' },
    ],
  },
  {
    code: 'VC2',
    dimension: 'verandervermogen' as Question['dimension'],
    text: 'Hoe goed is de veranderaanpak geborgd in processen en rollen?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen formele aanpak, verandering wordt ad hoc opgepakt' },
      { value: 2, label: 'Informele afspraken maar geen gestructureerde aanpak' },
      { value: 3, label: 'Een verandermethodiek is beschikbaar maar niet breed toegepast' },
      { value: 4, label: 'Verandermanagement is ingebed in projectaanpakken' },
      { value: 5, label: 'Verandervermogen is een kerncompetentie met dedicated rollen en budget' },
    ],
  },
  {
    code: 'VC3',
    dimension: 'verandervermogen' as Question['dimension'],
    text: 'In welke mate hebben medewerkers vertrouwen in het vermogen van de organisatie om te veranderen?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Er is veel scepsis en cynisme over verandertrajecten' },
      { value: 2, label: 'Medewerkers zijn terughoudend maar niet actief negatief' },
      { value: 3, label: 'Gemengde gevoelens — afhankelijk van de afdeling' },
      { value: 4, label: 'Medewerkers staan over het algemeen open voor verandering' },
      { value: 5, label: 'Medewerkers zien verandering als kans en dragen actief bij' },
    ],
  },
  {
    code: 'VC4',
    dimension: 'verandervermogen' as Question['dimension'],
    text: 'Hoe worden lessen uit eerdere verandertrajecten benut?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Evaluaties worden niet gedaan' },
      { value: 2, label: 'Evaluaties vinden plaats maar conclusies worden niet geborgd' },
      { value: 3, label: 'Lessen worden vastgelegd maar zelden actief toegepast' },
      { value: 4, label: 'Retrospectives zijn standaard en inzichten worden gedeeld' },
      { value: 5, label: 'Leren van verandering is systematisch ingebed in de organisatie' },
    ],
  },

  // ── LEIDERSCHAP & STURING ────────────────────────────────────────────────────
  {
    code: 'LS1',
    dimension: 'leiderschap' as Question['dimension'],
    text: 'In welke mate zijn leidinggevenden toegerust om HR-vraagstukken effectief op te pakken?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Leidinggevenden vermijden HR-vraagstukken of escaleren alles' },
      { value: 2, label: 'Basisvaardigheden aanwezig maar onvoldoende voor complexe situaties' },
      { value: 3, label: 'De meeste leidinggevenden pakken HR-vraagstukken redelijk zelfstandig op' },
      { value: 4, label: 'Leidinggevenden zijn getraind en gecoacht op people management' },
      { value: 5, label: 'Leidinggevenden zijn sterke people managers en fungeren als voorbeeld' },
    ],
  },
  {
    code: 'LS2',
    dimension: 'leiderschap' as Question['dimension'],
    text: 'Hoe consistent stuurt het management op gedrag en cultuur?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Gewenst gedrag is niet gedefinieerd of zichtbaar' },
      { value: 2, label: 'Waarden zijn vastgelegd maar leven niet in de praktijk' },
      { value: 3, label: 'Management spreekt medewerkers incidenteel aan op gedrag' },
      { value: 4, label: 'Gedrag en cultuur zijn structureel onderdeel van feedback en beoordeling' },
      { value: 5, label: 'Cultuur wordt actief geleefd en bewaakt door alle leidinggevenden' },
    ],
  },
  {
    code: 'LS3',
    dimension: 'leiderschap' as Question['dimension'],
    text: 'In welke mate nemen leidinggevenden eigenaarschap voor teamontwikkeling?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Ontwikkeling is volledig de verantwoordelijkheid van HR of de medewerker zelf' },
      { value: 2, label: 'Leidinggevenden zijn betrokken als HR erop aandringt' },
      { value: 3, label: 'Ontwikkeling wordt besproken in functioneringsgesprekken' },
      { value: 4, label: 'Leidinggevenden voeren actief ontwikkelgesprekken en stellen ontwikkelplannen op' },
      { value: 5, label: 'Teamontwikkeling is een prioriteit die leidinggevenden zelf initiëren en bewaken' },
    ],
  },
  {
    code: 'LS4',
    dimension: 'leiderschap' as Question['dimension'],
    text: 'Hoe helder is de sturing op performance op alle niveaus?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Performance wordt niet structureel gemeten of besproken' },
      { value: 2, label: 'Jaarlijkse beoordelingsgesprekken maar geen continue sturing' },
      { value: 3, label: 'Regelmatige check-ins maar zonder heldere KPI\'s' },
      { value: 4, label: 'Duidelijke doelstellingen met periodieke reviews en bijsturing' },
      { value: 5, label: 'Continue performance management met real-time inzicht op alle niveaus' },
    ],
  },

  // ── TALENT & ONTWIKKELING ────────────────────────────────────────────────────
  {
    code: 'TA1',
    dimension: 'talent' as Question['dimension'],
    text: 'In welke mate heeft de organisatie inzicht in aanwezig talent en benodigde competenties?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Geen systematisch inzicht in talent of competenties' },
      { value: 2, label: 'Informeel inzicht bij directe managers' },
      { value: 3, label: 'Competentieprofielen beschikbaar maar niet actueel' },
      { value: 4, label: 'Up-to-date competentieprofielen en talentenkaart per afdeling' },
      { value: 5, label: 'Volledig inzicht in talent, skills-gaps en toekomstige behoeften op organisatieniveau' },
    ],
  },
  {
    code: 'TA2',
    dimension: 'talent' as Question['dimension'],
    text: 'Hoe actief wordt geïnvesteerd in ontwikkeling van medewerkers?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen of minimaal opleidingsbudget' },
      { value: 2, label: 'Budget beschikbaar maar initiatief ligt bij medewerker' },
      { value: 3, label: 'Jaarlijkse opleidingscyclus op hoofdlijnen' },
      { value: 4, label: 'Persoonlijke ontwikkelplannen voor alle medewerkers' },
      { value: 5, label: 'Leren is ingebed in de dagelijkse werkpraktijk met structurele ondersteuning' },
    ],
  },
  {
    code: 'TA3',
    dimension: 'talent' as Question['dimension'],
    text: 'In welke mate is het werving- en selectieproces effectief afgestemd op toekomstige behoeften?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Reactief werven — alleen bij acute vacatures' },
      { value: 2, label: 'Standaard sollicitatieprocedure zonder strategische koppeling' },
      { value: 3, label: 'Functieprofiel sluit aan op huidige behoeften' },
      { value: 4, label: 'Werving is afgestemd op de organisatiestrategie voor 1-2 jaar' },
      { value: 5, label: 'Strategische talentacquisitie met proactieve arbeidsmarktcommunicatie' },
    ],
  },
  {
    code: 'TA4',
    dimension: 'talent' as Question['dimension'],
    text: 'Hoe goed slaagt de organisatie erin talent te behouden?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Hoog verloop zonder duidelijk inzicht in oorzaken' },
      { value: 2, label: 'Verloop wordt gemeten maar er worden geen gerichte maatregelen genomen' },
      { value: 3, label: 'Retentiemaatregelen zijn aanwezig maar niet systematisch' },
      { value: 4, label: 'Actief retentiebeleid met exit-interviews en opvolgingsgesprekken' },
      { value: 5, label: 'Verloop is laag, medewerkersbinding is een strategische prioriteit met meetbare resultaten' },
    ],
  },

  // ── HR-DATA & ANALYSE ────────────────────────────────────────────────────────
  {
    code: 'HD1',
    dimension: 'hr_data' as Question['dimension'],
    text: 'In welke mate worden HR-data gebruikt voor strategische besluitvorming?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'HR-data worden niet structureel verzameld of gebruikt' },
      { value: 2, label: 'Basisdata beschikbaar maar niet gedeeld met management' },
      { value: 3, label: 'HR-rapportages worden periodiek gedeeld maar niet actief gebruikt' },
      { value: 4, label: 'HR-data worden regelmatig ingezet voor operationele beslissingen' },
      { value: 5, label: 'HR-analytics zijn geïntegreerd in strategische besluitvorming op directieniveau' },
    ],
  },
  {
    code: 'HD2',
    dimension: 'hr_data' as Question['dimension'],
    text: 'Hoe volledig en betrouwbaar is de beschikbare HR-data?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Data zijn gefragmenteerd en onbetrouwbaar' },
      { value: 2, label: 'Basisdata beschikbaar maar onvolledig of verouderd' },
      { value: 3, label: 'Meeste kerncijfers zijn beschikbaar maar handmatig beheerd' },
      { value: 4, label: 'HR-data zijn grotendeels volledig en worden systematisch bijgehouden' },
      { value: 5, label: 'HR-data zijn volledig, real-time beschikbaar en geborgd in systemen' },
    ],
  },
  {
    code: 'HD3',
    dimension: 'hr_data' as Question['dimension'],
    text: 'In welke mate worden HR-analyses gedeeld met management en directie?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'HR-analyses worden niet of nauwelijks gedeeld' },
      { value: 2, label: 'Ad-hoc rapportages op verzoek van management' },
      { value: 3, label: 'Periodieke HR-rapportage maar beperkt geïntegreerd in besluitvorming' },
      { value: 4, label: 'HR-data zijn structureel onderdeel van management-informatie' },
      { value: 5, label: 'HR-dashboard is real-time beschikbaar voor alle relevante stakeholders' },
    ],
  },
  {
    code: 'HD4',
    dimension: 'hr_data' as Question['dimension'],
    text: 'Hoe ver is de organisatie in het gebruik van voorspellende HR-analytics?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen gebruik van analytics' },
      { value: 2, label: 'Beschrijvende rapportages op historische data' },
      { value: 3, label: 'Trendanalyses en eenvoudige prognoses' },
      { value: 4, label: 'Voorspellende modellen voor verzuim of verloop in gebruik' },
      { value: 5, label: 'Geavanceerde predictive analytics geïntegreerd in HR-strategie en beleid' },
    ],
  },

  // ── OPERATIONELE HR-EFFECTIVITEIT ────────────────────────────────────────────
  {
    code: 'HO1',
    dimension: 'hr_operationeel' as Question['dimension'],
    text: 'In welke mate zijn HR-processen efficiënt, consistent en schaalbaar ingericht?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'HR-processen zijn ad hoc en sterk persoonsafhankelijk' },
      { value: 2, label: 'Processen zijn deels beschreven maar inconsistent uitgevoerd' },
      { value: 3, label: 'Kernprocessen zijn beschreven en grotendeels consistent' },
      { value: 4, label: 'HR-processen zijn gestandaardiseerd en schaalbaar ingericht' },
      { value: 5, label: 'HR-processen zijn geoptimaliseerd, geautomatiseerd waar mogelijk en continu verbeterd' },
    ],
  },
  {
    code: 'HO2',
    dimension: 'hr_operationeel' as Question['dimension'],
    text: 'Hoe tevreden zijn medewerkers en managers over de HR-dienstverlening?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Breed ontevreden — HR wordt als bureaucratisch of onbereikbaar ervaren' },
      { value: 2, label: 'Gemengd — sommige diensten werken goed, andere niet' },
      { value: 3, label: 'Over het algemeen neutraal of licht positief' },
      { value: 4, label: 'Medewerkers en managers waarderen HR als betrouwbare partner' },
      { value: 5, label: 'HR wordt gezien als een toegevoegde waarde en actieve businesspartner' },
    ],
  },
  {
    code: 'HO3',
    dimension: 'hr_operationeel' as Question['dimension'],
    text: 'In welke mate maakt HR gebruik van technologie en automatisering?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Handmatige processen en spreadsheets domineren' },
      { value: 2, label: 'Basis HR-systeem aanwezig maar beperkt gebruikt' },
      { value: 3, label: 'HRIS in gebruik voor kernprocessen' },
      { value: 4, label: 'Geïntegreerd HR-platform met selfservice voor medewerkers en managers' },
      { value: 5, label: 'Geavanceerde HR-technologie inclusief automatisering van repetitieve taken' },
    ],
  },
  {
    code: 'HO4',
    dimension: 'hr_operationeel' as Question['dimension'],
    text: 'Hoe goed borgt HR compliance en risicobeheer?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen actief compliance-beleid — reactief bij incidenten' },
      { value: 2, label: 'Basale naleving van wetgeving maar geen systematische aanpak' },
      { value: 3, label: 'Compliance is geborgd in kernprocessen' },
      { value: 4, label: 'Actief risicobeleid met periodieke audits en bijsturing' },
      { value: 5, label: 'HR-compliance en risicomanagement zijn proactief en geïntegreerd in de bedrijfsvoering' },
    ],
  },
]
