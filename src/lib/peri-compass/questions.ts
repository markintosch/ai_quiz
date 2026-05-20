/**
 * Peri-Compass — meertalige vragenset (NL/EN/FR/DE).
 *
 * Architectuur:
 *  - RAW_QUESTIONS bevat per vraag een `prompts` map (één string per locale)
 *    en optionele `helps` map. Opties hebben een `labels` map.
 *  - getLocalizedQuestions(lang) plat de structuur naar één LocalizedQuestion
 *    array per gevraagde taal — wat consumers (UI + scoring) gebruiken.
 *  - Stage- en dimensie-keys blijven taal-onafhankelijk (zelfde DB en scoring).
 */

import type { Lang } from './i18n'

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

type I18nMap = Record<Lang, string>

export interface RawOption {
  value:  string
  labels: I18nMap
  score?: number
}

export interface RawQuestion {
  code:        string
  dimension:   Dimension
  kind:        QuestionKind
  prompts:     I18nMap
  helps?:      I18nMap
  scale?:      number
  best?:       number
  options?:    RawOption[]
  multiAggregation?: 'avg' | 'sum' | 'max'
  showIfStage?: Stage[]
  contextOnly?: boolean
  required?:   boolean
}

export interface LocalizedOption {
  value: string
  label: string
  score?: number
}

export interface LocalizedQuestion {
  code:        string
  dimension:   Dimension
  kind:        QuestionKind
  prompt:      string
  help?:       string
  scale?:      number
  best?:       number
  options?:    LocalizedOption[]
  multiAggregation?: 'avg' | 'sum' | 'max'
  showIfStage?: Stage[]
  contextOnly?: boolean
  required?:   boolean
}

// Voor backwards-compat met bestaande imports (CompassQuestion alias)
export type CompassQuestion = LocalizedQuestion

// ──────────────────────────────────────────────────────────────────────────
// Q0 — Stage (entry vraag)
// ──────────────────────────────────────────────────────────────────────────
export const STAGE_QUESTION_RAW: RawQuestion = {
  code: 'stage', dimension: 'meta', kind: 'single', required: true,
  prompts: {
    nl: 'Welk stadium past het beste bij waar je nu staat?',
    en: 'Which stage best matches where you are now?',
    fr: 'Quel stade correspond le mieux à votre situation actuelle ?',
    de: 'Welches Stadium passt am besten zu deinem aktuellen Stand?',
  },
  helps: {
    nl: 'Heel kort: dit bepaalt welke vragen we je verder stellen.',
    en: 'Briefly: this determines which questions we ask next.',
    fr: 'En bref : cela détermine les questions suivantes.',
    de: 'Kurz: das bestimmt, welche Fragen als Nächstes kommen.',
  },
  options: [
    { value: 'regular_cycle',          labels: { nl: 'Regelmatige cyclus', en: 'Regular cycle', fr: 'Cycle régulier', de: 'Regelmässiger Zyklus' } },
    { value: 'irregular_cycle',        labels: { nl: 'Onregelmatige cyclus / vermoedelijk perimenopauze', en: 'Irregular cycle / suspected perimenopause', fr: 'Cycle irrégulier / périménopause suspectée', de: 'Unregelmässiger Zyklus / vermutete Perimenopause' } },
    { value: 'perimenopause_diagnosed',labels: { nl: 'Perimenopauze (vastgesteld door arts)', en: 'Perimenopause (diagnosed)', fr: 'Périménopause (diagnostiquée)', de: 'Perimenopause (diagnostiziert)' } },
    { value: 'postmenopause',          labels: { nl: 'Postmenopauze (>1 jaar geen menstruatie)', en: 'Postmenopause (>1 year without period)', fr: 'Post-ménopause (>1 an sans règles)', de: 'Postmenopause (>1 Jahr ohne Periode)' } },
    { value: 'unknown',                labels: { nl: 'Weet ik niet zeker', en: 'Not sure', fr: 'Je ne sais pas', de: 'Weiss ich nicht' } },
  ],
}

const AGE: RawQuestion = {
  code: 'age_band', dimension: 'meta', kind: 'single', required: true,
  prompts: { nl: 'In welke leeftijdscategorie val je?', en: 'Which age range fits you?', fr: 'Dans quelle tranche d\'âge vous situez-vous ?', de: 'In welche Altersgruppe gehörst du?' },
  options: [
    { value: '<35',   labels: { nl: 'Onder 35',     en: 'Under 35',  fr: 'Moins de 35', de: 'Unter 35' } },
    { value: '35-39', labels: { nl: '35 – 39',      en: '35 – 39',   fr: '35 – 39',     de: '35 – 39' } },
    { value: '40-44', labels: { nl: '40 – 44',      en: '40 – 44',   fr: '40 – 44',     de: '40 – 44' } },
    { value: '45-49', labels: { nl: '45 – 49',      en: '45 – 49',   fr: '45 – 49',     de: '45 – 49' } },
    { value: '50-54', labels: { nl: '50 – 54',      en: '50 – 54',   fr: '50 – 54',     de: '50 – 54' } },
    { value: '55+',   labels: { nl: '55 of ouder',  en: '55 or older', fr: '55 ou plus', de: '55 oder älter' } },
  ],
}

