/**
 * Peri-Compass — Claude integration (meertalig).
 *
 * Output in NL/EN/FR/DE op basis van `lang` parameter. Claude krijgt instructie
 * om in die taal te antwoorden — keys van JSON blijven Engels.
 *
 * GEEN medisch advies. Disclaimer is verplicht in elke output.
 */

import Anthropic from '@anthropic-ai/sdk'
import { jsonrepair } from 'jsonrepair'
import type { CompassScore } from './scoring'
import type { Stage } from './questions'
import type { Lang } from './i18n'
import { ALL_EXPERIMENTS, getExperimentByCode, experimentsForPrompt, EXP_BASELINE_TRACK } from './experiments'

const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929'
const MAX_TOKENS   = 2500
const TIMEOUT_MS   = 90_000

export interface CompassAiOutput {
  observation:         string
  hypotheses:          string[]
  /** De daadwerkelijke experiment-tekst (uit library, evt. licht gepersonaliseerd door Claude) */
  microExperiment:     string
  /** Code uit src/lib/peri-compass/experiments.ts (voor analytics + tracking-koppeling) */
  experimentCode?:     string
  /** Bron-label, gekopieerd uit library — toont onder experiment in UI/email */
  experimentSource?:   string
  /** URL naar de richtlijn, indien beschikbaar */
  experimentSourceUrl?: string
  recommendedTracking: { symptoms: string[]; fields: string[] }
}

interface AiInput {
  stage:           Stage
  ageBand?:        string
  hrtStatus?:      string
  score:           CompassScore
  symptomsList:    string[]
  topConcern?:     string
  goal90d?:        string
  stressSources?:  string[]
  lang:            Lang
}

const STAGE_LABEL: Record<Lang, Record<Stage, string>> = {
  nl: {
    regular_cycle:           'regelmatige cyclus',
    irregular_cycle:         'onregelmatige cyclus / vermoedelijk perimenopauze',
    perimenopause_diagnosed: 'perimenopauze (vastgesteld)',
    postmenopause:           'postmenopauze',
    unknown:                 'cyclus-stadium onbekend',
  },
  en: {
    regular_cycle:           'regular cycle',
    irregular_cycle:         'irregular cycle / suspected perimenopause',
    perimenopause_diagnosed: 'perimenopause (diagnosed)',
    postmenopause:           'postmenopause',
    unknown:                 'cycle stage unknown',
  },
  fr: {
    regular_cycle:           'cycle régulier',
    irregular_cycle:         'cycle irrégulier / périménopause suspectée',
    perimenopause_diagnosed: 'périménopause (diagnostiquée)',
    postmenopause:           'post-ménopause',
    unknown:                 'stade du cycle inconnu',
  },
  de: {
    regular_cycle:           'regelmässiger Zyklus',
    irregular_cycle:         'unregelmässiger Zyklus / vermutete Perimenopause',
    perimenopause_diagnosed: 'Perimenopause (diagnostiziert)',
    postmenopause:           'Postmenopause',
    unknown:                 'Zyklus-Stadium unbekannt',
  },
}

const HRT_LABEL: Record<Lang, Record<string, string>> = {
  nl: { none: 'geen HRT',         considering: 'overweegt HRT',     using: 'gebruikt HRT',  stopped: 'HRT gestopt',  prefer_not_say: 'niet opgegeven' },
  en: { none: 'no HRT',           considering: 'considering HRT',   using: 'using HRT',     stopped: 'stopped HRT',  prefer_not_say: 'not disclosed'   },
  fr: { none: 'pas de THS',       considering: 'envisage le THS',   using: 'sous THS',      stopped: 'a arrêté le THS', prefer_not_say: 'non précisé'  },
  de: { none: 'keine HRT',        considering: 'erwägt HRT',        using: 'nutzt HRT',     stopped: 'HRT beendet',   prefer_not_say: 'nicht angegeben' },
}

