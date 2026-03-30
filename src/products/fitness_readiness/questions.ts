// FILE: src/products/fitness_readiness/questions.ts
// ─── Fitness Readiness Scan — 18 vragen · 6 dimensies ────────────────────────
//
// Consumentenproduct voor Healthclub45. 3 vragen per dimensie.
// Routing: hoge mental_drive + cardio_base → HYROX-pad.
//          Lage scores → gratis intake traditionele sportschool.
//          Gemengd → PT-sessie aanbeveling.
//
// Dimensies:
//   cardio_base          Cardio & Conditie         (weight 0.20)
//   strength_power       Kracht & Power             (weight 0.20)
//   mental_drive         Mentale Drive & Doelen     (weight 0.20)  ← HYROX-routing
//   mobility_recovery    Mobiliteit & Herstel       (weight 0.15)
//   nutrition_habits     Voeding & Energie          (weight 0.15)
//   training_consistency Trainingsregelmaat         (weight 0.10)

import type { Question } from '@/data/questions'

export const FITNESS_QUESTIONS: Question[] = [

  // ── CARDIO & CONDITIE ────────────────────────────────────────────────────────
  {
    code: 'FIT1',
    dimension: 'cardio_base' as Question['dimension'],
    text: 'Hoe zou jij jouw huidige conditieniveau omschrijven?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Ik raak snel buiten adem bij matige inspanning' },
      { value: 2, label: 'Ik red het, maar heb regelmatig moeite bij langere inspanning' },
      { value: 3, label: 'Ik heb een redelijke conditie voor mijn dagelijkse activiteiten' },
      { value: 4, label: 'Ik heb een goede conditie en kan langere tijd op tempo blijven' },
      { value: 5, label: 'Ik heb een sterke conditie en sport regelmatig op hoog niveau' },
    ],
  },
  {
    code: 'FIT2',
    dimension: 'cardio_base' as Question['dimension'],
    text: 'Hoe lang kun jij aaneengesloten sporten of bewegen zonder te stoppen?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Korter dan 10 minuten' },
      { value: 2, label: '10–20 minuten' },
      { value: 3, label: '20–40 minuten' },
      { value: 4, label: '40–60 minuten' },
      { value: 5, label: 'Meer dan 60 minuten' },
    ],
  },
  {
    code: 'FIT3',
    dimension: 'cardio_base' as Question['dimension'],
    text: 'Hoe snel herstel jij nadat je hard hebt gesprongen of gesprint?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Het duurt lang voor ik weer op adem ben' },
      { value: 2, label: 'Ik heb een paar minuten nodig om te herstellen' },
      { value: 3, label: 'Ik herstel binnen een à twee minuten' },
      { value: 4, label: 'Ik herstel snel en ben direct inzetbaar' },
      { value: 5, label: 'Ik herstel vrijwel onmiddellijk — dit is mijn sterkste kant' },
    ],
  },

  // ── KRACHT & POWER ───────────────────────────────────────────────────────────
  {
    code: 'FIT4',
    dimension: 'strength_power' as Question['dimension'],
    text: 'Hoe beoordeel jij jouw eigen krachtniveau?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Ik voel me zwak en merk dat kracht een beperking is' },
      { value: 2, label: 'Ik heb enige basiskracht maar het kan veel beter' },
      { value: 3, label: 'Ik heb een redelijke kracht voor mijn lichaamsbouw' },
      { value: 4, label: 'Ik ben duidelijk sterker dan gemiddeld' },
      { value: 5, label: 'Kracht is mijn sterkste punt — ik train hier specifiek op' },
    ],
  },
  {
    code: 'FIT5',
    dimension: 'strength_power' as Question['dimension'],
    text: 'Hoeveel push-ups kun jij aaneengesloten uitvoeren met correcte techniek?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Minder dan 5' },
      { value: 2, label: '5–10' },
      { value: 3, label: '10–20' },
      { value: 4, label: '20–40' },
      { value: 5, label: 'Meer dan 40' },
    ],
  },
  {
    code: 'FIT6',
    dimension: 'strength_power' as Question['dimension'],
    text: 'Hoe gaat het met functionele krachtoefeningen zoals squats, lunges en deadlifts?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Ik doe ze niet of weet niet hoe ik ze correct uitvoer' },
      { value: 2, label: 'Ik doe ze maar twijfel aan mijn techniek' },
      { value: 3, label: 'Ik voer ze uit met licht gewicht en redelijke techniek' },
      { value: 4, label: 'Ik train ze regelmatig met goed gewicht en goede vorm' },
      { value: 5, label: 'Dit zijn mijn basisoefeningen — ik train ze zwaar en technisch correct' },
    ],
  },

  // ── MENTALE DRIVE & DOELEN (HYROX-indicator) ─────────────────────────────────
  {
    code: 'FIT7',
    dimension: 'mental_drive' as Question['dimension'],
    text: 'Wat is jouw voornaamste reden om te sporten?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Ik beweeg omdat het moet, niet echt omdat ik het wil' },
      { value: 2, label: 'Ik wil afvallen of er beter uitzien' },
      { value: 3, label: 'Ik wil fitter worden en me beter voelen' },
      { value: 4, label: 'Ik wil meetbaar beter presteren en progressie zien' },
      { value: 5, label: 'Ik wil mezelf uitdagen, competeren of een specifiek doel bereiken' },
    ],
  },
  {
    code: 'FIT8',
    dimension: 'mental_drive' as Question['dimension'],
    text: 'Hoe reageer jij als een training zwaar of uitdagend is?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Ik stop of verlaag de intensiteit zo snel mogelijk' },
      { value: 2, label: 'Ik probeer door te zetten maar geef snel op' },
      { value: 3, label: 'Ik zet door als ik weet dat het goed voor me is' },
      { value: 4, label: 'Ik vind het fijn om aan mijn grens te zitten' },
      { value: 5, label: 'Ik zoek die grens bewust op — dat is waar ik het voor doe' },
    ],
  },
  {
    code: 'FIT9',
    dimension: 'mental_drive' as Question['dimension'],
    text: 'Hoe ga jij om met een concreet sportdoel stellen en ernaartoe werken?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Ik stel geen doelen — ik sport gewoon als het uitkomt' },
      { value: 2, label: 'Ik heb een vaag idee van wat ik wil maar geen plan' },
      { value: 3, label: 'Ik heb een doel en probeer er naartoe te werken' },
      { value: 4, label: 'Ik werk met een plan en volg mijn voortgang bij' },
      { value: 5, label: 'Ik heb een helder doel, een plan én een deadline — en ik haal het' },
    ],
  },

  // ── MOBILITEIT & HERSTEL ─────────────────────────────────────────────────────
  {
    code: 'FIT10',
    dimension: 'mobility_recovery' as Question['dimension'],
    text: 'Hoe soepel en beweeglijk voel jij jezelf in het dagelijks leven?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Ik heb regelmatig last van stijfheid, spanning of beperkte beweging' },
      { value: 2, label: 'Ik voel me niet heel soepel maar het limiteert me niet ernstig' },
      { value: 3, label: 'Ik beweeg redelijk vrij in de meeste situaties' },
      { value: 4, label: 'Ik ben soepel en heb weinig last van beperkingen' },
      { value: 5, label: 'Mobiliteit is een bewuste focus — ik werk er actief aan' },
    ],
  },
  {
    code: 'FIT11',
    dimension: 'mobility_recovery' as Question['dimension'],
    text: 'Hoeveel aandacht besteed jij bewust aan herstel na een training?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Vrijwel niets — ik ga direct door na een training' },
      { value: 2, label: 'Soms wat stretchen maar niet echt structureel' },
      { value: 3, label: 'Ik besteed aandacht aan slaap en probeer rustdagen te houden' },
      { value: 4, label: 'Ik plan herstel bewust: slaap, foamrollen, actieve rust' },
      { value: 5, label: 'Herstel is een integraal onderdeel van mijn trainingsplan' },
    ],
  },
  {
    code: 'FIT12',
    dimension: 'mobility_recovery' as Question['dimension'],
    text: 'Hoe vaak heb jij last van blessures, pijn of overbelasting door sport?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 5, label: 'Zelden of nooit — ik train pijnvrij' },
      { value: 4, label: 'Af en toe een kleine kwetsuur maar niets structureels' },
      { value: 3, label: 'Regelmatig wat ongemak maar ik train door' },
      { value: 2, label: 'Ik heb regelmatig last van blessures die me remmen' },
      { value: 1, label: 'Blessures en pijn zijn een terugkerend probleem voor mij' },
    ],
  },

  // ── VOEDING & ENERGIE ────────────────────────────────────────────────────────
  {
    code: 'FIT13',
    dimension: 'nutrition_habits' as Question['dimension'],
    text: 'Hoe bewust ga jij om met wat je eet in relatie tot jouw sportdoelen?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Ik eet wat ik lekker vind — voeding heeft geen prioriteit' },
      { value: 2, label: 'Ik weet dat voeding belangrijk is maar doe er weinig mee' },
      { value: 3, label: 'Ik probeer bewuster te eten maar het is nog niet structureel' },
      { value: 4, label: 'Ik let op eiwitten, koolhydraten en timing rond mijn training' },
      { value: 5, label: 'Voeding is een bewuste pijler van mijn prestaties — ik volg een plan' },
    ],
  },
  {
    code: 'FIT14',
    dimension: 'nutrition_habits' as Question['dimension'],
    text: 'Hoe regelmatig en gebalanceerd eet jij op een gemiddelde dag?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Onregelmatig, veel snacks en weinig structuur' },
      { value: 2, label: 'Ik eet 1–2 maaltijden maar vaak niet gebalanceerd' },
      { value: 3, label: '3 maaltijden per dag maar niet altijd bewust samengesteld' },
      { value: 4, label: 'Ik eet regelmatig en let op eiwitten, groente en koolhydraten' },
      { value: 5, label: 'Mijn voeding is structureel goed — ik bereid maaltijden voor en volg een patroon' },
    ],
  },
  {
    code: 'FIT15',
    dimension: 'nutrition_habits' as Question['dimension'],
    text: 'Hoe ga jij om met jouw energieniveau gedurende de dag?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Ik voel me regelmatig moe en heb weinig energie' },
      { value: 2, label: 'Pieken en dalen — ik ben afhankelijk van koffie of suiker' },
      { value: 3, label: 'Ik heb genoeg energie voor dagelijkse bezigheden' },
      { value: 4, label: 'Ik heb goede energie overdag en herstel goed \'s nachts' },
      { value: 5, label: 'Mijn energieniveau is stabiel en ik pas voeding en slaap actief aan' },
    ],
  },

  // ── TRAININGSREGELMAAT ───────────────────────────────────────────────────────
  {
    code: 'FIT16',
    dimension: 'training_consistency' as Question['dimension'],
    text: 'Hoe vaak sport of beweeg jij gemiddeld per week?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Minder dan 1 keer per week' },
      { value: 2, label: '1 keer per week' },
      { value: 3, label: '2 keer per week' },
      { value: 4, label: '3–4 keer per week' },
      { value: 5, label: '5 of meer keer per week' },
    ],
  },
  {
    code: 'FIT17',
    dimension: 'training_consistency' as Question['dimension'],
    text: 'Hoe consistent houd jij jouw trainingsroutine vol gedurende het jaar?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Ik sport sporadisch — maanden kunnen voorbijgaan' },
      { value: 2, label: 'Ik sport in golven — actieve periodes afgewisseld met lange pauzes' },
      { value: 3, label: 'Ik sport redelijk regelmatig maar val soms een tijdje weg' },
      { value: 4, label: 'Ik sport consistent — ook als het moeilijk is houd ik het vol' },
      { value: 5, label: 'Sport is een onmisbaar onderdeel van mijn week — ik skip zelden' },
    ],
  },
  {
    code: 'FIT18',
    dimension: 'training_consistency' as Question['dimension'],
    text: 'Wat is de grootste drempel die jou tegenhoudt om jouw fitnessdoelen te bereiken?',
    type: 'likert',
    lite: true,
    scored: true,
    options: [
      { value: 1, label: 'Ik weet niet waar ik moet beginnen of wat ik moet doen' },
      { value: 2, label: 'Tijdgebrek of gebrek aan motivatie' },
      { value: 3, label: 'Ik train al maar mis richting of een goed plan' },
      { value: 4, label: 'Kleine obstakels — maar ik vind mijn weg er altijd omheen' },
      { value: 5, label: 'Geen grote drempel — ik sport structureel en met een doel' },
    ],
  },
]
