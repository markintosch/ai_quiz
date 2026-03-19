// Pure TypeScript — no framework dependencies.

export type ServiceKey =
  | 'intro_session'
  | 'intro_training'
  | 'ai_coding'
  | 'clevel_training'
  | 'custom_project'

export type ScoreBand = 'low' | 'mid' | 'high'

export function getScoreBand(score: number): ScoreBand {
  if (score < 40) return 'low'
  if (score < 66) return 'mid'
  return 'high'
}

export interface ServiceDefinition {
  key: ServiceKey
  title: string
  description: string
  audience: string
  format: string
  bestFor: string
  benefits: [string, string, string]
  trustCopy: string
  destinationType: 'calendly' | 'subscribe' | 'form'
  destination: string
  ctaLabel: string
}

export interface ServiceRecommendation {
  primary: ServiceKey
  secondary: ServiceKey
}

// ── Keyword lists ─────────────────────────────────────────────────────────────

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

// ── Recommendation logic ──────────────────────────────────────────────────────

export function recommendService(
  jobTitle: string,
  score: number,
  _companyName: string
): ServiceRecommendation {
  const jt = jobTitle.toLowerCase()
  const band = getScoreBand(score)
  const isClevel = CLEVEL_KEYWORDS.some(k => jt.includes(k))
  const isDev    = DEV_KEYWORDS.some(k => jt.includes(k))

  if (band === 'low') {
    if (isClevel) return { primary: 'clevel_training', secondary: 'intro_session' }
    return { primary: 'intro_session', secondary: 'intro_training' }
  }

  if (band === 'mid') {
    if (isClevel) return { primary: 'clevel_training', secondary: 'intro_training' }
    if (isDev)    return { primary: 'ai_coding',        secondary: 'intro_session' }
    return { primary: 'intro_training', secondary: 'intro_session' }
  }

  // high (≥ 66)
  if (isClevel) return { primary: 'clevel_training', secondary: 'custom_project' }
  return { primary: 'custom_project', secondary: 'clevel_training' }
}

// ── Why-this-fits copy ────────────────────────────────────────────────────────

export function getRecommendationWhy(key: ServiceKey, band: ScoreBand): string {
  const map: Record<ServiceKey, Record<ScoreBand, string>> = {
    intro_session: {
      low:  "A focused conversation is the fastest way to turn your result into a clear plan. We'll focus exactly on what matters for your situation.",
      mid:  "Even with AI activity already underway, a focused conversation helps you identify what to prioritise and where the real leverage is.",
      high: "A direct conversation lets us quickly map your specific challenge and identify the most impactful next step.",
    },
    intro_training: {
      low:  "Building a solid foundation helps you explore AI more confidently and avoid the most common early mistakes.",
      mid:  "Structured learning will help you scale what's working and close the gaps your assessment revealed.",
      high: "Team capability development is often the key bottleneck even for mature organisations — this closes that gap fast.",
    },
    ai_coding: {
      low:  "As a technical professional, hands-on experience is the most effective starting point. Skip the theory, go straight to practice.",
      mid:  "You're ready to integrate AI into real workflows. This training focuses on practical tools that immediately improve how you build.",
      high: "At your level, the competitive edge comes from depth of technical AI use. This session takes you further, faster.",
    },
    clevel_training: {
      low:  "Leadership alignment is often the first bottleneck in AI adoption. This session creates shared understanding and direction at the top.",
      mid:  "Leadership teams at this stage typically benefit most from a shared framework for governance, opportunity and realistic next steps.",
      high: "At your level of maturity, leadership capability and governance are the key enablers of compounding further advantage.",
    },
    custom_project: {
      low:  "You have a specific challenge and need a tailored approach — a short scoping conversation is the right first move.",
      mid:  "Your organisation has enough AI foundation to tackle a concrete challenge. A scoping session defines what's possible and how.",
      high: "Your assessment shows clear readiness to move from exploration to execution. A custom scoping session is the most direct next step.",
    },
  }
  return map[key][band]
}

