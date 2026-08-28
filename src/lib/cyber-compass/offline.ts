// FILE: src/lib/cyber-compass/offline.ts
// ─── Kill switch for the public HCSS / Cyber Compass content ──────────────────
//
// The feature stays in the codebase and the stored assessments stay in Supabase,
// but while this is true every public entry point (landing, assessment, results,
// OG image, the submit and contact APIs) returns 404, and crawlers are told to
// stay away. Nothing public resolves and nothing is advertised.
//
// To bring the public site back: set this to false. Nothing else needs changing.
export const HCSS_OFFLINE = true