const HRT: RawQuestion = {
  code: 'hrt_status', dimension: 'meta', kind: 'single', required: false,
  showIfStage: ['perimenopause_diagnosed', 'postmenopause'],
  prompts: {
    nl: 'Gebruik je hormoontherapie (HRT)?',
    en: 'Are you using hormone therapy (HRT)?',
    fr: 'Suivez-vous un traitement hormonal substitutif (THS) ?',
    de: 'Nimmst du Hormontherapie (HRT)?',
  },
  helps: {
    nl: 'Dit beïnvloedt hoe we je antwoorden lezen. Sla over als je niet wilt antwoorden.',
    en: 'This affects how we interpret your answers. Skip if you prefer not to answer.',
    fr: 'Cela influe sur l\'interprétation de vos réponses. Ignorez si vous préférez ne pas répondre.',
    de: 'Das beeinflusst, wie wir deine Antworten lesen. Überspringe, wenn du nicht antworten möchtest.',
  },
  options: [
    { value: 'none',           labels: { nl: 'Nee, geen HRT',                en: 'No HRT',                fr: 'Pas de THS',                  de: 'Nein, keine HRT' } },
    { value: 'considering',    labels: { nl: 'Overweeg het',                  en: 'Considering it',         fr: 'J\'y réfléchis',              de: 'Erwäge es' } },
    { value: 'using',          labels: { nl: 'Ja, gebruik HRT',               en: 'Yes, using HRT',         fr: 'Oui, je suis sous THS',       de: 'Ja, nutze HRT' } },
    { value: 'stopped',        labels: { nl: 'Heb HRT gebruikt, gestopt',     en: 'Used HRT, stopped',      fr: 'J\'ai pris THS, arrêté',      de: 'Habe HRT genutzt, beendet' } },
    { value: 'prefer_not_say', labels: { nl: 'Wil ik niet zeggen',            en: 'Prefer not to say',      fr: 'Je préfère ne pas dire',      de: 'Möchte nicht antworten' } },
  ],
}

const SYM_PERI: RawQuestion = {
  code: 'symptoms.peri', dimension: 'symptom_burden', kind: 'multi', required: true,
  showIfStage: ['irregular_cycle', 'perimenopause_diagnosed', 'postmenopause', 'unknown'],
  prompts: { nl: 'Welke van deze symptomen ervaar je nu regelmatig?', en: 'Which of these symptoms do you experience regularly?', fr: 'Lequel de ces symptômes ressentez-vous régulièrement ?', de: 'Welche dieser Symptome erlebst du regelmässig?' },
  helps:   { nl: 'Selecteer alles wat de afgelopen 4 weken meerdere keren voorkwam.', en: 'Select everything that occurred multiple times in the past 4 weeks.', fr: 'Sélectionnez tout ce qui s\'est produit plusieurs fois ces 4 dernières semaines.', de: 'Wähle alles, was in den letzten 4 Wochen mehrfach vorkam.' },
  multiAggregation: 'sum',
  options: [
    { value: 'hot_flashes',     labels: { nl: 'Opvliegers',                en: 'Hot flashes',              fr: 'Bouffées de chaleur',       de: 'Hitzewallungen' } },
    { value: 'night_sweats',    labels: { nl: 'Nachtelijk zweten',         en: 'Night sweats',             fr: 'Sueurs nocturnes',          de: 'Nachtschweiss' } },
    { value: 'sleep_broken',    labels: { nl: 'Onderbroken slaap',         en: 'Broken sleep',             fr: 'Sommeil interrompu',        de: 'Unterbrochener Schlaf' } },
    { value: 'brain_fog',       labels: { nl: 'Hersenmist / concentratie', en: 'Brain fog / concentration',fr: 'Brouillard mental / concentration', de: 'Hirnnebel / Konzentration' } },
    { value: 'mood_swings',     labels: { nl: 'Stemmingswisselingen',      en: 'Mood swings',              fr: 'Sautes d\'humeur',           de: 'Stimmungsschwankungen' } },
    { value: 'irritability',    labels: { nl: 'Korter lontje',             en: 'Irritability',             fr: 'Irritabilité',               de: 'Reizbarkeit' } },
    { value: 'low_mood',        labels: { nl: 'Sombere stemming',          en: 'Low mood',                 fr: 'Humeur basse',               de: 'Gedrückte Stimmung' } },
    { value: 'anxiety',         labels: { nl: 'Angst / piekeren',          en: 'Anxiety / worry',          fr: 'Anxiété / soucis',           de: 'Angst / Grübeln' } },
    { value: 'joint_pain',      labels: { nl: 'Gewrichts- of spierpijn',   en: 'Joint or muscle pain',     fr: 'Douleurs articulaires ou musculaires', de: 'Gelenk- oder Muskelschmerzen' } },
    { value: 'headaches',       labels: { nl: 'Hoofdpijn / migraine',      en: 'Headaches / migraine',     fr: 'Maux de tête / migraine',    de: 'Kopfschmerzen / Migräne' } },
    { value: 'low_libido',      labels: { nl: 'Verminderd libido',         en: 'Low libido',               fr: 'Baisse de libido',           de: 'Verminderte Libido' } },
    { value: 'vaginal_dryness', labels: { nl: 'Vaginale droogheid',        en: 'Vaginal dryness',          fr: 'Sécheresse vaginale',        de: 'Vaginale Trockenheit' } },
    { value: 'palpitations',    labels: { nl: 'Hartkloppingen',            en: 'Heart palpitations',       fr: 'Palpitations',               de: 'Herzklopfen' } },
    { value: 'weight_gain',     labels: { nl: 'Gewichtstoename rond middel', en: 'Weight gain around waist', fr: 'Prise de poids au ventre',  de: 'Gewichtszunahme um die Mitte' } },
    { value: 'hair_skin',       labels: { nl: 'Veranderingen huid / haar',  en: 'Skin / hair changes',     fr: 'Changements peau / cheveux', de: 'Veränderungen Haut / Haare' } },
    { value: 'fatigue',         labels: { nl: 'Aanhoudende vermoeidheid',   en: 'Persistent fatigue',      fr: 'Fatigue persistante',        de: 'Anhaltende Müdigkeit' } },
  ],
}

