/**
 * Peri-Compass — curated micro-experiments met expliciete bronnen.
 *
 * Voor het Compass-resultaat kiest Claude uit DEZE lijst (niet zelf verzonnen).
 * Dat geeft drie eigenschappen die anders ontbreken:
 *  1. Evidence-based — alleen interventies uit erkende menopauze-richtlijnen
 *     (NAMS, NICE, IMS, NHS, ACSM, NIH/NIA, Sleep Foundation, etc.)
 *  2. Bronvermelding — elke aanbeveling toont waar de evidence vandaan komt
 *  3. Tracking-gericht — elk experiment is logbaar in de Cycle daily check-in
 *     (sleep, mood, symptoms, alcohol, activity), zodat het later met arts
 *     besproken kan worden
 *
 * NB: dit zijn lifestyle/behavior interventies. Geen HRT, geen medicatie, geen
 * supplementen-doseringen. Voor zulke vragen verwijzen we expliciet naar
 * huisarts of menopauze-arts.
 *
 * Bron-attributies zijn bewust kort en herleidbaar — gebruiker kan ze zelf
 * googelen om de richtlijn te vinden.
 */

export type ExperimentCategory =
  | 'hot_flashes'
  | 'sleep'
  | 'mood_stress'
  | 'energy'
  | 'strength'
  | 'nutrition'
  | 'alcohol'
  | 'general'

export interface CompassExperiment {
  /** Stable code voor referentie + analytics */
  code:        string
  /** Welke categorie symptomen / dimensie hij adresseert */
  category:    ExperimentCategory
  /** De interventie zelf — concreet, 1-2 zinnen, NL als basis */
  text:        string
  /** 'Waarom dit experiment?' — 1-2 zinnen die de werking uitleggen, getoond onder text in UI */
  rationale:   string
  /** Bron — kort label dat googelbaar is */
  source:      string
  /** Optioneel: directe link naar de richtlijn (publiek toegankelijk) */
  sourceUrl?:  string
  /** Welke daily-tracking velden zichtbaar maken in Cycle om dit te kunnen meten */
  tracksFields: string[]
  /** Notities voor Claude over wanneer dit te kiezen */
  whenAppropriate: string
}

// ──────────────────────────────────────────────────────────────────────────
// HOT FLASHES / NACHTELIJK ZWETEN — vasomotorisch
// ──────────────────────────────────────────────────────────────────────────
export const EXP_PACED_BREATHING: CompassExperiment = {
  code: 'paced_breathing',
  category: 'hot_flashes',
  text: 'Paced breathing: 6 ademhalingen per minuut, 15 minuten, 2× per dag (ochtend en avond). Onderzocht als niet-hormonale strategie tegen vasomotorische symptomen.',
  rationale: 'Trage ademhaling activeert je parasympatisch zenuwstelsel — het deel dat afkoeling en rust regelt. Bij hot flashes is dit een snelle, veilige eerste interventie zonder hormonen.',
  source: 'NAMS Position Statement on Nonhormone Therapy 2023',
  sourceUrl: 'https://menopause.org/professional-resources/position-statements',
  tracksFields: ['symptoms', 'sleep', 'energy'],
  whenAppropriate: 'Bij regelmatige hot flashes / nachtelijk zweten, ongeacht stadium.',
}

export const EXP_TRIGGER_AVOIDANCE: CompassExperiment = {
  code: 'trigger_avoidance',
  category: 'hot_flashes',
  text: 'Identificeer en vermijd de meest voorkomende hot-flash triggers gedurende 14 dagen: alcohol, gekruid eten, hete dranken in de avond. Log per dag wat je hebt vermeden en hoe vaak je opvliegers had.',
  rationale: 'Triggers zijn vaak persoonlijk maar voorspelbaar. Door 14 dagen bewust te variëren zie je in de data welke combinaties bij jou werken — sneller dan op gevoel proberen.',
  source: 'NHS Menopause Guideline · NAMS 2023',
  sourceUrl: 'https://www.nhs.uk/conditions/menopause/things-you-can-do/',
  tracksFields: ['symptoms', 'alcohol', 'sleep'],
  whenAppropriate: 'Bij hot flashes met onduidelijke triggers, especially als alcohol regelmatig is.',
}

