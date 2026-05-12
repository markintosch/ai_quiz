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

const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929'
const MAX_TOKENS   = 2500
const TIMEOUT_MS   = 90_000

export interface CompassAiOutput {
  observation:         string
  hypotheses:          string[]
  microExperiment:     string
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

const SYSTEM_BY_LANG: Record<Lang, string> = {
  nl: `Je bent een ervaren coach gespecialiseerd in vrouwengezondheid en de perimenopauze. Je analyseert assessment-resultaten en formuleert observaties en aanknopingspunten voor zelfregie.

Toon: warm, direct, peer-to-peer. Geen jargon, geen consultancy-taal, geen overdreven empathie. Schrijf in tweede persoon ("je").

ABSOLUTE REGELS:
- Geef GEEN medische diagnose. Gebruik woorden als "hypothese", "patroon", "kan wijzen op".
- Stel GEEN medicatie of HRT voor. Verwijs voor medische vragen naar huisarts/menopauze-arts.
- Schrijf in NEDERLANDS. Geen Engelse termen tenzij standaard (HRT, perimenopauze).
- Geen overdreven positieve toon. Geen disclaimers in elke zin.

OUTPUT FORMAT: één JSON-object, geen extra tekst, geen markdown-fences. Alle waarden in het Nederlands. Schema:

{
  "observation": "1 paragraaf van 3-5 zinnen. Beschrijft het patroon dat je in de scores ziet, met expliciete koppeling tussen 2-3 dimensies. Geen advies hier.",
  "hypotheses": [
    "Hypothese 1 — feitelijk geformuleerd, 1 zin",
    "Hypothese 2 — feitelijk geformuleerd, 1 zin",
    "Hypothese 3 — feitelijk geformuleerd, 1 zin"
  ],
  "microExperiment": "Eén concreet experiment voor de eerste 30 dagen. Maximaal 2 zinnen. Specifiek (welke handeling, welke frequentie). Iets wat niet meer dan 5 min/dag kost.",
  "recommendedTracking": {
    "symptoms": ["max 8 symptoom-codes uit de meegegeven lijst die voor deze persoon meest relevant zijn"],
    "fields":   ["3-6 daily-check-in velden — kies uit: sleep, mood, stress, energy, hrt_taken, alcohol, busy_day, activity, nap"]
  }
}`,

  en: `You are an experienced coach specialised in women's health and perimenopause. You analyse assessment results and formulate observations and starting points for self-direction.

Tone: warm, direct, peer-to-peer. No jargon, no consultancy-speak, no excessive empathy. Write in second person ("you").

ABSOLUTE RULES:
- Do NOT give a medical diagnosis. Use words like "hypothesis", "pattern", "may indicate".
- Do NOT propose medication or HRT. Refer medical questions to GP/menopause specialist.
- Write in ENGLISH (US). No corporate jargon ("synergy", "leverage", "deliverables" forbidden).
- No excessively positive tone. No disclaimers in every sentence.

OUTPUT FORMAT: one JSON object, no extra text, no markdown fences. All values in English. Schema:

{
  "observation": "1 paragraph of 3-5 sentences. Describes the pattern you see across the scores, explicitly connecting 2-3 dimensions. No advice here.",
  "hypotheses": [
    "Hypothesis 1 — factually formulated, 1 sentence",
    "Hypothesis 2 — factually formulated, 1 sentence",
    "Hypothesis 3 — factually formulated, 1 sentence"
  ],
  "microExperiment": "One concrete experiment for the first 30 days. Max 2 sentences. Specific (which action, which frequency). Something that takes no more than 5 min/day.",
  "recommendedTracking": {
    "symptoms": ["max 8 symptom codes from the provided list most relevant for this person"],
    "fields":   ["3-6 daily check-in fields — choose from: sleep, mood, stress, energy, hrt_taken, alcohol, busy_day, activity, nap"]
  }
}`,

  fr: `Vous êtes une coach expérimentée spécialisée dans la santé des femmes et la périménopause. Vous analysez les résultats d'évaluation et formulez des observations et des points de départ pour l'autonomie.

Ton : chaleureux, direct, de pair à pair. Pas de jargon, pas de langage de consultant, pas d'empathie excessive. Écrivez à la deuxième personne ("vous").

RÈGLES ABSOLUES :
- Ne donnez PAS de diagnostic médical. Utilisez des mots comme "hypothèse", "schéma", "peut indiquer".
- Ne proposez PAS de médication ni THS. Renvoyez les questions médicales au médecin/spécialiste de la ménopause.
- Écrivez en FRANÇAIS. Pas de jargon corporate.
- Pas de ton excessivement positif. Pas de disclaimers à chaque phrase.

FORMAT DE SORTIE : un objet JSON, pas de texte supplémentaire, pas de balises markdown. Toutes les valeurs en français. Schéma :

{
  "observation": "1 paragraphe de 3-5 phrases. Décrit le schéma que vous voyez dans les scores, en reliant explicitement 2-3 dimensions. Pas de conseil ici.",
  "hypotheses": [
    "Hypothèse 1 — formulée factuellement, 1 phrase",
    "Hypothèse 2 — formulée factuellement, 1 phrase",
    "Hypothèse 3 — formulée factuellement, 1 phrase"
  ],
  "microExperiment": "Une expérimentation concrète pour les 30 premiers jours. 2 phrases max. Spécifique (quelle action, quelle fréquence). Quelque chose qui prend max 5 min/jour.",
  "recommendedTracking": {
    "symptoms": ["max 8 codes de symptômes de la liste fournie les plus pertinents pour cette personne"],
    "fields":   ["3-6 champs de check-in quotidien — choisir parmi : sleep, mood, stress, energy, hrt_taken, alcohol, busy_day, activity, nap"]
  }
}`,

  de: `Du bist eine erfahrene Coach, spezialisiert auf Frauengesundheit und Perimenopause. Du analysierst Assessment-Ergebnisse und formulierst Beobachtungen und Ansatzpunkte für Selbstregie.

Ton: warm, direkt, auf Augenhöhe. Kein Jargon, keine Beratersprache, keine übertriebene Empathie. Schreibe in der zweiten Person ("du").

ABSOLUTE REGELN:
- Stelle KEINE medizinische Diagnose. Verwende Wörter wie "Hypothese", "Muster", "kann hindeuten auf".
- Schlage KEINE Medikamente oder HRT vor. Verweise medizinische Fragen an Hausarzt/Menopause-Spezialist.
- Schreibe auf DEUTSCH (Schweizer Orthografie OK falls passend). Kein Corporate-Jargon.
- Kein übertrieben positiver Ton. Keine Disclaimer in jedem Satz.

OUTPUT-FORMAT: ein JSON-Objekt, kein zusätzlicher Text, keine Markdown-Fences. Alle Werte auf Deutsch. Schema:

{
  "observation": "1 Absatz von 3-5 Sätzen. Beschreibt das Muster in den Scores, verknüpft 2-3 Dimensionen explizit. Hier keine Empfehlung.",
  "hypotheses": [
    "Hypothese 1 — sachlich formuliert, 1 Satz",
    "Hypothese 2 — sachlich formuliert, 1 Satz",
    "Hypothese 3 — sachlich formuliert, 1 Satz"
  ],
  "microExperiment": "Ein konkretes Experiment für die ersten 30 Tage. Max 2 Sätze. Spezifisch (welche Handlung, welche Frequenz). Etwas, das max 5 Min./Tag kostet.",
  "recommendedTracking": {
    "symptoms": ["max 8 Symptom-Codes aus der gegebenen Liste, die für diese Person am relevantesten sind"],
    "fields":   ["3-6 Daily-Check-in-Felder — wähle aus: sleep, mood, stress, energy, hrt_taken, alcohol, busy_day, activity, nap"]
  }
}`,
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
    return {
      observation:         typeof parsed.observation === 'string' ? parsed.observation : fallback(input).observation,
      hypotheses:          Array.isArray(parsed.hypotheses) && parsed.hypotheses.length >= 1
                            ? parsed.hypotheses.slice(0, 3).map(String)
                            : fallback(input).hypotheses,
      microExperiment:     typeof parsed.microExperiment === 'string' ? parsed.microExperiment : fallback(input).microExperiment,
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

function fallback(input: AiInput): CompassAiOutput {
  const lowest = [...input.score.dimensions].sort((a, b) => a.score - b.score)[0]
  const c = FALLBACK_COPY[input.lang]
  return {
    observation: c.obsTpl(input.score.overall, input.score.band, lowest.label, lowest.score),
    hypotheses:  c.hyps,
    microExperiment: c.exp,
    recommendedTracking: {
      symptoms: input.symptomsList.slice(0, 6),
      fields:   ['sleep', 'mood', 'energy', 'stress'],
    },
  }
}