const SYM_REG: RawQuestion = {
  code: 'symptoms.regular', dimension: 'symptom_burden', kind: 'multi', required: true,
  showIfStage: ['regular_cycle'],
  prompts: { nl: 'Welke van deze ervaar je rond je cyclus?', en: 'Which of these do you experience around your cycle?', fr: 'Lequel de ces ressentis avez-vous autour de votre cycle ?', de: 'Welche dieser Symptome erlebst du rund um deinen Zyklus?' },
  helps:   { nl: 'Selecteer alles wat in je laatste 2 cycli meerdere dagen voorkwam.', en: 'Select everything that occurred multiple days in your last 2 cycles.', fr: 'Sélectionnez tout ce qui s\'est produit plusieurs jours lors de vos 2 derniers cycles.', de: 'Wähle alles, was in deinen letzten 2 Zyklen an mehreren Tagen vorkam.' },
  multiAggregation: 'sum',
  options: [
    { value: 'pms_mood',       labels: { nl: 'PMS / stemmingsdips',           en: 'PMS / mood dips',           fr: 'SPM / baisses d\'humeur',     de: 'PMS / Stimmungstiefs' } },
    { value: 'cramps',         labels: { nl: 'Menstruatiekrampen',            en: 'Menstrual cramps',          fr: 'Crampes menstruelles',         de: 'Menstruationskrämpfe' } },
    { value: 'bloating',       labels: { nl: 'Opgeblazen gevoel',             en: 'Bloating',                  fr: 'Ballonnements',                de: 'Blähgefühl' } },
    { value: 'tender_breasts', labels: { nl: 'Gevoelige borsten',             en: 'Tender breasts',            fr: 'Seins sensibles',              de: 'Empfindliche Brüste' } },
    { value: 'fatigue_pre',    labels: { nl: 'Vermoeidheid vóór menstruatie', en: 'Fatigue before period',     fr: 'Fatigue avant les règles',     de: 'Müdigkeit vor der Periode' } },
    { value: 'headaches',      labels: { nl: 'Hoofdpijn / migraine',          en: 'Headaches / migraine',      fr: 'Maux de tête / migraine',      de: 'Kopfschmerzen / Migräne' } },
    { value: 'mood_swings',    labels: { nl: 'Stemmingswisselingen',          en: 'Mood swings',               fr: 'Sautes d\'humeur',              de: 'Stimmungsschwankungen' } },
    { value: 'sleep_disturb',  labels: { nl: 'Slaapproblemen rond cyclus',    en: 'Sleep issues around cycle', fr: 'Troubles du sommeil autour du cycle', de: 'Schlafprobleme rund um den Zyklus' } },
    { value: 'sugar_cravings', labels: { nl: 'Zoetbehoefte rond menstruatie', en: 'Sugar cravings around period', fr: 'Envies de sucre avant les règles', de: 'Heisshunger auf Süsses um die Periode' } },
    { value: 'low_energy_pms', labels: { nl: 'Energiedip in luteale fase',    en: 'Energy dip in luteal phase',fr: 'Baisse d\'énergie en phase lutéale', de: 'Energietief in der Lutealphase' } },
  ],
}

const SYM_INT: RawQuestion = {
  code: 'symptom_intensity', dimension: 'symptom_burden', kind: 'likert', scale: 5, best: 1, required: true,
  prompts: { nl: 'Hoe belastend zijn je symptomen op een gemiddelde dag?', en: 'How burdensome are your symptoms on an average day?', fr: 'À quel point vos symptômes sont-ils gênants un jour moyen ?', de: 'Wie belastend sind deine Symptome an einem durchschnittlichen Tag?' },
  helps:   { nl: '1 = nauwelijks merkbaar · 5 = beperken me significant', en: '1 = barely noticeable · 5 = significantly limit me', fr: '1 = à peine perceptible · 5 = me limitent significativement', de: '1 = kaum spürbar · 5 = schränken mich deutlich ein' },
}
const SYM_DIS: RawQuestion = {
  code: 'symptom_disruption', dimension: 'symptom_burden', kind: 'single', required: true,
  prompts: { nl: 'Hoe vaak verstoren je symptomen je dagelijks functioneren?', en: 'How often do your symptoms disrupt your daily functioning?', fr: 'À quelle fréquence vos symptômes perturbent-ils votre fonctionnement quotidien ?', de: 'Wie oft beeinträchtigen deine Symptome dein tägliches Funktionieren?' },
  options: [
    { value: 'never',    labels: { nl: 'Nooit',                  en: 'Never',                  fr: 'Jamais',                       de: 'Nie' },                       score: 100 },
    { value: 'monthly',  labels: { nl: 'Een paar keer per maand', en: 'A few times per month',  fr: 'Quelques fois par mois',       de: 'Einige Male pro Monat' },     score: 75  },
    { value: 'weekly',   labels: { nl: 'Wekelijks',               en: 'Weekly',                 fr: 'Chaque semaine',               de: 'Wöchentlich' },               score: 50  },
    { value: 'frequent', labels: { nl: 'Meerdere keren per week', en: 'Multiple times per week',fr: 'Plusieurs fois par semaine',   de: 'Mehrmals pro Woche' },        score: 25  },
    { value: 'daily',    labels: { nl: 'Dagelijks',               en: 'Daily',                  fr: 'Tous les jours',               de: 'Täglich' },                   score: 0   },
  ],
}

