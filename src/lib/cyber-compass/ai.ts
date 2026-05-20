/**
 * HCSS Cyber Compass — Claude integration.
 *
 * Output:
 *   - observation:        1 paragraaf, herkenning van het patroon
 *   - riskObservations:   3 risico-bullets (specifiek, op basis van antwoorden)
 *   - quickWinCodes:      2 codes uit ALL_ACTIONS (Claude kiest, server valideert)
 *   - quickWinCustomText: optionele lichte personalisatie van library-tekst
 *   - specialistDimension: 1 dimensie waar Diederik bij moet helpen
 */

import Anthropic from '@anthropic-ai/sdk'
import { jsonrepair } from 'jsonrepair'
import type { CompassScore } from './scoring'
import type { Lang } from './i18n'
import { ALL_ACTIONS, getActionByCode, actionsForPrompt, SPECIALIST_TOPICS, type ActionCategory } from './actions'

const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929'
const MAX_TOKENS   = 2500
const TIMEOUT_MS   = 90_000

export interface CompassQuickWin {
  code:      string
  title:     string
  text:      string
  rationale: string
  source:    string
  sourceUrl?: string
  effort:    string
}

export interface CompassAiOutput {
  observation:         string
  riskObservations:    string[]            // exact 3
  quickWins:           CompassQuickWin[]   // exact 2
  specialistDimension: ActionCategory
  specialistTopic:     string
  specialistReason:    string
}

interface AiInput {
  organisationName?: string
  organisationSize?: string
  sector?:           string
  role?:             string
  score:             CompassScore
  topConcern?:       string
  lang:              Lang
}

const SECTOR_LABEL: Record<string, string> = {
  finance: 'financiële dienstverlening', healthcare: 'zorg & welzijn', industry: 'industrie',
  retail: 'retail', tech: 'IT/software', logistics: 'transport & logistiek',
  professional: 'zakelijke dienstverlening', government: 'overheid', nonprofit: 'non-profit',
  education: 'onderwijs', hospitality: 'horeca', other: 'overige sector',
}

function buildSystem(lang: Lang): string {
  const lib = actionsForPrompt()
  const tone = lang === 'nl'
    ? 'Schrijf in NEDERLANDS. Direct, concreet, MKB-relevant. Geen IT-jargon. Geen verkooppraatje.'
    : 'Write in ENGLISH. Direct, concrete, SME-relevant. No IT jargon. No sales pitch.'

  const observationLabel = lang === 'nl'
    ? '2-4 zinnen die het patroon in de scores beschrijven, met expliciete koppeling tussen 2 dimensies. Geen advies. Geen lijstjes.'
    : '2-4 sentences describing the pattern across the scores, explicitly connecting 2 dimensions. No advice. No lists.'

  const riskLabel = lang === 'nl'
    ? 'feitelijk geformuleerd, gespecificeerd voor deze respondent (niet generiek), 1 zin per item. Gebruik woorden als "lijkt", "kan wijzen op", "vergroot het risico op".'
    : 'factually formulated, specific to this respondent (not generic), 1 sentence per item. Use words like "appears", "may indicate", "increases risk of".'

  return `Je bent een ervaren cybersecurity-adviseur voor het MKB (Hammer Cyber Security Services / Diederik Hammer). Je analyseert assessment-resultaten en formuleert eerlijke observaties.

Toon: warm, direct, peer-to-peer voor MT-leden en directeurs. ${tone}

ABSOLUTE REGELS:
- Geen FUD (fear/uncertainty/doubt). Risico's noemen, niet uitvergroten.
- Quick wins: kies ALLEEN uit de meegegeven library. Niet zelf verzinnen.
- Specialist topic: 1 dimensie waar professionele begeleiding écht meerwaarde geeft (niet voor alles!).
- Schrijf voor een directeur die geen tijd heeft voor uitleg over technische basics.

QUICK WINS LIBRARY — kies 2 codes (max) hier uit, gebaseerd op:
1. Welke 2 dimensies hebben de laagste scores?
2. Welke acties uit die categorieën passen bij de "when" beschrijving?
3. Vermijd elkaar overlappende quick wins (geen 2x backup, geen 2x IAM).

${lib}

OUTPUT FORMAT: één JSON-object, geen extra tekst, geen markdown-fences. Schema:

{
  "observation": "${observationLabel}",
  "riskObservations": [
    "Risico 1 — ${riskLabel}",
    "Risico 2 — ${riskLabel}",
    "Risico 3 — ${riskLabel}"
  ],
  "quickWinCodes": ["code-uit-library", "code-uit-library"],
  "specialistDimension": "<one of: iam | awareness | data | endpoint | backup | compliance | supply_chain>",
  "specialistReason": "1-2 zinnen waarom dit specifiek voor deze respondent een specialist-onderwerp is. Niet generiek."
}`
}

