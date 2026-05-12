/**
 * Perimenopause Compass — vragenset (Full versie, NL).
 *
 * Structuur:
 *  - Q0: stage (bepaalt skip-logic)
 *  - Q1: leeftijdsband
 *  - Per dimensie 4-6 vragen:
 *      symptom_burden, sleep_recovery, energy_capacity,
 *      stress_context, lifestyle, self_awareness
 *  - Twee open vrije velden: hoofd-zorg + 90-d doel
 *  - HRT-vraag alleen voor stages 'perimenopause_diagnosed' / 'postmenopause'
 *
 * Een vraag heeft:
 *  - code      : key in DB (perimenopause_compass_responses.question_code)
 *  - dimension : welke dimensie hij scoort ('meta' = niet gescoord, alleen context)
 *  - kind      : 'single' | 'multi' | 'likert' | 'text' | 'number'
 *  - reverse   : true → hoge keuze = lage score (voor symptoms-burden)
 *  - showIf    : optioneel filter op stage (default: alle)
 */

export type Stage =
  | 'regular_cycle'
  | 'irregular_cycle'
  | 'perimenopause_diagnosed'
  | 'postmenopause'
  | 'unknown'

export type Dimension =
  | 'meta'
  | 'symptom_burden'
  | 'sleep_recovery'
  | 'energy_capacity'
  | 'stress_context'
  | 'lifestyle'
  | 'self_awareness'

export type QuestionKind = 'single' | 'multi' | 'likert' | 'text' | 'number'

export interface QuestionOption {
  value: string
  label: string
  /** Punten op de dimensie (0-100 schaal). Vereist bij single/multi. */
  score?: number
}

export interface CompassQuestion {
  code:        string
  dimension:   Dimension
  kind:        QuestionKind
  prompt:      string
  help?:       string
  /** Voor likert: aantal stappen (default 5). */
  scale?:      number
  /** Voor likert: welke keuze = max score (default: 5) */
  best?:       number
  options?:    QuestionOption[]
  /** Min/max voor multi-select scoring (gemiddeld over geselecteerde) */
  multiAggregation?: 'avg' | 'sum' | 'max'
  /** Toon alleen als de stage in deze lijst zit */
  showIfStage?: Stage[]
  /** Verberg uit scoring; alleen als context naar Claude */
  contextOnly?: boolean
  /** True = vraag is verplicht */
  required?:   boolean
}

// ──────────────────────────────────────────────────────────────────────────
// Q0 + Q1 — meta (stadium + leeftijd)
// ──────────────────────────────────────────────────────────────────────────
export const STAGE_QUESTION: CompassQuestion = {
  code:      'stage',
  dimension: 'meta',
  kind:      'single',
  required:  true,
  prompt:    'Welk stadium past het beste bij waar je nu staat?',
  help:      'Heel kort: dit bepaalt welke vragen we je verder stellen.',
  options: [
    { value: 'regular_cycle',          label: 'Regelmatige cyclus' },
    { value: 'irregular_cycle',        label: 'Onregelmatige cyclus / vermoedelijk perimenopauze' },
    { value: 'perimenopause_diagnosed',label: 'Perimenopauze (vastgesteld door arts)' },
    { value: 'postmenopause',          label: 'Postmenopauze (>1 jaar geen menstruatie)' },
    { value: 'unknown',                label: 'Weet ik niet zeker' },
  ],
}

const AGE_QUESTION: CompassQuestion = {
  code:      'age_band',
  dimension: 'meta',
  kind:      'single',
  required:  true,
  prompt:    'In welke leeftijdscategorie val je?',
  options: [
    { value: '<35',   label: 'Onder 35' },
    { value: '35-39', label: '35 – 39' },
    { value: '40-44', label: '40 – 44' },
    { value: '45-49', label: '45 – 49' },
    { value: '50-54', label: '50 – 54' },
    { value: '55+',   label: '55 of ouder' },
  ],
}