// ── Service definitions ───────────────────────────────────────────────────────

export function getServiceDefinitions(): ServiceDefinition[] {
  const discoveryUrl =
    process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL ??
    'https://calendly.com/markiesbpm/ai-intro-meeting-mark-de-kock'
  const strategyUrl =
    process.env.NEXT_PUBLIC_CALENDLY_STRATEGY_URL ??
    'https://calendly.com/markiesbpm/ai-strategy-session'

  return [
    {
      key:             'intro_session',
      title:           'Introduction session',
      description:     'A focused first conversation to interpret your result, explore the key opportunities, and agree on the most relevant next step for you or your team.',
      audience:        'Individuals, small teams, or anyone looking for a clear first step',
      format:          'Online call',
      bestFor:         'Getting a personalised, practical first step based on your result',
      benefits:        ['30 minutes, tailored to your assessment result', 'No obligation — practical and direct', 'Suitable for individuals, teams and organisations'],
      trustCopy:       '30 minutes · No obligation · Practical and tailored',
      destinationType: 'calendly',
      destination:     discoveryUrl,
      ctaLabel:        'Book a 30-minute call',
    },
    {
      key:             'intro_training',
      title:           'Online introduction to AI',
      description:     'A practical training for individuals or groups who want a grounded introduction to AI and its real applications in everyday work.',
      audience:        'Teams and individuals new to AI',
      format:          'Online training',
      bestFor:         'Teams who want to build AI confidence quickly and practically',
      benefits:        ['Practical and grounded — focused on real work applications', 'Suitable for any team, no prior experience needed', 'Online and flexible to fit your schedule'],
      trustCopy:       'Online · Flexible timing · No prior AI experience needed',
      destinationType: 'subscribe',
      destination:     '/next-steps/intro-training',
      ctaLabel:        'Register for the next session',
    },
    {
      key:             'ai_coding',
      title:           'Hands-on AI coding',
      description:     'A practical training for developers and technical professionals who want to build faster and smarter with AI tools in real coding workflows.',
      audience:        'Developers, engineers and technical professionals',
      format:          'Online workshop',
      bestFor:         'Developers who want AI to become a genuine productivity multiplier',
      benefits:        ['Hands-on with real tools — no fluffy theory', 'Designed specifically for developers', 'Immediately applicable to daily workflows'],
      trustCopy:       'Hands-on · Built for developers · Practical tools only',
      destinationType: 'subscribe',
      destination:     '/next-steps/ai-coding',
      ctaLabel:        'Register for the next session',
    },
    {
      key:             'clevel_training',
      title:           'Leadership team session',
      description:     'Executive-focused sessions that build shared understanding of AI, define opportunity and risk, and shape a realistic adoption and governance agenda.',
      audience:        'Founders, C-level teams and management',
      format:          'Executive session or workshop',
      bestFor:         'Leadership teams who need shared direction on AI strategy',
      benefits:        ['Creates shared direction across your leadership team', 'Practical framework for AI governance and adoption', 'Custom to your sector, size and situation'],
      trustCopy:       'For leaders · Practical, not hype · Custom format available',
      destinationType: 'calendly',
      destination:     strategyUrl,
      ctaLabel:        'Book a 30-minute call',
    },
    {
      key:             'custom_project',
      title:           'Custom AI project',
      description:     'Tailored support for organisations ready to move from AI strategy into execution — from opportunity mapping and roadmap development to implementation.',
      audience:        'Organisations with a concrete AI challenge ready to solve',
      format:          'Custom engagement',
      bestFor:         'Organisations with a specific AI challenge and budget to move forward',
      benefits:        ['Scoped precisely to your challenge — no off-the-shelf packages', 'From strategy through to implementation support', 'Hands-on guidance from assessment to execution'],
      trustCopy:       'No generic approach · Scoped to your situation',
      destinationType: 'form',
      destination:     '/next-steps/custom-project',
      ctaLabel:        'Tell us about your challenge',
    },
  ]
}