const SLEEP_QUAL: RawQuestion = {
  code: 'sleep_quality', dimension: 'sleep_recovery', kind: 'likert', scale: 5, best: 5, required: true,
  prompts: { nl: 'Hoe waardeer je je slaap-kwaliteit van de afgelopen 4 weken?', en: 'How do you rate your sleep quality over the past 4 weeks?', fr: 'Comment évaluez-vous la qualité de votre sommeil ces 4 dernières semaines ?', de: 'Wie bewertest du deine Schlafqualität der letzten 4 Wochen?' },
  helps:   { nl: '1 = slecht · 5 = uitstekend', en: '1 = poor · 5 = excellent', fr: '1 = mauvais · 5 = excellent', de: '1 = schlecht · 5 = ausgezeichnet' },
}
const SLEEP_DUR: RawQuestion = {
  code: 'sleep_duration', dimension: 'sleep_recovery', kind: 'single', required: true,
  prompts: { nl: 'Hoeveel uur slaap krijg je gemiddeld per nacht?', en: 'How many hours of sleep do you get on average per night?', fr: 'Combien d\'heures de sommeil par nuit en moyenne ?', de: 'Wie viele Stunden Schlaf bekommst du im Schnitt pro Nacht?' },
  options: [
    { value: '<5',  labels: { nl: 'Minder dan 5 uur', en: 'Less than 5 hours', fr: 'Moins de 5 heures', de: 'Weniger als 5 Stunden' }, score: 0   },
    { value: '5-6', labels: { nl: '5 – 6 uur',         en: '5 – 6 hours',       fr: '5 – 6 heures',       de: '5 – 6 Stunden' },         score: 30  },
    { value: '6-7', labels: { nl: '6 – 7 uur',         en: '6 – 7 hours',       fr: '6 – 7 heures',       de: '6 – 7 Stunden' },         score: 60  },
    { value: '7-8', labels: { nl: '7 – 8 uur',         en: '7 – 8 hours',       fr: '7 – 8 heures',       de: '7 – 8 Stunden' },         score: 100 },
    { value: '8+',  labels: { nl: 'Meer dan 8 uur',    en: 'More than 8 hours', fr: 'Plus de 8 heures',   de: 'Mehr als 8 Stunden' },    score: 90  },
  ],
}
const SLEEP_BR: RawQuestion = {
  code: 'sleep_broken_freq', dimension: 'sleep_recovery', kind: 'single', required: true,
  prompts: { nl: 'Hoe vaak per week word je \'s nachts wakker zonder direct weer in slaap te vallen?', en: 'How often per week do you wake at night without falling back asleep quickly?', fr: 'À quelle fréquence par semaine vous réveillez-vous la nuit sans vous rendormir rapidement ?', de: 'Wie oft pro Woche wachst du nachts auf, ohne schnell wieder einzuschlafen?' },
  options: [
    { value: 'rarely',  labels: { nl: 'Zelden of nooit',     en: 'Rarely or never',         fr: 'Rarement ou jamais',     de: 'Selten oder nie' },         score: 100 },
    { value: 'once',    labels: { nl: '1 keer per week',     en: 'Once a week',             fr: '1 fois par semaine',     de: '1 Mal pro Woche' },         score: 75  },
    { value: 'few',     labels: { nl: '2 – 3 keer per week', en: '2 – 3 times a week',      fr: '2 – 3 fois par semaine', de: '2 – 3 Mal pro Woche' },     score: 50  },
    { value: 'most',    labels: { nl: '4 – 5 keer per week', en: '4 – 5 times a week',      fr: '4 – 5 fois par semaine', de: '4 – 5 Mal pro Woche' },     score: 25  },
    { value: 'nightly', labels: { nl: 'Bijna elke nacht',    en: 'Almost every night',      fr: 'Presque chaque nuit',    de: 'Fast jede Nacht' },         score: 0   },
  ],
}
const SLEEP_REF: RawQuestion = {
  code: 'sleep_refreshed', dimension: 'sleep_recovery', kind: 'likert', scale: 5, best: 5, required: true,
  prompts: { nl: 'Hoe uitgerust voel je je doorgaans bij het opstaan?', en: 'How rested do you usually feel on waking?', fr: 'À quel point vous sentez-vous reposée au réveil ?', de: 'Wie erholt fühlst du dich beim Aufwachen üblicherweise?' },
  helps:   { nl: '1 = volledig op · 5 = uitgerust en helder', en: '1 = exhausted · 5 = rested and clear', fr: '1 = épuisée · 5 = reposée et claire', de: '1 = erschöpft · 5 = erholt und klar' },
}