const HRT_QUESTION: CompassQuestion = {
  code:        'hrt_status',
  dimension:   'meta',
  kind:        'single',
  required:    false,
  showIfStage: ['perimenopause_diagnosed', 'postmenopause'],
  prompt:      'Gebruik je hormoontherapie (HRT)?',
  help:        'Dit beïnvloedt hoe we je antwoorden lezen. Sla over als je niet wilt antwoorden.',
  options: [
    { value: 'none',           label: 'Nee, geen HRT' },
    { value: 'considering',    label: 'Overweeg het' },
    { value: 'using',          label: 'Ja, gebruik HRT' },
    { value: 'stopped',        label: 'Heb HRT gebruikt, gestopt' },
    { value: 'prefer_not_say', label: 'Wil ik niet zeggen' },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// Symptom burden (5 vragen — multi-select voor symptomen + intensiteit-vragen)
// ──────────────────────────────────────────────────────────────────────────
const SYMPTOMS_PERI: QuestionOption[] = [
  { value: 'hot_flashes',     label: 'Opvliegers' },
  { value: 'night_sweats',    label: 'Nachtelijk zweten' },
  { value: 'sleep_broken',    label: 'Onderbroken slaap' },
  { value: 'brain_fog',       label: 'Hersenmist / concentratie' },
  { value: 'mood_swings',     label: 'Stemmingswisselingen' },
  { value: 'irritability',    label: 'Korter lontje' },
  { value: 'low_mood',        label: 'Sombere stemming' },
  { value: 'anxiety',         label: 'Angst / piekeren' },
  { value: 'joint_pain',      label: 'Gewrichts- of spierpijn' },
  { value: 'headaches',       label: 'Hoofdpijn / migraine' },
  { value: 'low_libido',      label: 'Verminderd libido' },
  { value: 'vaginal_dryness', label: 'Vaginale droogheid' },
  { value: 'palpitations',    label: 'Hartkloppingen' },
  { value: 'weight_gain',     label: 'Gewichtstoename rond middel' },
  { value: 'hair_skin',       label: 'Veranderingen huid / haar' },
  { value: 'fatigue',         label: 'Aanhoudende vermoeidheid' },
]

const SYMPTOMS_REGULAR: QuestionOption[] = [
  { value: 'pms_mood',        label: 'PMS / stemmingsdips' },
  { value: 'cramps',          label: 'Menstruatiekrampen' },
  { value: 'bloating',        label: 'Opgeblazen gevoel' },
  { value: 'tender_breasts',  label: 'Gevoelige borsten' },
  { value: 'fatigue_pre',     label: 'Vermoeidheid vóór menstruatie' },
  { value: 'headaches',       label: 'Hoofdpijn / migraine' },
  { value: 'mood_swings',     label: 'Stemmingswisselingen' },
  { value: 'sleep_disturb',   label: 'Slaapproblemen rond cyclus' },
  { value: 'sugar_cravings',  label: 'Zoetbehoefte rond menstruatie' },
  { value: 'low_energy_pms',  label: 'Energiedip in luteale fase' },
]

const SYMPTOMS_PERI_QUESTION: CompassQuestion = {
  code:        'symptoms.peri',
  dimension:   'symptom_burden',
  kind:        'multi',
  required:    true,
  showIfStage: ['irregular_cycle', 'perimenopause_diagnosed', 'postmenopause', 'unknown'],
  prompt:      'Welke van deze symptomen ervaar je nu regelmatig?',
  help:        'Selecteer alles wat de afgelopen 4 weken meerdere keren voorkwam.',
  multiAggregation: 'sum',
  options:     SYMPTOMS_PERI,
}

const SYMPTOMS_REGULAR_QUESTION: CompassQuestion = {
  code:        'symptoms.regular',
  dimension:   'symptom_burden',
  kind:        'multi',
  required:    true,
  showIfStage: ['regular_cycle'],
  prompt:      'Welke van deze ervaar je rond je cyclus?',
  help:        'Selecteer alles wat in je laatste 2 cycli meerdere dagen voorkwam.',
  multiAggregation: 'sum',
  options:     SYMPTOMS_REGULAR,
}

const SYMPTOM_INTENSITY_QUESTION: CompassQuestion = {
  code:      'symptom_intensity',
  dimension: 'symptom_burden',
  kind:      'likert',
  scale:     5,
  best:      1,                                       // 1 = nauwelijks belasting (best score)
  required:  true,
  prompt:    'Hoe belastend zijn je symptomen op een gemiddelde dag?',
  help:      '1 = nauwelijks merkbaar · 5 = beperken me significant',
}

const SYMPTOM_DISRUPTION_QUESTION: CompassQuestion = {
  code:      'symptom_disruption',
  dimension: 'symptom_burden',
  kind:      'single',
  required:  true,
  prompt:    'Hoe vaak verstoren je symptomen je dagelijks functioneren?',
  options: [
    { value: 'never',     label: 'Nooit',                                 score: 100 },
    { value: 'monthly',   label: 'Een paar keer per maand',                score: 75  },
    { value: 'weekly',    label: 'Wekelijks',                              score: 50  },
    { value: 'frequent',  label: 'Meerdere keren per week',                score: 25  },
    { value: 'daily',     label: 'Dagelijks',                              score: 0   },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// Sleep & Recovery (4 vragen)
// ──────────────────────────────────────────────────────────────────────────
const SLEEP_QUALITY_Q: CompassQuestion = {
  code: 'sleep_quality', dimension: 'sleep_recovery', kind: 'likert', scale: 5, best: 5, required: true,
  prompt: 'Hoe waardeer je je slaap-kwaliteit van de afgelopen 4 weken?',
  help:   '1 = slecht · 5 = uitstekend',
}
const SLEEP_DURATION_Q: CompassQuestion = {
  code: 'sleep_duration', dimension: 'sleep_recovery', kind: 'single', required: true,
  prompt: 'Hoeveel uur slaap krijg je gemiddeld per nacht?',
  options: [
    { value: '<5',   label: 'Minder dan 5 uur', score: 0   },
    { value: '5-6',  label: '5 – 6 uur',         score: 30  },
    { value: '6-7',  label: '6 – 7 uur',         score: 60  },
    { value: '7-8',  label: '7 – 8 uur',         score: 100 },
    { value: '8+',   label: 'Meer dan 8 uur',    score: 90  },
  ],
}
const SLEEP_BROKEN_Q: CompassQuestion = {
  code: 'sleep_broken_freq', dimension: 'sleep_recovery', kind: 'single', required: true,
  prompt: 'Hoe vaak per week word je \'s nachts wakker zonder direct weer in slaap te vallen?',
  options: [
    { value: 'rarely',   label: 'Zelden of nooit',         score: 100 },
    { value: 'once',     label: '1 keer per week',          score: 75  },
    { value: 'few',      label: '2 – 3 keer per week',      score: 50  },
    { value: 'most',     label: '4 – 5 keer per week',      score: 25  },
    { value: 'nightly',  label: 'Bijna elke nacht',         score: 0   },
  ],
}
const SLEEP_REFRESH_Q: CompassQuestion = {
  code: 'sleep_refreshed', dimension: 'sleep_recovery', kind: 'likert', scale: 5, best: 5, required: true,
  prompt: 'Hoe uitgerust voel je je doorgaans bij het opstaan?',
  help:   '1 = volledig op · 5 = uitgerust en helder',
}

// ──────────────────────────────────────────────────────────────────────────
// Energy & Capacity (4 vragen)
// ──────────────────────────────────────────────────────────────────────────
const ENERGY_BASELINE_Q: CompassQuestion = {
  code: 'energy_baseline', dimension: 'energy_capacity', kind: 'likert', scale: 5, best: 5, required: true,
  prompt: 'Hoe beoordeel je je energieniveau over een gemiddelde dag?',
  help:   '1 = constant moe · 5 = energiek tot in de avond',
}
const ENERGY_CRASH_Q: CompassQuestion = {
  code: 'energy_crash_freq', dimension: 'energy_capacity', kind: 'single', required: true,
  prompt: 'Hoe vaak heb je een duidelijke energiedip overdag?',
  options: [
    { value: 'never',    label: 'Niet of zelden',          score: 100 },
    { value: 'weekly',   label: 'Een paar keer per week',   score: 60  },
    { value: 'most',     label: 'De meeste dagen',          score: 30  },
    { value: 'daily',    label: 'Dagelijks, meerdere keren', score: 0   },
  ],
}
const BUSY_DAY_Q: CompassQuestion = {
  code: 'busy_day_freq', dimension: 'energy_capacity', kind: 'single', required: true,
  prompt: 'Hoeveel "drukke" dagen heb je per week (vol agenda, hoge cognitieve belasting)?',
  options: [
    { value: '0-1', label: '0 – 1 dag',  score: 100 },
    { value: '2-3', label: '2 – 3 dagen', score: 75  },
    { value: '4-5', label: '4 – 5 dagen', score: 40  },
    { value: '6-7', label: 'Bijna elke dag', score: 10 },
  ],
}
const RECOVERY_TIME_Q: CompassQuestion = {
  code: 'recovery_after_stress', dimension: 'energy_capacity', kind: 'single', required: true,
  prompt: 'Hoe snel herstel je na een drukke dag of korte nacht?',
  options: [
    { value: 'fast',   label: 'Snel — één goede nacht is genoeg',     score: 100 },
    { value: 'medium', label: 'Twee dagen meestal voldoende',          score: 70  },
    { value: 'slow',   label: 'Drie of meer dagen',                    score: 35  },
    { value: 'never',  label: 'Voelt alsof ik niet meer bijkom',       score: 0   },
  ],
}

// ──────────────────────────────────────────────────────────────────────────
// Stress & Context (4 vragen)
// ──────────────────────────────────────────────────────────────────────────
const STRESS_LEVEL_Q: CompassQuestion = {
  code: 'stress_level', dimension: 'stress_context', kind: 'likert', scale: 5, best: 1, required: true,
  prompt: 'Hoe hoog is je gemiddelde stressniveau op een werkdag?',
  help:   '1 = ontspannen · 5 = constant onder druk',
}
const STRESS_SOURCE_Q: CompassQuestion = {
  code: 'stress_source', dimension: 'stress_context', kind: 'multi', required: false,
  prompt: 'Wat zijn op dit moment je belangrijkste stressbronnen?',
  help:   'Selecteer alles wat van toepassing is — context voor je advies.',
  multiAggregation: 'sum',
  options: [
    { value: 'work',          label: 'Werkdruk' },
    { value: 'parenting',     label: 'Opvoeden / gezin' },
    { value: 'caregiving',    label: 'Mantelzorg' },
    { value: 'finances',      label: 'Financiën' },
    { value: 'relationship',  label: 'Relatie' },
    { value: 'health',        label: 'Eigen gezondheid' },
    { value: 'other',         label: 'Anders' },
  ],
}
const STRESS_TOOLS_Q: CompassQuestion = {
  code: 'stress_tools_use', dimension: 'stress_context', kind: 'single', required: true,
  prompt: 'Heb je actieve manieren waarop je tot rust komt (wandelen, ademhaling, sport, etc.)?',
  options: [
    { value: 'daily',     label: 'Dagelijks',                         score: 100 },
    { value: 'often',     label: 'Een paar keer per week',             score: 75  },
    { value: 'sometimes', label: 'Soms',                               score: 45  },
    { value: 'rarely',    label: 'Zelden tot nooit',                   score: 15  },
  ],
}
const SUPPORT_Q: CompassQuestion = {
  code: 'support_network', dimension: 'stress_context', kind: 'likert', scale: 5, best: 5, required: true,
  prompt: 'Hoe sterk voel je je gesteund door mensen om je heen voor wat je nu doormaakt?',
  help:   '1 = sta er alleen voor · 5 = zeer goed gesteund',
}

// ──────────────────────────────────────────────────────────────────────────
// Lifestyle (4 vragen)
// ──────────────────────────────────────────────────────────────────────────
const ALCOHOL_Q: CompassQuestion = {
  code: 'alcohol_freq', dimension: 'lifestyle', kind: 'single', required: true,
  prompt: 'Hoe vaak drink je alcohol?',
  options: [
    { value: 'never',     label: 'Niet of zelden',                     score: 100 },
    { value: 'weekly',    label: '1 – 2 keer per week',                 score: 75  },
    { value: 'frequent',  label: '3 – 5 keer per week',                 score: 40  },
    { value: 'daily',     label: '(Bijna) dagelijks',                   score: 10  },
  ],
}
const MOVEMENT_Q: CompassQuestion = {
  code: 'movement_freq', dimension: 'lifestyle', kind: 'single', required: true,
  prompt: 'Hoeveel dagen per week beweeg je intensief minstens 30 min?',
  options: [
    { value: '0',   label: '0 dagen',     score: 0   },
    { value: '1-2', label: '1 – 2 dagen', score: 40  },
    { value: '3-4', label: '3 – 4 dagen', score: 90  },
    { value: '5+',  label: '5+ dagen',    score: 100 },
  ],
}
const STRENGTH_Q: CompassQuestion = {
  code: 'strength_training', dimension: 'lifestyle', kind: 'single', required: true,
  prompt: 'Doe je krachttraining (gewichten, weerstand) op enige regelmatige basis?',
  help:   'Vanaf de 40 wordt dit echt belangrijk voor botten en spiermassa.',
  options: [
    { value: 'twice_plus', label: '2+ keer per week',   score: 100 },
    { value: 'weekly',     label: 'Wekelijks',           score: 70  },
    { value: 'sometimes',  label: 'Af en toe',           score: 40  },
    { value: 'never',      label: 'Niet',                score: 10  },
  ],
}
const NUTRITION_Q: CompassQuestion = {
  code: 'nutrition_protein', dimension: 'lifestyle', kind: 'likert', scale: 5, best: 5, required: true,
  prompt: 'Eet je dagelijks bewust eiwitrijk (vlees, vis, peulvruchten, zuivel) bij elke maaltijd?',
  help:   '1 = niet bewust mee bezig · 5 = altijd, bij elke maaltijd',
}

// ──────────────────────────────────────────────────────────────────────────
// Self-awareness (3 vragen)
// ──────────────────────────────────────────────────────────────────────────
const SELF_KNOWLEDGE_Q: CompassQuestion = {
  code: 'self_knowledge', dimension: 'self_awareness', kind: 'likert', scale: 5, best: 5, required: true,
  prompt: 'Hoe goed begrijp je wat er hormonaal in je lichaam gebeurt op dit moment?',
  help:   '1 = totaal geen idee · 5 = goed onderlegd',
}
const TRACKING_HISTORY_Q: CompassQuestion = {
  code: 'tracking_history', dimension: 'self_awareness', kind: 'single', required: true,
  prompt: 'Heb je eerder symptomen of cyclus systematisch bijgehouden?',
  options: [
    { value: 'never',         label: 'Nooit',                                                 score: 30 },
    { value: 'occasionally',  label: 'Heel af en toe',                                         score: 50 },
    { value: 'app_briefly',   label: 'Ja, met een app — voor korte tijd',                      score: 70 },
    { value: 'consistent',    label: 'Ja, consistent (>3 maanden)',                            score: 100 },
  ],
}
const READINESS_Q: CompassQuestion = {
  code: 'tracking_readiness', dimension: 'self_awareness', kind: 'likert', scale: 5, best: 5, required: true,
  prompt: 'Hoe gemotiveerd ben je om de komende 90 dagen dagelijks 60 seconden te besteden aan een check-in?',
  help:   '1 = zal niet lukken · 5 = vol motivatie',
}

// ──────────────────────────────────────────────────────────────────────────
// Open vrije velden — context naar Claude (niet gescoord)
// ──────────────────────────────────────────────────────────────────────────
const TOP_CONCERN_Q: CompassQuestion = {
  code: 'top_concern', dimension: 'meta', kind: 'text', required: false, contextOnly: true,
  prompt: 'Wat zou je het liefst opgelost zien in de komende 90 dagen?',
  help:   'Eén of twee zinnen is genoeg. (Optioneel.)',
}
const GOAL_90D_Q: CompassQuestion = {
  code: 'goal_90d', dimension: 'meta', kind: 'text', required: false, contextOnly: true,
  prompt: 'Wat zou voor jou succes zijn over 90 dagen?',
  help:   'Bijv. "doorslapen", "weer mezelf voelen", "geen hot flashes meer overdag". (Optioneel.)',
}

// ──────────────────────────────────────────────────────────────────────────
// Definitieve volgorde
// ──────────────────────────────────────────────────────────────────────────
export const ALL_QUESTIONS: CompassQuestion[] = [
  STAGE_QUESTION,
  AGE_QUESTION,
  HRT_QUESTION,
  // symptoms (één van de twee toont, afhankelijk van stage)
  SYMPTOMS_PERI_QUESTION,
  SYMPTOMS_REGULAR_QUESTION,
  SYMPTOM_INTENSITY_QUESTION,
  SYMPTOM_DISRUPTION_QUESTION,
  // sleep
  SLEEP_QUALITY_Q, SLEEP_DURATION_Q, SLEEP_BROKEN_Q, SLEEP_REFRESH_Q,
  // energy
  ENERGY_BASELINE_Q, ENERGY_CRASH_Q, BUSY_DAY_Q, RECOVERY_TIME_Q,
  // stress
  STRESS_LEVEL_Q, STRESS_SOURCE_Q, STRESS_TOOLS_Q, SUPPORT_Q,
  // lifestyle
  ALCOHOL_Q, MOVEMENT_Q, STRENGTH_Q, NUTRITION_Q,
  // self-awareness
  SELF_KNOWLEDGE_Q, TRACKING_HISTORY_Q, READINESS_Q,
  // open
  TOP_CONCERN_Q, GOAL_90D_Q,
]

/** Filter de questions op gegeven stage. */
export function questionsForStage(stage: Stage): CompassQuestion[] {
  return ALL_QUESTIONS.filter((q) => !q.showIfStage || q.showIfStage.includes(stage))
}