// ──────────────────────────────────────────────────────────────────────────
// SLAAP
// ──────────────────────────────────────────────────────────────────────────
export const EXP_SLEEP_REGULARITY: CompassExperiment = {
  code: 'sleep_regularity',
  category: 'sleep',
  text: 'Vaste opsta-tijd elke dag, ook in het weekend, gedurende 14 dagen. De variatie in opsta-tijd is een sterkere voorspeller voor slaapkwaliteit dan totale slaapduur.',
  rationale: 'Je circadiaan ritme reageert vooral op opsta-tijd, niet op naar-bed-tijd. 14 dagen vaste opsta-tijd reset je systeem, ook als je nu later opstaat in het weekend.',
  source: 'AASM Clinical Practice Guideline · Sleep Foundation',
  sourceUrl: 'https://aasm.org/clinical-resources/practice-standards/practice-guidelines/',
  tracksFields: ['sleep', 'energy', 'mood'],
  whenAppropriate: 'Bij onderbroken slaap of variabele opsta-tijden, of als energie-dips overdag voorkomen.',
}

export const EXP_BEDROOM_ENVIRONMENT: CompassExperiment = {
  code: 'bedroom_environment',
  category: 'sleep',
  text: 'Slaapkamer-temperatuur verlagen naar 16-19°C en 60 minuten vóór bed geen schermen meer. Test 14 nachten en log slaap-kwaliteit + nachtelijk zweten.',
  rationale: 'Je lichaamstemperatuur moet zakken om diepe slaap te bereiken. Een koele kamer + minder blauw licht maakt dit gemakkelijker — vooral relevant bij nachtelijk zweten.',
  source: 'Sleep Foundation · NIH Sleep Hygiene',
  sourceUrl: 'https://www.sleepfoundation.org/bedroom-environment',
  tracksFields: ['sleep', 'symptoms'],
  whenAppropriate: 'Bij nachtelijk zweten of moeilijk inslapen.',
}

export const EXP_ALCOHOL_BEDTIME: CompassExperiment = {
  code: 'alcohol_bedtime',
  category: 'sleep',
  text: 'Geen alcohol meer binnen 4 uur vóór bedtijd, gedurende 14 nachten. Alcohol breekt REM-slaap af en verergert nachtelijke opvliegers.',
  rationale: 'Alcohol helpt je inslapen maar verstoort de tweede helft van de nacht — precies wanneer hot flashes vaak komen. Tijd geven om alcohol af te breken (4 uur) verlost je nacht.',
  source: 'NIAAA · NICE NG23',
  sourceUrl: 'https://www.nice.org.uk/guidance/ng23',
  tracksFields: ['sleep', 'alcohol', 'symptoms'],
  whenAppropriate: 'Bij combinatie van regelmatige alcohol + slecht slapen of nachtelijk zweten.',
}

export const EXP_CBTI_LITE: CompassExperiment = {
  code: 'cbti_lite',
  category: 'sleep',
  text: 'Stop met checken hoe laat het is als je \'s nachts wakker wordt. Ga uit bed na 20 min wakker liggen, doe iets rustigs onder gedimd licht, ga pas terug als je slaperig bent. Dit is een kerncomponent van CBT-I (eerstelijns therapie voor slapeloosheid).',
  rationale: 'Klok-checken zet je brein in alarmstand ("ik slaap te kort"). Bed-vermijden bij wakker liggen breekt de associatie tussen bed en piekeren — bewezen effectiever dan slaapmedicatie op lange termijn.',
  source: 'AASM CBT-I Guideline 2017',
  sourceUrl: 'https://aasm.org/clinical-resources/practice-standards/',
  tracksFields: ['sleep', 'mood'],
  whenAppropriate: 'Bij chronische onderbroken slaap met piekeren in de nacht.',
}

// ──────────────────────────────────────────────────────────────────────────
// MOOD / STRESS / ENERGIE
// ──────────────────────────────────────────────────────────────────────────
export const EXP_MORNING_LIGHT: CompassExperiment = {
  code: 'morning_light',
  category: 'energy',
  text: '30 minuten daglicht binnen het eerste uur na opstaan, 14 dagen. Liefst buiten lopen. Sterkste regulator voor circadiaan ritme en avond-melatonine.',
  rationale: 'Ochtend-daglicht is je sterkste circadiaan signaal. Het verschuift je melatonine-piek naar de avond, waardoor je natuurlijker inslaapt en je dag-energie stabieler wordt.',
  source: 'Sleep Foundation · Walker Lab UC Berkeley',
  sourceUrl: 'https://www.sleepfoundation.org/circadian-rhythm/light-and-sleep',
  tracksFields: ['sleep', 'energy', 'mood'],
  whenAppropriate: 'Bij ochtend-vermoeidheid, energie-dips overdag, of moeite met inslapen.',
}