/**
 * System-prompt per taal. Dezelfde structuur, alleen taal verschilt.
 * KEY-WIJZIGING t.o.v. v1: Claude moet `experimentCode` kiezen uit een
 * meegegeven library — niet zelf verzinnen. Dat geeft elke aanbeveling een
 * verifieerbare bron en voorkomt biohacker-tips zoals "koud handdoek bij bed".
 */
function buildSystem(lang: Lang): string {
  const libraryBlock = experimentsForPrompt()

  const langInstructions: Record<Lang, { lang: string; observationLabel: string; hypothesisLabel: string; experimentLabel: string }> = {
    nl: { lang: 'NEDERLANDS', observationLabel: '1 paragraaf van 3-5 zinnen die het patroon in de scores beschrijft, met expliciete koppeling tussen 2-3 dimensies. Geen advies hier.',
          hypothesisLabel: 'feitelijk geformuleerd, 1 zin',
          experimentLabel: 'lichte personalisatie van de gekozen library-tekst (max 1-2 zinnen extra context). Geef het zo terug dat het natuurlijk leest in het Nederlands.' },
    en: { lang: 'ENGLISH (US)', observationLabel: '1 paragraph of 3-5 sentences describing the pattern across the scores, explicitly connecting 2-3 dimensions. No advice here.',
          hypothesisLabel: 'factually formulated, 1 sentence',
          experimentLabel: 'light personalisation of the chosen library text (max 1-2 extra sentences of context). Return it so it reads naturally in English.' },
    fr: { lang: 'FRANÇAIS', observationLabel: '1 paragraphe de 3-5 phrases décrivant le schéma dans les scores, reliant explicitement 2-3 dimensions. Pas de conseil ici.',
          hypothesisLabel: 'formulée factuellement, 1 phrase',
          experimentLabel: 'légère personnalisation du texte de bibliothèque choisi (max 1-2 phrases supplémentaires de contexte). Retournez-le pour qu\'il se lise naturellement en français.' },
    de: { lang: 'DEUTSCH', observationLabel: '1 Absatz von 3-5 Sätzen, der das Muster in den Scores beschreibt und 2-3 Dimensionen explizit verknüpft. Hier keine Empfehlung.',
          hypothesisLabel: 'sachlich formuliert, 1 Satz',
          experimentLabel: 'leichte Personalisierung des gewählten Library-Textes (max 1-2 zusätzliche Kontextsätze). Gib es so zurück, dass es natürlich auf Deutsch liest.' },
  }

  const t = langInstructions[lang]

  return `You are a coach specialised in women's health and perimenopause. You analyse assessment results and formulate observations.

Tone: warm, direct, peer-to-peer. No jargon, no consultancy-speak. Second person ("you" / "je" / "vous" / "du").

ABSOLUTE RULES:
- NO medical diagnosis. Use words like "hypothesis", "pattern", "may indicate".
- NO medication or HRT proposals. Refer medical questions to GP/menopause specialist.
- Write all output in ${t.lang}.
- For the micro-experiment: you MUST choose ONE entry from the library below.
  Do NOT invent your own. Pick the entry whose 'when' description best matches
  this person's profile. Return its 'code' so we can verify and source it.

EXPERIMENT LIBRARY — choose exactly ONE 'code' from this list:

${libraryBlock}

OUTPUT FORMAT: one JSON object, no extra text, no markdown fences. Schema:

{
  "observation": "${t.observationLabel}",
  "hypotheses": [
    "Hypothesis 1 — ${t.hypothesisLabel}",
    "Hypothesis 2 — ${t.hypothesisLabel}",
    "Hypothesis 3 — ${t.hypothesisLabel}"
  ],
  "experimentCode": "code-from-library-above",
  "microExperiment": "${t.experimentLabel}",
  "recommendedTracking": {
    "symptoms": ["max 8 symptom codes from the person's selected symptoms most relevant to track"],
    "fields":   ["3-6 daily check-in fields — choose from: sleep, mood, stress, energy, hrt_taken, alcohol, busy_day, activity, nap"]
  }
}`
}

