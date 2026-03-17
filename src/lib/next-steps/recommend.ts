// Pure TypeScript — no framework dependencies. Determines which service to recommend
// and provides the full service definitions for the next-steps page.

export type ServiceKey =
  | 'intro_session'
  | 'intro_training'
  | 'ai_coding'
  | 'clevel_training'
  | 'custom_project'

export interface ServiceDefinition {
  key: ServiceKey
  title: string
  description: string
  audience: string
  destinationType: 'calendly' | 'subscribe' | 'form'
  /** Full Calendly URL (for calendly type) or relative path suffix (for subscribe/form) */
  destination: string
  ctaLabel: string
}

// ── Keyword lists ────────────────────────────────────────────────────────────

const CLEVEL_KEYWORDS = [
  'ceo', 'cto', 'coo', 'cfo', 'cpo', 'cso',
  'vp ', ' vp', 'vice president',
  'director', 'board', 'founder',
  'managing director', 'managing partner',
  'chief', 'partner',
]

const DEV_KEYWORDS = [
  'developer', 'engineer', 'architect',
  'devops', 'programmer', 'coder',
  'technical lead', 'tech lead',
  'full stack', 'fullstack', 'backend', 'frontend',
  'software', 'platform', 'infrastructure',
]

// ── Recommendation logic ─────────────────────────────────────────────────────

/**
 * Returns the recommended service key based on job title and quiz score.
 * Priority order: C-level > developer > high-score org > default intro session.
 */
export function recommendService(
  jobTitle: string,
  score: number,
  companyName: string
): ServiceKey {
  const jt = jobTitle.toLowerCase()

  if (CLEVEL_KEYWORDS.some(k => jt.includes(k))) return 'clevel_training'
  if (DEV_KEYWORDS.some(k => jt.includes(k))) return 'ai_coding'
  if (score >= 60 && companyName.trim().length > 0) return 'custom_project'
  return 'intro_session'
}

// ── Service definitions ──────────────────────────────────────────────────────

/**
 * Returns all 5 service definitions in canonical display order.
 * Called as a function so Calendly env vars are read at call time, not import time.
 */
export function getServiceDefinitions(): ServiceDefinition[] {
  const discoveryUrl =
    process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL ??
    'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'
  const strategyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_STRATEGY_URL ??
    'https://calendly.com/markiesbpm/ai-strategy-session'

  return [
    {
      key: 'intro_session',
      title: 'Introduction session',
      description:
        'A practical first conversation to interpret your result, explore the biggest opportunities or blockers, and discuss the most relevant next step for you, your team or your organisation.',
      audience: 'Individuals, small teams, and anyone looking for a clear first step',
      destinationType: 'calendly',
      destination: discoveryUrl,
      ctaLabel: 'Book an introduction session →',
    },
    {
      key: 'intro_training',
      title: 'Online introduction to AI',
      description:
        'A low-threshold training format for individuals or groups who want a practical introduction to AI, its applications and the opportunities it creates in everyday work.',
      audience: 'Individuals, teams, and organisations new to AI',
      destinationType: 'subscribe',
      destination: '/next-steps/intro-training',
      ctaLabel: 'Register your interest →',
    },
    {
      key: 'ai_coding',
      title: 'Hands-on self-coding with AI',
      description:
        'A practical training designed for people who want to build faster and smarter with AI in real coding workflows. Ideal for developers and technical professionals who want to move beyond theory.',
      audience: 'Developers, engineers and technically confident professionals',
      destinationType: 'subscribe',
      destination: '/next-steps/ai-coding',
      ctaLabel: 'Register your interest →',
    },
    {
      key: 'clevel_training',
      title: 'C-level and management team training',
      description:
        'Executive-focused sessions that help leadership teams build a shared understanding of AI, discuss opportunity and risk, and shape a realistic agenda for adoption, governance and action.',
      audience: 'Founders, board members, C-level teams and management',
      destinationType: 'calendly',
      destination: strategyUrl,
      ctaLabel: 'Book an executive exploration call →',
    },
    {
      key: 'custom_project',
      title: 'Custom AI projects and implementation',
      description:
        'Tailored support for organisations ready to move from AI strategy into execution — from opportunity mapping and roadmap development to use-case prioritisation, governance and implementation support.',
      audience: 'Organisations with a concrete AI challenge ready to be solved',
      destinationType: 'form',
      destination: '/next-steps/custom-project',
      ctaLabel: 'Tell us about your challenge →',
    },
  ]
}