export async function generateCompassInsight(input: AiInput): Promise<CompassAiOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return fallback(input)

  const dimsLine = input.score.dimensions
    .map((d) => `- ${d.label}: ${d.score}/100 (gewicht ${d.weight}%)`)
    .join('\n')

  const sectorLabel = input.sector ? SECTOR_LABEL[input.sector] ?? input.sector : '—'

  const user = `Hier zijn de assessment-resultaten:

${input.organisationName ? `**Organisatie:** ${input.organisationName}\n` : ''}**Grootte:** ${input.organisationSize ?? '—'}
**Sector:** ${sectorLabel}
${input.role ? `**Rol invuller:** ${input.role}\n` : ''}
**Overall score:** ${input.score.overall}/100 (${input.score.band})

**Per dimensie:**
${dimsLine}

${input.topConcern ? `**Eigen zorg:** "${input.topConcern}"\n` : ''}
Genereer de JSON volgens schema.`

  const client = new Anthropic({ apiKey })
  const ac = new AbortController()
  const t  = setTimeout(() => ac.abort(), TIMEOUT_MS)

  try {
    const resp = await client.messages.create(
      { model: CLAUDE_MODEL, max_tokens: MAX_TOKENS, temperature: 0.3,
        system: buildSystem(input.lang),
        messages: [{ role: 'user', content: user }] },
      { signal: ac.signal },
    )
    const block = resp.content.find((b) => b.type === 'text')
    const raw   = block && 'text' in block ? block.text : ''
    const json  = extractJson(raw)
    let parsed: {
      observation?:         string
      riskObservations?:    string[]
      quickWinCodes?:       string[]
      specialistDimension?: string
      specialistReason?:    string
    }
    try { parsed = JSON.parse(json) }
    catch {
      try { parsed = JSON.parse(jsonrepair(json)) }
      catch { return fallback(input) }
    }

    // Valideer quick-win codes tegen library
    const validQuickWins: CompassQuickWin[] = []
    if (Array.isArray(parsed.quickWinCodes)) {
      for (const code of parsed.quickWinCodes.slice(0, 2)) {
        const a = getActionByCode(String(code))
        if (a) {
          validQuickWins.push({
            code: a.code, title: a.title, text: a.text,
            rationale: a.rationale, source: a.source, sourceUrl: a.sourceUrl, effort: a.effort,
          })
        }
      }
    }
    // Fallback bij minder dan 2 valide codes
    while (validQuickWins.length < 2) {
      const fb = pickFallbackQuickWin(input, validQuickWins.map((q) => q.code))
      validQuickWins.push({
        code: fb.code, title: fb.title, text: fb.text,
        rationale: fb.rationale, source: fb.source, sourceUrl: fb.sourceUrl, effort: fb.effort,
      })
    }

    // Specialist dimension valideren
    const validDims: ActionCategory[] = ['iam','awareness','data','endpoint','backup','compliance','supply_chain']
    const specialistDim = (parsed.specialistDimension && validDims.includes(parsed.specialistDimension as ActionCategory))
      ? parsed.specialistDimension as ActionCategory
      : pickFallbackSpecialist(input)
    const specialistMeta = SPECIALIST_TOPICS[specialistDim]

    return {
      observation:         typeof parsed.observation === 'string' ? parsed.observation : fallback(input).observation,
      riskObservations:    Array.isArray(parsed.riskObservations) && parsed.riskObservations.length >= 1
                            ? parsed.riskObservations.slice(0, 3).map(String)
                            : fallback(input).riskObservations,
      quickWins:           validQuickWins,
      specialistDimension: specialistDim,
      specialistTopic:     specialistMeta.topic,
      specialistReason:    typeof parsed.specialistReason === 'string' && parsed.specialistReason.length > 20
                            ? parsed.specialistReason
                            : specialistMeta.reason,
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

function pickFallbackQuickWin(input: AiInput, exclude: string[]) {
  // Pak 2 zwakste dimensies, kies eerste action uit die categorie die niet al in exclude zit
  const sorted = [...input.score.dimensions].sort((a, b) => a.score - b.score)
  for (const d of sorted) {
    const cat = d.dimension as ActionCategory
    const candidate = ALL_ACTIONS.find((a) => a.category === cat && !exclude.includes(a.code))
    if (candidate) return candidate
  }
  // Last resort
  return ALL_ACTIONS[0]
}

function pickFallbackSpecialist(input: AiInput): ActionCategory {
  const lowest = [...input.score.dimensions].sort((a, b) => a.score - b.score)[0]
  return (lowest?.dimension as ActionCategory) ?? 'iam'
}

function fallback(input: AiInput): CompassAiOutput {
  const lowest = [...input.score.dimensions].sort((a, b) => a.score - b.score)[0]
  const lowestLabel = lowest?.label ?? 'meerdere dimensies'

  const obs = input.lang === 'nl'
    ? `Je overall score is ${input.score.overall}/100 (${input.score.band}). De grootste opening voor verbetering ligt bij ${lowestLabel.toLowerCase()} (${lowest?.score ?? 0}/100). Kleine stappen daar kunnen snel zichtbaar effect hebben op je totale weerbaarheid.`
    : `Your overall score is ${input.score.overall}/100 (${input.score.band}). The biggest opening for improvement is in ${lowestLabel.toLowerCase()} (${lowest?.score ?? 0}/100). Small steps there can quickly affect your overall resilience.`

  const risks = input.lang === 'nl' ? [
    'Verschillende dimensies versterken elkaar — een gat in IAM vergroot het risico van ontbrekende awareness en backup-onzekerheid.',
    'Compliance-onzekerheid maakt incidenten duurder achteraf (boetes, claims), zelfs als de techniek op orde is.',
    'Supply-chain risico is moeilijk zelf in te schatten zonder gerichte audit van leveranciers.',
  ] : [
    'Different dimensions reinforce each other — a gap in IAM increases the risk of missing awareness and backup uncertainty.',
    'Compliance uncertainty makes incidents more expensive afterwards (fines, claims), even if technology is in order.',
    'Supply-chain risk is hard to assess yourself without a targeted vendor audit.',
  ]

  const fb1 = pickFallbackQuickWin(input, [])
  const fb2 = pickFallbackQuickWin(input, [fb1.code])

  const dim = pickFallbackSpecialist(input)

  return {
    observation: obs,
    riskObservations: risks,
    quickWins: [
      { code: fb1.code, title: fb1.title, text: fb1.text, rationale: fb1.rationale, source: fb1.source, sourceUrl: fb1.sourceUrl, effort: fb1.effort },
      { code: fb2.code, title: fb2.title, text: fb2.text, rationale: fb2.rationale, source: fb2.source, sourceUrl: fb2.sourceUrl, effort: fb2.effort },
    ],
    specialistDimension: dim,
    specialistTopic:     SPECIALIST_TOPICS[dim].topic,
    specialistReason:    SPECIALIST_TOPICS[dim].reason,
  }
}