const EN_BASE: RawQuestion = {
  code: 'energy_baseline', dimension: 'energy_capacity', kind: 'likert', scale: 5, best: 5, required: true,
  prompts: { nl: 'Hoe beoordeel je je energieniveau over een gemiddelde dag?', en: 'How do you rate your energy on an average day?', fr: 'Comment évaluez-vous votre énergie un jour moyen ?', de: 'Wie bewertest du deine Energie an einem durchschnittlichen Tag?' },
  helps:   { nl: '1 = constant moe · 5 = energiek tot in de avond', en: '1 = constantly tired · 5 = energetic into the evening', fr: '1 = constamment fatiguée · 5 = pleine d\'énergie jusqu\'au soir', de: '1 = ständig müde · 5 = energiegeladen bis abends' },
}
const EN_CRASH: RawQuestion = {
  code: 'energy_crash_freq', dimension: 'energy_capacity', kind: 'single', required: true,
  prompts: { nl: 'Hoe vaak heb je een duidelijke energiedip overdag?', en: 'How often do you have a clear energy dip during the day?', fr: 'À quelle fréquence avez-vous une nette baisse d\'énergie en journée ?', de: 'Wie oft hast du tagsüber ein deutliches Energietief?' },
  options: [
    { value: 'never',  labels: { nl: 'Niet of zelden',          en: 'Not or rarely',         fr: 'Jamais ou rarement',       de: 'Nicht oder selten' },        score: 100 },
    { value: 'weekly', labels: { nl: 'Een paar keer per week',  en: 'A few times a week',     fr: 'Quelques fois par semaine', de: 'Ein paar Mal pro Woche' },   score: 60  },
    { value: 'most',   labels: { nl: 'De meeste dagen',         en: 'Most days',              fr: 'La plupart des jours',     de: 'An den meisten Tagen' },     score: 30  },
    { value: 'daily',  labels: { nl: 'Dagelijks, meerdere keren', en: 'Daily, multiple times', fr: 'Tous les jours, plusieurs fois', de: 'Täglich, mehrmals' },   score: 0   },
  ],
}
const BUSY: RawQuestion = {
  code: 'busy_day_freq', dimension: 'energy_capacity', kind: 'single', required: true,
  prompts: { nl: 'Hoeveel "drukke" dagen heb je per week (vol agenda, hoge cognitieve belasting)?', en: 'How many "busy" days do you have per week (full schedule, high cognitive load)?', fr: 'Combien de journées "chargées" avez-vous par semaine (agenda plein, forte charge cognitive) ?', de: 'Wie viele "volle" Tage hast du pro Woche (voller Kalender, hohe kognitive Belastung)?' },
  options: [
    { value: '0-1', labels: { nl: '0 – 1 dag',  en: '0 – 1 day',   fr: '0 – 1 jour',   de: '0 – 1 Tag' },          score: 100 },
    { value: '2-3', labels: { nl: '2 – 3 dagen', en: '2 – 3 days',  fr: '2 – 3 jours',  de: '2 – 3 Tage' },         score: 75  },
    { value: '4-5', labels: { nl: '4 – 5 dagen', en: '4 – 5 days',  fr: '4 – 5 jours',  de: '4 – 5 Tage' },         score: 40  },
    { value: '6-7', labels: { nl: 'Bijna elke dag', en: 'Almost every day', fr: 'Presque chaque jour', de: 'Fast jeden Tag' }, score: 10 },
  ],
}
const RECOV: RawQuestion = {
  code: 'recovery_after_stress', dimension: 'energy_capacity', kind: 'single', required: true,
  prompts: { nl: 'Hoe snel herstel je na een drukke dag of korte nacht?', en: 'How quickly do you recover after a busy day or short night?', fr: 'À quelle vitesse récupérez-vous après une journée chargée ou une nuit courte ?', de: 'Wie schnell erholst du dich nach einem vollen Tag oder einer kurzen Nacht?' },
  options: [
    { value: 'fast',   labels: { nl: 'Snel — één goede nacht is genoeg',   en: 'Fast — one good night is enough', fr: 'Vite — une bonne nuit suffit',  de: 'Schnell — eine gute Nacht reicht' }, score: 100 },
    { value: 'medium', labels: { nl: 'Twee dagen meestal voldoende',       en: 'Two days usually enough',          fr: 'Deux jours suffisent en général',de: 'Zwei Tage reichen meist' },           score: 70  },
    { value: 'slow',   labels: { nl: 'Drie of meer dagen',                  en: 'Three or more days',               fr: 'Trois jours ou plus',           de: 'Drei oder mehr Tage' },               score: 35  },
    { value: 'never',  labels: { nl: 'Voelt alsof ik niet meer bijkom',     en: 'Feels like I don\'t recover',      fr: 'J\'ai l\'impression de ne plus récupérer', de: 'Fühlt sich an, als käme ich nicht mehr nach' }, score: 0 },
  ],
}