export const EXP_478_BREATHING: CompassExperiment = {
  code: '478_breathing',
  category: 'mood_stress',
  text: '4-7-8 ademhaling: 4 sec inademen, 7 sec vasthouden, 8 sec uitademen. 4 cycli, 2× per dag. Activeert parasympatisch zenuwstelsel — blijkt blood pressure en angst te verlagen in studies.',
  rationale: 'De lange uitademing zet je zenuwstelsel in rust-modus binnen 90 seconden. Een dagelijks micro-anker dat je leert oproepen wanneer stress oploopt.',
  source: 'American Lung Association · Cleveland Clinic',
  sourceUrl: 'https://my.clevelandclinic.org/health/articles/4-7-8-breathing',
  tracksFields: ['stress', 'mood', 'sleep'],
  whenAppropriate: 'Bij hoge stress, angst, of inslaap-problemen.',
}

export const EXP_DAILY_WALK: CompassExperiment = {
  code: 'daily_walk',
  category: 'mood_stress',
  text: '30 minuten wandelen buiten, dagelijks gedurende 21 dagen. Combineert daglicht, low-intensity cardio en mentale rust — sterkste evidence voor stemmings-effect bij milde tot matige depressie.',
  rationale: 'Drie dingen tegelijk: daglicht (circadiaan), milde beweging (BDNF + serotonine), en mentale ruimte. Klinisch even effectief als SSRI bij milde depressie volgens Cochrane.',
  source: 'Cochrane Review on Exercise for Depression · WHO Physical Activity Guidelines 2020',
  sourceUrl: 'https://www.who.int/publications/i/item/9789240015128',
  tracksFields: ['activity', 'mood', 'energy'],
  whenAppropriate: 'Bij sombere stemming, lage energie, of hoge stress en weinig beweging.',
}

export const EXP_JOURNALING: CompassExperiment = {
  code: 'journaling_3min',
  category: 'mood_stress',
  text: '3 minuten dagelijks journaling vóór het slapen — schrijf op wat je piekeren over morgen is. Verlaagt cognitieve activatie aan begin van de slaap.',
  rationale: 'Schrijven verplaatst piekergedachten van je hoofd naar papier. Eén RCT liet 9 minuten kortere inslaaptijd zien — eenvoudiger dan meditatie en meetbaar.',
  source: 'Scullin et al., Journal of Experimental Psychology 2018',
  tracksFields: ['stress', 'mood', 'sleep'],
  whenAppropriate: 'Bij in-slaap problemen door piekeren, of hoge stress en nauwelijks ontspanmomenten.',
}

// ──────────────────────────────────────────────────────────────────────────
// KRACHTTRAINING / BOTGEZONDHEID
// ──────────────────────────────────────────────────────────────────────────
export const EXP_STRENGTH_TWICE_WEEKLY: CompassExperiment = {
  code: 'strength_2x_weekly',
  category: 'strength',
  text: '2× per week 20-30 minuten krachttraining (eigen lichaamsgewicht of weerstand): squats, push-ups, rows, lunges. Vanaf 40 essentieel voor botdichtheid en spiermassa-behoud.',
  rationale: 'Botdichtheid daalt versneld na de menopauze. Krachttraining is het enige bewezen middel buiten medicatie om dat te remmen — én helpt bij energie en stemming.',
  source: 'Royal Osteoporosis Society 2024 · ACSM Position Stand 2018',
  sourceUrl: 'https://theros.org.uk/information-and-support/looking-after-your-bones/exercise-for-bones/',
  tracksFields: ['activity', 'energy', 'mood'],
  whenAppropriate: 'Bij geen of weinig krachttraining, especially in perimenopauze of postmenopauze.',
}

// ──────────────────────────────────────────────────────────────────────────
// VOEDING / EIWIT
// ──────────────────────────────────────────────────────────────────────────
export const EXP_PROTEIN_DISTRIBUTION: CompassExperiment = {
  code: 'protein_distribution',
  category: 'nutrition',
  text: '20-30 gram eiwit bij elke maaltijd gedurende 14 dagen. Tijdens menopauze ondersteunt verspreid eiwit spieronderhoud beter dan één grote portie.',
  rationale: 'Spierafbraak versnelt na de menopauze. Lichaam neemt eiwit beter op in kleinere porties verspreid over de dag dan in één grote avondmaaltijd.',
  source: 'International Menopause Society 2024 · ESPEN Guidelines',
  sourceUrl: 'https://www.imsociety.org/manage/images/pdf/2024-ims-recommendations.pdf',
  tracksFields: ['energy', 'mood'],
  whenAppropriate: 'Bij vermoeidheid, gewichtsverandering rond middel, of weinig bewuste eiwit-inname.',
}

