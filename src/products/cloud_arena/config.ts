// FILE: src/products/cloud_arena/config.ts
// ─── Cloud Arena product config ───────────────────────────────────────────────
//
// Cloud Arena is a live timed quiz game for cloud teams.
// It does NOT use QuizProductConfig — see types.ts for its own type.
//
// Subdomains: arena.truefullstaq.nl
//
// Phase 1: config skeleton — game engine and routes are Phase 2.

import type { ArenaConfig } from './types'

export const CLOUD_ARENA_CONFIG: ArenaConfig = {
  key:       'cloud_arena',
  name:      'Cloud Arena',
  subdomain: 'arena',

  defaults: {
    questionCount:    10,   // questions per game session
    timePerQuestion:  30,   // seconds per question
  },

  scoring: {
    basePoints:         100,
    maxSpeedBonus:       50,   // +50 for instant answer, 0 for last-second
    difficultyMultiplier: {
      easy:   1.0,
      medium: 1.5,
      hard:   2.0,
    },
  },

  joinCodeLength: 6,   // e.g. "CLOUD4" — alphanumeric, uppercase
}