const STR_LVL: RawQuestion = {
  code: 'stress_level', dimension: 'stress_context', kind: 'likert', scale: 5, best: 1, required: true,
  prompts: { nl: 'Hoe hoog is je gemiddelde stressniveau op een werkdag?', en: 'How high is your average stress level on a workday?', fr: 'À quel point votre stress moyen est-il élevé un jour de travail ?', de: 'Wie hoch ist dein durchschnittliches Stressniveau an einem Arbeitstag?' },
  helps:   { nl: '1 = ontspannen · 5 = constant onder druk', en: '1 = relaxed · 5 = constant pressure', fr: '1 = détendue · 5 = sous pression constante', de: '1 = entspannt · 5 = ständig unter Druck' },
}
const STR_SRC: RawQuestion = {
  code: 'stress_source', dimension: 'stress_context', kind: 'multi', required: false,
  multiAggregation: 'sum',
  prompts: { nl: 'Wat zijn op dit moment je belangrijkste stressbronnen?', en: 'What are your main stressors right now?', fr: 'Quelles sont vos principales sources de stress en ce moment ?', de: 'Was sind deine wichtigsten Stressquellen im Moment?' },
  helps:   { nl: 'Selecteer alles wat van toepassing is — context voor je advies.', en: 'Select all that apply — context for your advice.', fr: 'Sélectionnez tout ce qui s\'applique — contexte pour vos conseils.', de: 'Wähle alles Zutreffende — Kontext für deine Empfehlung.' },
  options: [
    { value: 'work',         labels: { nl: 'Werkdruk',           en: 'Work pressure',     fr: 'Pression au travail',     de: 'Arbeitsdruck' } },
    { value: 'parenting',    labels: { nl: 'Opvoeden / gezin',    en: 'Parenting / family',fr: 'Éducation / famille',     de: 'Erziehung / Familie' } },
    { value: 'caregiving',   labels: { nl: 'Mantelzorg',          en: 'Caregiving',        fr: 'Aidance',                  de: 'Pflege von Angehörigen' } },
    { value: 'finances',     labels: { nl: 'Financiën',           en: 'Finances',          fr: 'Finances',                 de: 'Finanzen' } },
    { value: 'relationship', labels: { nl: 'Relatie',             en: 'Relationship',      fr: 'Relation',                 de: 'Beziehung' } },
    { value: 'health',       labels: { nl: 'Eigen gezondheid',    en: 'Own health',        fr: 'Ma santé',                 de: 'Eigene Gesundheit' } },
    { value: 'other',        labels: { nl: 'Anders',              en: 'Other',             fr: 'Autre',                    de: 'Anderes' } },
  ],
}
const STR_TOOLS: RawQuestion = {
  code: 'stress_tools_use', dimension: 'stress_context', kind: 'single', required: true,
  prompts: { nl: 'Heb je actieve manieren waarop je tot rust komt (wandelen, ademhaling, sport, etc.)?', en: 'Do you have active ways to wind down (walking, breathing, sport, etc.)?', fr: 'Avez-vous des méthodes actives pour vous détendre (marche, respiration, sport, etc.) ?', de: 'Hast du aktive Methoden zur Entspannung (Spazieren, Atmung, Sport usw.)?' },
  options: [
    { value: 'daily',     labels: { nl: 'Dagelijks',                en: 'Daily',                  fr: 'Tous les jours',          de: 'Täglich' },              score: 100 },
    { value: 'often',     labels: { nl: 'Een paar keer per week',    en: 'A few times a week',     fr: 'Quelques fois par semaine', de: 'Ein paar Mal pro Woche' }, score: 75  },
    { value: 'sometimes', labels: { nl: 'Soms',                      en: 'Sometimes',              fr: 'Parfois',                  de: 'Manchmal' },               score: 45  },
    { value: 'rarely',    labels: { nl: 'Zelden tot nooit',          en: 'Rarely to never',        fr: 'Rarement ou jamais',       de: 'Selten bis nie' },         score: 15  },
  ],
}
const SUPPORT: RawQuestion = {
  code: 'support_network', dimension: 'stress_context', kind: 'likert', scale: 5, best: 5, required: true,
  prompts: { nl: 'Hoe sterk voel je je gesteund door mensen om je heen voor wat je nu doormaakt?', en: 'How strongly do you feel supported by those around you for what you\'re going through?', fr: 'À quel point vous sentez-vous soutenue par votre entourage dans ce que vous traversez ?', de: 'Wie stark fühlst du dich von deinem Umfeld unterstützt für das, was du gerade durchmachst?' },
  helps:   { nl: '1 = sta er alleen voor · 5 = zeer goed gesteund', en: '1 = on my own · 5 = very well supported', fr: '1 = seule · 5 = très bien soutenue', de: '1 = stehe allein da · 5 = sehr gut unterstützt' },
}