// ──────────────────────────────────────────────────────────────────────────
// ALCOHOL
// ──────────────────────────────────────────────────────────────────────────
export const EXP_ALCOHOL_FREE_FORTNIGHT: CompassExperiment = {
  code: 'alcohol_free_14d',
  category: 'alcohol',
  text: '14 alcoholvrije nachten op rij. Log slaap-kwaliteit, ochtendenergie en eventuele symptomen vóór, tijdens en na. Effect op slaap-kwaliteit is meestal binnen 7 dagen merkbaar.',
  rationale: 'Alcohol is meestal de grootste slaap-verstoorder die je zelf in handen hebt. 14 dagen geeft je systeem de tijd om te resetten — daarna zie je in de data wat regulier alcohol kostte.',
  source: 'NHS Drink Free Days · NIAAA',
  sourceUrl: 'https://www.nhs.uk/better-health/drink-less/',
  tracksFields: ['alcohol', 'sleep', 'energy', 'mood'],
  whenAppropriate: 'Bij regelmatige alcohol-inname (3+ keer per week) en slaap- of energieklachten.',
}

// ──────────────────────────────────────────────────────────────────────────
// ALGEMEEN / TRACKING-FIRST
// ──────────────────────────────────────────────────────────────────────────
export const EXP_BASELINE_TRACK: CompassExperiment = {
  code: 'baseline_track_14d',
  category: 'general',
  text: 'Log 14 dagen lang elke ochtend in 60 seconden je slaap-kwaliteit, ochtend-energie en eventuele symptomen. Je krijgt een eigen patronen-overzicht zonder iets te veranderen aan je routine.',
  rationale: 'Voor je gaat veranderen, eerst meten. 14 dagen rauwe baseline-data laat zien wat de echte uitgangspositie is — daarna kies je gerichter wat te proberen.',
  source: 'NICE Menopause Guideline NG23 — symptom diary aanbevolen',
  sourceUrl: 'https://www.nice.org.uk/guidance/ng23',
  tracksFields: ['sleep', 'energy', 'mood', 'symptoms'],
  whenAppropriate: 'Default-fallback als geen specifiek dominant symptoom of als gebruiker laag scoort op tracking_history.',
}

export const EXP_DOCTOR_PREP: CompassExperiment = {
  code: 'doctor_prep_30d',
  category: 'general',
  text: 'Track 30 dagen je top-3 klachten + slaap, energie en stemming. Neem deze data mee naar een afspraak met huisarts of menopauze-arts. Concrete data versnelt het gesprek over behandel-opties (incl. HRT-overweging).',
  rationale: 'Een arts heeft 10 minuten — jij hebt 30 dagen aan data. Met concrete patronen ("8 nachten zweten in deze maand, 6× hot flash overdag") sla je de "kunt u uw klachten beschrijven?"-fase over.',
  source: 'NICE NG23 · NAMS shared decision-making framework',
  sourceUrl: 'https://www.nice.org.uk/guidance/ng23/chapter/Recommendations',
  tracksFields: ['symptoms', 'sleep', 'energy', 'mood'],
  whenAppropriate: 'Bij hoge symptom-burden + overweegt of gebruikt HRT, OF bij onduidelijke klachten waar arts-bezoek waardevol kan zijn.',
}

// ──────────────────────────────────────────────────────────────────────────
// Volledige bibliotheek — Claude kiest hieruit
// ──────────────────────────────────────────────────────────────────────────
export const ALL_EXPERIMENTS: CompassExperiment[] = [
  EXP_PACED_BREATHING,
  EXP_TRIGGER_AVOIDANCE,
  EXP_SLEEP_REGULARITY,
  EXP_BEDROOM_ENVIRONMENT,
  EXP_ALCOHOL_BEDTIME,
  EXP_CBTI_LITE,
  EXP_MORNING_LIGHT,
  EXP_478_BREATHING,
  EXP_DAILY_WALK,
  EXP_JOURNALING,
  EXP_STRENGTH_TWICE_WEEKLY,
  EXP_PROTEIN_DISTRIBUTION,
  EXP_ALCOHOL_FREE_FORTNIGHT,
  EXP_BASELINE_TRACK,
  EXP_DOCTOR_PREP,
]

/** Lookup by code — gebruikt door submit route om Claude's keuze te valideren. */
export function getExperimentByCode(code: string): CompassExperiment | null {
  return ALL_EXPERIMENTS.find((e) => e.code === code) ?? null
}

/** Compact format voor in Claude's prompt — alleen de info die hij nodig heeft. */
export function experimentsForPrompt(): string {
  return ALL_EXPERIMENTS.map((e) =>
    `- code: ${e.code}\n  category: ${e.category}\n  when: ${e.whenAppropriate}\n  text: "${e.text}"\n  rationale: "${e.rationale}"\n  source: "${e.source}"`,
  ).join('\n')
}
