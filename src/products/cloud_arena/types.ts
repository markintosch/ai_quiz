// FILE: src/products/cloud_arena/types.ts
// ─── Cloud Arena product types ────────────────────────────────────────────────
//
// Cloud Arena is a live timed quiz game — fundamentally different from the
// diagnostic assessment flow. It does not use QuizProductConfig.
//
// Architecture:
//   Lobby  →  Active (timed questions)  →  Leaderboard  →  Review
//
// DB tables: arena_questions, arena_sessions, arena_participants, arena_answers

// ── Question ──────────────────────────────────────────────────────────────────

export interface ArenaOption {
  /** Single uppercase letter: 'A', 'B', 'C', 'D' */
  label: string
  /** Display text for this option */
  text: string
  /** Value stored in arena_answers.answer_value */
  value: string
}

export type ArenaDifficulty = 'easy' | 'medium' | 'hard'

export interface ArenaQuestion {
  id: string
  productKey: string
  questionText: string
  options: ArenaOption[]
  correctValue: string
  explanation?: string | null
  difficulty: ArenaDifficulty
  topic?: string | null
  aiGenerated: boolean
  active: boolean
}

// ── Session ───────────────────────────────────────────────────────────────────

export type ArenaSessionStatus = 'lobby' | 'active' | 'completed' | 'cancelled'

export interface ArenaSession {
  id: string
  companyId?: string | null
  joinCode: string
  hostName: string
  status: ArenaSessionStatus
  questionCount: number
  timePerQuestion: number   // seconds
  questions: ArenaQuestion[] // snapshot taken at session start
  startedAt?: string | null
  endedAt?: string | null
  createdAt: string
}

// ── Participant ───────────────────────────────────────────────────────────────

export interface ArenaParticipant {
  id: string
  sessionId: string
  displayName: string
  email?: string | null
  score: number
  rank?: number | null
  joinedAt: string
}

// ── Answer ────────────────────────────────────────────────────────────────────

export interface ArenaAnswer {
  id: string
  sessionId: string
  participantId: string
  questionIndex: number
  answerValue: string
  isCorrect: boolean
  timeTakenMs?: number | null
  points: number
}

// ── Scoring ───────────────────────────────────────────────────────────────────

export interface ArenaScoreConfig {
  /** Base points for a correct answer */
  basePoints: number
  /** Max extra points for speed (decreases linearly with time taken) */
  maxSpeedBonus: number
  /** Multipliers by difficulty */
  difficultyMultiplier: Record<ArenaDifficulty, number>
}

export function calculateArenaPoints(
  isCorrect: boolean,
  timeTakenMs: number,
  timePerQuestionMs: number,
  difficulty: ArenaDifficulty,
  config: ArenaScoreConfig
): number {
  if (!isCorrect) return 0
  const base = config.basePoints * config.difficultyMultiplier[difficulty]
  const speedRatio = Math.max(0, 1 - timeTakenMs / timePerQuestionMs)
  const speed = Math.round(config.maxSpeedBonus * speedRatio)
  return base + speed
}

// ── Arena config (product-level settings) ────────────────────────────────────

export interface ArenaConfig {
  /** Must match quiz_products.key in Supabase: 'cloud_arena' */
  key: string
  /** Display name */
  name: string
  /** Subdomain: 'arena' → arena.truefullstaq.nl */
  subdomain: string
  /** Default game settings — overridable per session */
  defaults: {
    questionCount: number
    timePerQuestion: number  // seconds
  }
  scoring: ArenaScoreConfig
  /** Join code format: length of random alphanumeric code */
  joinCodeLength: number
}