const ALC: RawQuestion = {
  code: 'alcohol_freq', dimension: 'lifestyle', kind: 'single', required: true,
  prompts: { nl: 'Hoe vaak drink je alcohol?', en: 'How often do you drink alcohol?', fr: 'À quelle fréquence buvez-vous de l\'alcool ?', de: 'Wie oft trinkst du Alkohol?' },
  options: [
    { value: 'never',    labels: { nl: 'Niet of zelden',        en: 'Not or rarely',     fr: 'Jamais ou rarement',     de: 'Nicht oder selten' },        score: 100 },
    { value: 'weekly',   labels: { nl: '1 – 2 keer per week',    en: '1 – 2 times a week',fr: '1 – 2 fois par semaine', de: '1 – 2 Mal pro Woche' },     score: 75  },
    { value: 'frequent', labels: { nl: '3 – 5 keer per week',    en: '3 – 5 times a week',fr: '3 – 5 fois par semaine', de: '3 – 5 Mal pro Woche' },     score: 40  },
    { value: 'daily',    labels: { nl: '(Bijna) dagelijks',      en: '(Almost) daily',    fr: '(Presque) tous les jours', de: '(Fast) täglich' },        score: 10  },
  ],
}
const MOVE: RawQuestion = {
  code: 'movement_freq', dimension: 'lifestyle', kind: 'single', required: true,
  prompts: { nl: 'Hoeveel dagen per week beweeg je intensief minstens 30 min?', en: 'How many days a week do you exercise intensively for at least 30 min?', fr: 'Combien de jours par semaine faites-vous au moins 30 min d\'activité intensive ?', de: 'An wie vielen Tagen pro Woche bewegst du dich intensiv mindestens 30 Min.?' },
  options: [
    { value: '0',   labels: { nl: '0 dagen',     en: '0 days',     fr: '0 jour',     de: '0 Tage' },     score: 0   },
    { value: '1-2', labels: { nl: '1 – 2 dagen', en: '1 – 2 days', fr: '1 – 2 jours', de: '1 – 2 Tage' }, score: 40  },
    { value: '3-4', labels: { nl: '3 – 4 dagen', en: '3 – 4 days', fr: '3 – 4 jours', de: '3 – 4 Tage' }, score: 90  },
    { value: '5+',  labels: { nl: '5+ dagen',    en: '5+ days',    fr: '5+ jours',    de: '5+ Tage' },    score: 100 },
  ],
}
const STRENGTH: RawQuestion = {
  code: 'strength_training', dimension: 'lifestyle', kind: 'single', required: true,
  prompts: { nl: 'Doe je krachttraining (gewichten, weerstand) op enige regelmatige basis?', en: 'Do you do strength training (weights, resistance) on some regular basis?', fr: 'Pratiquez-vous la musculation (poids, résistance) régulièrement ?', de: 'Machst du Krafttraining (Gewichte, Widerstand) einigermassen regelmässig?' },
  helps:   { nl: 'Vanaf de 40 wordt dit echt belangrijk voor botten en spiermassa.', en: 'From age 40 this becomes really important for bone and muscle mass.', fr: 'À partir de 40 ans, c\'est vraiment important pour les os et la masse musculaire.', de: 'Ab 40 wird das wirklich wichtig für Knochen und Muskelmasse.' },
  options: [
    { value: 'twice_plus', labels: { nl: '2+ keer per week', en: '2+ times a week', fr: '2+ fois par semaine', de: '2+ Mal pro Woche' }, score: 100 },
    { value: 'weekly',     labels: { nl: 'Wekelijks',         en: 'Weekly',          fr: 'Chaque semaine',      de: 'Wöchentlich' },        score: 70  },
    { value: 'sometimes',  labels: { nl: 'Af en toe',         en: 'Occasionally',    fr: 'De temps en temps',   de: 'Gelegentlich' },       score: 40  },
    { value: 'never',      labels: { nl: 'Niet',              en: 'Not at all',      fr: 'Pas du tout',         de: 'Gar nicht' },          score: 10  },
  ],
}
const NUTR: RawQuestion = {
  code: 'nutrition_protein', dimension: 'lifestyle', kind: 'likert', scale: 5, best: 5, required: true,
  prompts: { nl: 'Eet je dagelijks bewust eiwitrijk (vlees, vis, peulvruchten, zuivel) bij elke maaltijd?', en: 'Do you eat protein-rich (meat, fish, legumes, dairy) at every meal, every day?', fr: 'Mangez-vous riche en protéines (viande, poisson, légumineuses, produits laitiers) à chaque repas, chaque jour ?', de: 'Isst du täglich bewusst eiweissreich (Fleisch, Fisch, Hülsenfrüchte, Milchprodukte) bei jeder Mahlzeit?' },
  helps:   { nl: '1 = niet bewust mee bezig · 5 = altijd, bij elke maaltijd', en: '1 = not consciously · 5 = always, every meal', fr: '1 = pas consciemment · 5 = toujours, à chaque repas', de: '1 = nicht bewusst · 5 = immer, bei jeder Mahlzeit' },
}

const SELF_KN: RawQuestion = {
  code: 'self_knowledge', dimension: 'self_awareness', kind: 'likert', scale: 5, best: 5, required: true,
  prompts: { nl: 'Hoe goed begrijp je wat er hormonaal in je lichaam gebeurt op dit moment?', en: 'How well do you understand what\'s happening hormonally in your body right now?', fr: 'À quel point comprenez-vous ce qui se passe hormonalement dans votre corps en ce moment ?', de: 'Wie gut verstehst du, was hormonell in deinem Körper gerade passiert?' },
  helps:   { nl: '1 = totaal geen idee · 5 = goed onderlegd', en: '1 = no idea · 5 = well-informed', fr: '1 = aucune idée · 5 = bien informée', de: '1 = keine Ahnung · 5 = gut informiert' },
}
const TRACK_HIST: RawQuestion = {
  code: 'tracking_history', dimension: 'self_awareness', kind: 'single', required: true,
  prompts: { nl: 'Heb je eerder symptomen of cyclus systematisch bijgehouden?', en: 'Have you previously tracked symptoms or your cycle systematically?', fr: 'Avez-vous déjà suivi vos symptômes ou votre cycle de manière systématique ?', de: 'Hast du Symptome oder Zyklus früher systematisch erfasst?' },
  options: [
    { value: 'never',         labels: { nl: 'Nooit',                                       en: 'Never',                                      fr: 'Jamais',                                            de: 'Nie' },                                                  score: 30  },
    { value: 'occasionally',  labels: { nl: 'Heel af en toe',                              en: 'Very occasionally',                          fr: 'Très occasionnellement',                            de: 'Sehr gelegentlich' },                                    score: 50  },
    { value: 'app_briefly',   labels: { nl: 'Ja, met een app — voor korte tijd',           en: 'Yes, with an app — briefly',                 fr: 'Oui, avec une appli — brièvement',                  de: 'Ja, mit einer App — kurzzeitig' },                       score: 70  },
    { value: 'consistent',    labels: { nl: 'Ja, consistent (>3 maanden)',                 en: 'Yes, consistently (>3 months)',              fr: 'Oui, de manière consistante (>3 mois)',             de: 'Ja, konsistent (>3 Monate)' },                           score: 100 },
  ],
}
const READINESS: RawQuestion = {
  code: 'tracking_readiness', dimension: 'self_awareness', kind: 'likert', scale: 5, best: 5, required: true,
  prompts: { nl: 'Hoe gemotiveerd ben je om de komende 90 dagen dagelijks 60 seconden te besteden aan een check-in?', en: 'How motivated are you to spend 60 seconds daily on a check-in for the next 90 days?', fr: 'À quel point êtes-vous motivée pour consacrer 60 secondes par jour à un check-in pendant les 90 prochains jours ?', de: 'Wie motiviert bist du, in den nächsten 90 Tagen täglich 60 Sekunden für einen Check-in zu investieren?' },
  helps:   { nl: '1 = zal niet lukken · 5 = vol motivatie', en: '1 = won\'t happen · 5 = highly motivated', fr: '1 = ça ne tiendra pas · 5 = très motivée', de: '1 = wird nicht klappen · 5 = voll motiviert' },
}