const SYSTEM_BY_LANG: Record<Lang, string> = {
  nl: buildSystem('nl'),
  en: buildSystem('en'),
  fr: buildSystem('fr'),
  de: buildSystem('de'),
}

const USER_INTRO: Record<Lang, string> = {
  nl: 'Hier zijn de assessment-resultaten:',
  en: 'Here are the assessment results:',
  fr: 'Voici les résultats de l\'évaluation :',
  de: 'Hier sind die Assessment-Ergebnisse:',
}

const FIELD_LABELS: Record<Lang, {
  stage: string; age: string; hrt: string; overall: string; perDim: string; symptoms: string;
  stress: string; concern: string; goal: string; instruction: string;
}> = {
  nl: { stage: 'Stadium', age: 'Leeftijd', hrt: 'HRT-status', overall: 'Overall score', perDim: 'Per dimensie', symptoms: 'Symptomen die ze regelmatig ervaart', stress: 'Stressbronnen', concern: 'Wat ze opgelost wil zien', goal: 'Haar 90-dagen doel', instruction: 'Genereer de JSON volgens het schema.' },
  en: { stage: 'Stage',   age: 'Age',      hrt: 'HRT status', overall: 'Overall score', perDim: 'Per dimension', symptoms: 'Symptoms experienced regularly',           stress: 'Stressors',     concern: 'What she wants resolved',  goal: 'Her 90-day goal',  instruction: 'Generate the JSON per the schema.' },
  fr: { stage: 'Stade',   age: 'Âge',      hrt: 'Statut THS', overall: 'Score global',  perDim: 'Par dimension',  symptoms: 'Symptômes ressentis régulièrement',         stress: 'Sources de stress', concern: 'Ce qu\'elle souhaite résoudre', goal: 'Son objectif à 90 jours', instruction: 'Générez le JSON selon le schéma.' },
  de: { stage: 'Stadium', age: 'Alter',    hrt: 'HRT-Status', overall: 'Gesamtwert',    perDim: 'Pro Dimension',  symptoms: 'Regelmässig erlebte Symptome',              stress: 'Stressquellen',    concern: 'Was sie gelöst sehen möchte',  goal: 'Ihr 90-Tage-Ziel',  instruction: 'Generiere das JSON gemäss Schema.' },
}

