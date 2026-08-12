// FILE: src/products/moba_marketing/questions.ts
// ─── MOBA Marketing Survey — Laag 1: 18 maturity-vragen ───────────────────────
//
// 6 dimensies × 3 vragen. 5-punts maturity-schaal (1 = onvolwassen → 5 = volwassen).
// Score 5 staat ALTIJD voor de gewenste/volwassen kant. Waar de brief een vraag
// als reverse-coded (⟲) markeert, is dat hier opgelost door de option-labels in
// oplopende volgorde te schrijven met 5 = volwassen — er hoeft dus niets te worden
// omgedraaid bij het scoren.
//
// Laag 2 (prioritering, 10 punten), laag 3 (open vragen) en de segmentatievraag
// zijn GEEN likert-vragen en staan niet in dit bestand — die worden apart
// afgehandeld in de survey-flow en opgeslagen in eigen kolommen.

import type { Question } from '@/data/questions'

export const MOBA_QUESTIONS: Question[] = [
  // ── Dimensie 1 — Positionering & Propositie ─────────────────────────────────
  {
    code: 'MP1',
    dimension: 'moba_positioning',
    text: 'Hoe helder en onderscheidend is onze positionering in de markt?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen expliciete positionering' },
      { value: 2, label: 'Er is een begin, maar het is vaag' },
      { value: 3, label: 'Er is een positionering, maar intern niet eenduidig' },
      { value: 4, label: 'Duidelijke positionering, nog niet overal consequent' },
      { value: 5, label: 'Scherpe, onderscheidende positionering die we consequent uitdragen' },
    ],
  },
  {
    code: 'MP2',
    dimension: 'moba_positioning',
    text: 'Als we drie klanten zouden vragen "waar staat MOBA voor?", hoe eensluidend is hun antwoord?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Sterk uiteenlopende beelden' },
      { value: 2, label: 'Weinig overlap' },
      { value: 3, label: 'Deels overlappend, deels verschillend' },
      { value: 4, label: 'Grotendeels hetzelfde beeld' },
      { value: 5, label: 'Vrijwel iedereen hetzelfde, herkenbare beeld' },
    ],
  },
  {
    code: 'MP3',
    dimension: 'moba_positioning',
    text: 'Waar draait onze propositie primair om?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Vooral onze machines en techniek' },
      { value: 2, label: 'Overwegend product en specificaties' },
      { value: 3, label: 'Mix van product en klantwaarde' },
      { value: 4, label: 'Overwegend de businesswaarde voor de klant' },
      { value: 5, label: 'Vooral de businesswaarde voor de klant (ontzorgen, rendement)' },
    ],
  },

  // ── Dimensie 2 — Geïntegreerde communicatie & keten-verhaal ─────────────────
  {
    code: 'GC1',
    dimension: 'moba_integrated_comms',
    text: 'Hoe samenhangend is onze communicatie naar de markt?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Losse acties per product/kanaal zonder samenhang' },
      { value: 2, label: 'Af en toe afstemming, maar meestal los' },
      { value: 3, label: 'Deels afgestemd, deels versnipperd' },
      { value: 4, label: 'Grotendeels één lijn, met uitzonderingen' },
      { value: 5, label: 'Eén geïntegreerd, consistent verhaal' },
    ],
  },
  {
    code: 'GC2',
    dimension: 'moba_integrated_comms',
    text: 'Hoe brengen we de keten (aanvoer → sorteren → inpakken → verwerken) naar de klant?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Als losse producten/onderdelen' },
      { value: 2, label: 'Vooral per onderdeel, zelden als geheel' },
      { value: 3, label: 'Soms als geheel, soms als losse delen' },
      { value: 4, label: 'Meestal als samenhangende oplossing' },
      { value: 5, label: 'Als één geïntegreerde, ontzorgende oplossing' },
    ],
  },
  {
    code: 'GC3',
    dimension: 'moba_integrated_comms',
    text: 'Hoe op één lijn zitten marketing, sales en product in de marktboodschap?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'We werken langs elkaar heen' },
      { value: 2, label: 'Weinig afstemming' },
      { value: 3, label: 'Wisselend, afhankelijk van het onderwerp' },
      { value: 4, label: 'Grotendeels afgestemd' },
      { value: 5, label: 'Volledig afgestemd op één verhaal' },
    ],
  },

  // ── Dimensie 3 — Business-partnerrol & klantwaarde ──────────────────────────
  {
    code: 'BP1',
    dimension: 'moba_business_partner',
    text: 'Hoe wordt MOBA in de markt gezien?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Als leverancier van sorteer-/verpakkingsmachines' },
      { value: 2, label: 'Vooral als machineleverancier, soms meer' },
      { value: 3, label: 'Deels leverancier, deels adviespartner' },
      { value: 4, label: 'Overwegend als partner over de keten' },
      { value: 5, label: 'Als strategische business partner over de hele keten' },
    ],
  },
  {
    code: 'BP2',
    dimension: 'moba_business_partner',
    text: 'Waar gaat onze content/communicatie vooral over?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Techniek en features' },
      { value: 2, label: 'Overwegend product en specificaties' },
      { value: 3, label: 'Mix van techniek en klantresultaat' },
      { value: 4, label: 'Overwegend de business van de klant' },
      { value: 5, label: 'De business en het rendement van de klant' },
    ],
  },
  {
    code: 'BP3',
    dimension: 'moba_business_partner',
    text: 'In hoeverre maken we expliciet dat we klanten helpen méér rendement uit hun keten te halen?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Dat is geen expliciet thema' },
      { value: 2, label: 'Zelden, en impliciet' },
      { value: 3, label: 'Af en toe, niet consequent' },
      { value: 4, label: 'Regelmatig en herkenbaar' },
      { value: 5, label: 'Dat is de kern van wat we uitdragen' },
    ],
  },

  // ── Dimensie 4 — Kanaal- & campagnestrategie ────────────────────────────────
  {
    code: 'KS1',
    // ⟲ in de brief: hier opgelost met 5 = volwassen (gebalanceerde mix)
    dimension: 'moba_channel_strategy',
    text: 'Hoe gebalanceerd is onze kanaalmix ten opzichte van events?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Events zijn zo goed als ons enige kanaal' },
      { value: 2, label: 'Sterk event-afhankelijk, weinig anders' },
      { value: 3, label: 'Events domineren, maar er is meer' },
      { value: 4, label: 'Redelijk gebalanceerd, events blijven groot' },
      { value: 5, label: 'Events zijn een bewust onderdeel van een gebalanceerde mix' },
    ],
  },
  {
    code: 'KS2',
    dimension: 'moba_channel_strategy',
    text: 'Hebben we naast events een doorlopende contentmotor (digitaal, thought leadership, nurturing)?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Nauwelijks of niets' },
      { value: 2, label: 'Incidenteel, zonder ritme' },
      { value: 3, label: 'Aanwezig, maar niet consequent' },
      { value: 4, label: 'Doorlopend, nog in ontwikkeling' },
      { value: 5, label: 'Volwassen en doorlopend' },
    ],
  },
  {
    code: 'KS3',
    dimension: 'moba_channel_strategy',
    text: 'Waarop baseren we onze kanaalkeuzes?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Gewoonte ("dat doen we altijd zo")' },
      { value: 2, label: 'Vooral gewoonte, soms onderbouwd' },
      { value: 3, label: 'Deels gewoonte, deels doelgericht' },
      { value: 4, label: 'Overwegend doelgroep en doelstelling' },
      { value: 5, label: 'Doelgroep + doelstelling + onderbouwd rendement' },
    ],
  },

  // ── Dimensie 5 — Datagedreven werken & rendement ────────────────────────────
  {
    code: 'DR1',
    dimension: 'moba_data_roi',
    text: 'Weten we welke marketinginspanningen echt bijdragen aan resultaat?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen zicht' },
      { value: 2, label: 'Een vaag vermoeden' },
      { value: 3, label: 'Voor sommige dingen wel, andere niet' },
      { value: 4, label: 'Grotendeels helder' },
      { value: 5, label: 'Helder en meetbaar' },
    ],
  },
  {
    code: 'DR2',
    dimension: 'moba_data_roi',
    text: 'Waarop baseren we marketingbeslissingen?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Onderbuik en aannames' },
      { value: 2, label: 'Vooral onderbuik, soms cijfers' },
      { value: 3, label: 'Mix van aannames en data' },
      { value: 4, label: 'Overwegend data-onderbouwd' },
      { value: 5, label: 'Data, experimenteren en leren' },
    ],
  },
  {
    code: 'DR3',
    dimension: 'moba_data_roi',
    text: 'Kennen we het rendement van onze events (leads / opportunities / omzet)?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Niet' },
      { value: 2, label: 'Alleen ruwe indrukken' },
      { value: 3, label: 'Deels, niet consequent' },
      { value: 4, label: 'Grotendeels inzichtelijk' },
      { value: 5, label: 'Volledig inzichtelijk' },
    ],
  },

  // ── Dimensie 6 — AI & toekomstgerichtheid ───────────────────────────────────
  {
    code: 'AF1',
    dimension: 'moba_ai_future',
    text: 'Welke rol speelt AI in ons marketingwerk vandaag?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen rol' },
      { value: 2, label: 'Een enkeling probeert wat' },
      { value: 3, label: 'Incidenteel, niet ingebed' },
      { value: 4, label: 'Regelmatig, in delen van het werk' },
      { value: 5, label: 'Structureel ingebed in hoe we werken' },
    ],
  },
  {
    code: 'AF2',
    dimension: 'moba_ai_future',
    text: 'Heb ik een beeld van hoe AI ons werk het komende jaar verandert?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Geen beeld' },
      { value: 2, label: 'Een vaag idee' },
      { value: 3, label: 'Een globaal beeld, geen plan' },
      { value: 4, label: 'Een helder beeld, plan in de maak' },
      { value: 5, label: 'Helder beeld én een plan' },
    ],
  },
  {
    code: 'AF3',
    dimension: 'moba_ai_future',
    text: 'Hoe experimenteren we als team met nieuwe tools en werkwijzen?',
    type: 'likert',
    lite: false,
    scored: true,
    options: [
      { value: 1, label: 'Zelden' },
      { value: 2, label: 'Af en toe, ad hoc' },
      { value: 3, label: 'Met enige regelmaat, ongestructureerd' },
      { value: 4, label: 'Regelmatig, deels gestructureerd' },
      { value: 5, label: 'Continu en gestructureerd' },
    ],
  },
]