const TOP_CONCERN: RawQuestion = {
  code: 'top_concern', dimension: 'meta', kind: 'text', required: false, contextOnly: true,
  prompts: { nl: 'Wat zou je het liefst opgelost zien in de komende 90 dagen?', en: 'What would you most like to see resolved in the next 90 days?', fr: 'Que souhaiteriez-vous le plus voir résolu dans les 90 prochains jours ?', de: 'Was möchtest du in den nächsten 90 Tagen am liebsten gelöst sehen?' },
  helps:   { nl: 'Eén of twee zinnen is genoeg. (Optioneel.)', en: 'One or two sentences is enough. (Optional.)', fr: 'Une ou deux phrases suffisent. (Optionnel.)', de: 'Ein oder zwei Sätze reichen. (Optional.)' },
}
const GOAL: RawQuestion = {
  code: 'goal_90d', dimension: 'meta', kind: 'text', required: false, contextOnly: true,
  prompts: { nl: 'Wat zou voor jou succes zijn over 90 dagen?', en: 'What would success look like for you in 90 days?', fr: 'À quoi ressemblerait le succès pour vous dans 90 jours ?', de: 'Wie sähe Erfolg für dich in 90 Tagen aus?' },
  helps:   { nl: 'Bijv. "doorslapen", "weer mezelf voelen", "geen hot flashes meer overdag". (Optioneel.)', en: 'E.g. "sleep through the night", "feel like myself again", "no hot flashes during the day". (Optional.)', fr: 'P. ex. "dormir d\'une traite", "me sentir moi-même", "plus de bouffées en journée". (Optionnel.)', de: 'Z. B. "durchschlafen", "wieder ich selbst sein", "keine Hitzewallungen tagsüber". (Optional.)' },
}

// Volgorde
export const RAW_QUESTIONS: RawQuestion[] = [
  STAGE_QUESTION_RAW, AGE, HRT,
  SYM_PERI, SYM_REG, SYM_INT, SYM_DIS,
  SLEEP_QUAL, SLEEP_DUR, SLEEP_BR, SLEEP_REF,
  EN_BASE, EN_CRASH, BUSY, RECOV,
  STR_LVL, STR_SRC, STR_TOOLS, SUPPORT,
  ALC, MOVE, STRENGTH, NUTR,
  SELF_KN, TRACK_HIST, READINESS,
  TOP_CONCERN, GOAL,
]

// Backwards-compat: oude consumers importeerden ALL_QUESTIONS / STAGE_QUESTION
export const ALL_QUESTIONS = RAW_QUESTIONS
export const STAGE_QUESTION = STAGE_QUESTION_RAW

function localize(q: RawQuestion, lang: Lang): LocalizedQuestion {
  return {
    code:             q.code,
    dimension:        q.dimension,
    kind:             q.kind,
    prompt:           q.prompts[lang] ?? q.prompts.nl,
    help:             q.helps?.[lang]  ?? q.helps?.nl,
    scale:            q.scale,
    best:             q.best,
    multiAggregation: q.multiAggregation,
    showIfStage:      q.showIfStage,
    contextOnly:      q.contextOnly,
    required:         q.required,
    options:          q.options?.map((o) => ({
      value: o.value,
      label: o.labels[lang] ?? o.labels.nl,
      score: o.score,
    })),
  }
}

export function getLocalizedQuestions(lang: Lang): LocalizedQuestion[] {
  return RAW_QUESTIONS.map((q) => localize(q, lang))
}

export function questionsForStage(stage: Stage, lang: Lang = 'nl'): LocalizedQuestion[] {
  return getLocalizedQuestions(lang).filter((q) => !q.showIfStage || q.showIfStage.includes(stage))
}

/** Localized stage-question, voor de eerste stap. */
export function stageQuestion(lang: Lang): LocalizedQuestion {
  return localize(STAGE_QUESTION_RAW, lang)
}