export async function generateCompassInsight(input: AiInput): Promise<CompassAiOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return fallback(input)

  const dimsLine = input.score.dimensions
    .map((d) => `- ${d.label}: ${d.score}/100`)
    .join('\n')

  const f = FIELD_LABELS[input.lang]
  const stageLabel = STAGE_LABEL[input.lang][input.stage]
  const hrtLine    = input.hrtStatus ? `**${f.hrt}:** ${HRT_LABEL[input.lang][input.hrtStatus] ?? input.hrtStatus}\n` : ''
  const ageLine    = input.ageBand ? `**${f.age}:** ${input.ageBand}\n` : ''

  const user = `${USER_INTRO[input.lang]}

**${f.stage}:** ${stageLabel}
${ageLine}${hrtLine}
**${f.overall}:** ${input.score.overall}/100 (${input.score.band})

**${f.perDim}:**
${dimsLine}

**${f.symptoms}:**
${input.symptomsList.length > 0 ? input.symptomsList.map((s) => `- ${s}`).join('\n') : '—'}

${input.stressSources && input.stressSources.length > 0 ? `**${f.stress}:** ${input.stressSources.join(', ')}\n` : ''}
${input.topConcern ? `**${f.concern}:** "${input.topConcern}"\n` : ''}
${input.goal90d    ? `**${f.goal}:** "${input.goal90d}"\n` : ''}

${f.instruction}`

  const client = new Anthropic({ apiKey })
  const ac = new AbortController()
  const t  = setTimeout(() => ac.abort(), TIMEOUT_MS)

  try {
    const resp = await client.messages.create(
      {
        model:       CLAUDE_MODEL,
        max_tokens:  MAX_TOKENS,
        temperature: 0.3,
        system:      SYSTEM_BY_LANG[input.lang],
        messages:    [{ role: 'user', content: user }],
      },
      { signal: ac.signal },
    )
    const block = resp.content.find((b) => b.type === 'text')
    const raw   = block && 'text' in block ? block.text : ''
    const json  = extractJson(raw)
    let parsed: Partial<CompassAiOutput>
    try { parsed = JSON.parse(json) }
    catch {
      try { parsed = JSON.parse(jsonrepair(json)) }
      catch { return fallback(input) }
    }
    // Experiment-code valideren tegen de library — als Claude iets verzonnen
    // heeft of de code ontbreekt, fall back op een veilige default per dominante
    // dimensie. We geven NOOIT een ongesourced experiment terug.
    const claimedCode = typeof parsed.experimentCode === 'string' ? parsed.experimentCode : ''
    const fromLibrary = getExperimentByCode(claimedCode)
    const exp         = fromLibrary ?? pickFallbackExperiment(input)

    // Als de library-text niet matcht met wat Claude heeft geschreven,
    // gebruiken we de library-text als bron-of-truth. Claude's tekst
    // wordt alleen geaccepteerd als het matcht (lichte personalisatie OK).
    const claudeText  = typeof parsed.microExperiment === 'string' ? parsed.microExperiment : ''
    const finalText   = claudeText.length > 20 && fromLibrary
      ? claudeText
      : exp.text

    return {
      observation:         typeof parsed.observation === 'string' ? parsed.observation : fallback(input).observation,
      hypotheses:          Array.isArray(parsed.hypotheses) && parsed.hypotheses.length >= 1
                            ? parsed.hypotheses.slice(0, 3).map(String)
                            : fallback(input).hypotheses,
      microExperiment:     finalText,
      experimentCode:      exp.code,
      experimentSource:    exp.source,
      experimentSourceUrl: exp.sourceUrl,
      recommendedTracking: parsed.recommendedTracking && typeof parsed.recommendedTracking === 'object'
                            ? {
                                symptoms: Array.isArray(parsed.recommendedTracking.symptoms)
                                          ? parsed.recommendedTracking.symptoms.slice(0, 8).map(String)
                                          : fallback(input).recommendedTracking.symptoms,
                                fields:   Array.isArray(parsed.recommendedTracking.fields)
                                          ? parsed.recommendedTracking.fields.slice(0, 6).map(String)
                                          : fallback(input).recommendedTracking.fields,
                              }
                            : fallback(input).recommendedTracking,
    }
  } catch {
    return fallback(input)
  } finally {
    clearTimeout(t)
  }
}

function extractJson(raw: string): string {
  const trimmed = raw.trim()
  const fenced  = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fenced) return fenced[1].trim()
  const first = trimmed.indexOf('{')
  const last  = trimmed.lastIndexOf('}')
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1)
  return trimmed
}

const FALLBACK_COPY: Record<Lang, {
  obsTpl: (overall: number, band: string, dimLabel: string, dimScore: number) => string
  hyps:   string[]
  exp:    string
}> = {
  nl: {
    obsTpl: (o, b, l, s) => `Je overall score is ${o}/100 (${b}). De grootste hefboom op dit moment lijkt ${l.toLowerCase()} te zijn (${s}/100).`,
    hyps: [
      'Verschillende dimensies versterken elkaar — verbetering in één dimensie kan andere meetrekken.',
      'Slaap is vaak de hoeksteen: zonder herstel zakken energie en stemming mee.',
      'Tracking maakt patronen zichtbaar die met geheugen alleen niet opvallen.',
    ],
    exp: 'Log 14 dagen lang elke ochtend in 60 seconden je slaap-kwaliteit, ochtendenergie en eventuele symptomen. Bekijk daarna je timeline.',
  },
  en: {
    obsTpl: (o, b, l, s) => `Your overall score is ${o}/100 (${b}). The biggest lever right now seems to be ${l.toLowerCase()} (${s}/100).`,
    hyps: [
      'Different dimensions reinforce each other — improvement in one can pull others up.',
      'Sleep is often the cornerstone: without recovery, energy and mood drop along with it.',
      'Tracking makes patterns visible that memory alone misses.',
    ],
    exp: 'For 14 days, log your sleep quality, morning energy and any symptoms each morning in 60 seconds. Then review your timeline.',
  },
  fr: {
    obsTpl: (o, b, l, s) => `Votre score global est ${o}/100 (${b}). Le levier principal actuellement semble être ${l.toLowerCase()} (${s}/100).`,
    hyps: [
      'Les différentes dimensions se renforcent mutuellement — une amélioration sur l\'une peut entraîner les autres.',
      'Le sommeil est souvent la pierre angulaire : sans récupération, énergie et humeur baissent avec.',
      'Le suivi rend visibles les schémas que la mémoire seule ne capte pas.',
    ],
    exp: 'Pendant 14 jours, notez chaque matin en 60 secondes votre qualité de sommeil, votre énergie matinale et vos éventuels symptômes. Puis examinez votre timeline.',
  },
  de: {
    obsTpl: (o, b, l, s) => `Dein Gesamtwert beträgt ${o}/100 (${b}). Der grösste Hebel scheint im Moment ${l.toLowerCase()} zu sein (${s}/100).`,
    hyps: [
      'Verschiedene Dimensionen verstärken sich gegenseitig — Verbesserung in einer kann andere mitziehen.',
      'Schlaf ist oft der Eckpfeiler: ohne Erholung sinken Energie und Stimmung mit.',
      'Tracking macht Muster sichtbar, die das Gedächtnis allein verpasst.',
    ],
    exp: 'Logge 14 Tage lang jeden Morgen in 60 Sekunden deine Schlafqualität, Morgenenergie und mögliche Symptome. Schau dir danach deine Timeline an.',
  },
}

/**
 * Kies een veilig fallback-experiment uit de library op basis van laagste
 * dimensie-score. Garandeert dat ELKE Compass altijd een gesourced experiment
 * teruggeeft, zelfs als Claude faalt of een onbekende code retourneert.
 */
function pickFallbackExperiment(input: AiInput) {
  const lowest = [...input.score.dimensions].sort((a, b) => a.score - b.score)[0]
  const dim = lowest?.dimension
  // Match dimensie → categorie in library
  if (dim === 'sleep_recovery')   return ALL_EXPERIMENTS.find((e) => e.code === 'sleep_regularity') ?? EXP_BASELINE_TRACK
  if (dim === 'energy_capacity')  return ALL_EXPERIMENTS.find((e) => e.code === 'morning_light')    ?? EXP_BASELINE_TRACK
  if (dim === 'stress_context')   return ALL_EXPERIMENTS.find((e) => e.code === '478_breathing')     ?? EXP_BASELINE_TRACK
  if (dim === 'lifestyle')        return ALL_EXPERIMENTS.find((e) => e.code === 'strength_2x_weekly') ?? EXP_BASELINE_TRACK
  if (dim === 'symptom_burden')   return ALL_EXPERIMENTS.find((e) => e.code === 'paced_breathing')    ?? EXP_BASELINE_TRACK
  return EXP_BASELINE_TRACK
}

function fallback(input: AiInput): CompassAiOutput {
  const lowest = [...input.score.dimensions].sort((a, b) => a.score - b.score)[0]
  const c   = FALLBACK_COPY[input.lang]
  const exp = pickFallbackExperiment(input)
  return {
    observation:         c.obsTpl(input.score.overall, input.score.band, lowest.label, lowest.score),
    hypotheses:          c.hyps,
    microExperiment:     exp.text,
    experimentCode:      exp.code,
    experimentSource:    exp.source,
    experimentSourceUrl: exp.sourceUrl,
    recommendedTracking: {
      symptoms: input.symptomsList.slice(0, 6),
      fields:   ['sleep', 'mood', 'energy', 'stress'],
    },
  }
}
